import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, LevelConfig, SaveData, GameSettings, WeaponType } from './types/game';
import { LEVELS, PLANETARY_REGIONS } from './constants/levels';
import { GameEngine } from './game/GameEngine';
import { GameRenderer } from './game/renderer';
import { soundManager } from './audio/soundManager';

import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { StoryModal } from './components/StoryModal';
import { PauseMenu } from './components/PauseMenu';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelClearModal } from './components/LevelClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { OrientationWarning } from './components/OrientationWarning';
import { DebugPanel } from './components/DebugPanel';

const SAVE_STORAGE_KEY = 'gezegenler-arasi-save-v1';

const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.8,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  screenShake: true,
  reducedMotion: false,
  mouseSensitivity: 1.0,
};

const DEFAULT_SAVE_DATA: SaveData = {
  unlockedLevel: 1,
  levelStars: {},
  highScore: 0,
  bestCombo: 0,
  totalAsteroids: 0,
  settings: DEFAULT_SETTINGS,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Persistence State
  const [saveData, setSaveData] = useState<SaveData>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SAVE_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SAVE_DATA;
  });

  // Flow State
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(saveData.unlockedLevel || 1);
  const [previousState, setPreviousState] = useState<GameState>('MAIN_MENU');

  // Stats / Results
  const [levelClearStats, setLevelClearStats] = useState<{
    score: number;
    asteroidsDestroyed: number;
    maxCombo: number;
    damageTaken: number;
    timeSeconds: number;
    stars: number;
  } | null>(null);

  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    asteroidsDestroyed: number;
    levelReached: number;
  } | null>(null);

  // HUD and Reactive UI Updates
  const [objectiveCurrent, setObjectiveCurrent] = useState(0);
  const [objectiveTarget, setObjectiveTarget] = useState(1);
  const [tutorialHint, setTutorialHint] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [debugMode, setDebugMode] = useState(false);

  // Check URL params for debug
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') {
      setDebugMode(true);
    }
  }, []);

  // Save changes to LocalStorage
  const persistSaveData = useCallback((updater: (prev: SaveData) => SaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Update Settings
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<GameSettings>) => {
      persistSaveData((prev) => {
        const updated = { ...prev.settings, ...newSettings };
        soundManager.updateVolumes(updated.soundVolume, updated.musicVolume, updated.sfxVolume);
        if (engineRef.current) {
          engineRef.current.settings = updated;
        }
        return { ...prev, settings: updated };
      });
    },
    [persistSaveData]
  );

  // Current Level Configuration
  const currentLevelConfig = LEVELS.find((lvl) => lvl.id === currentLevelId) || LEVELS[0];

  // Start Level Engine
  const startLevel = useCallback(
    (
      levelId: number,
      carriedState?: {
        score: number;
        weapon: WeaponType;
        powerLevel: number;
        lives: number;
        combo: number;
      }
    ) => {
      const config = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      setCurrentLevelId(levelId);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      const engine = new GameEngine(width, height, config, saveData.settings, {
        onLevelComplete: (stats) => {
          setLevelClearStats(stats);
          persistSaveData((prev) => {
            const nextUnlocked = Math.max(prev.unlockedLevel, Math.min(20, stats.levelId + 1));
            const existingStars = prev.levelStars[stats.levelId] || 0;
            const updatedStars = {
              ...prev.levelStars,
              [stats.levelId]: Math.max(existingStars, stats.stars),
            };
            const updatedHighScore = Math.max(prev.highScore, stats.score);
            const updatedBestCombo = Math.max(prev.bestCombo, stats.maxCombo);
            const totalAsteroids = prev.totalAsteroids + stats.asteroidsDestroyed;

            return {
              ...prev,
              unlockedLevel: nextUnlocked,
              levelStars: updatedStars,
              highScore: updatedHighScore,
              bestCombo: updatedBestCombo,
              totalAsteroids,
            };
          });

          if (stats.levelId >= 20) {
            setGameState('VICTORY');
            soundManager.playVictory();
          }
        },
        onLevelAdvance: (nextLevelId) => {
          setCurrentLevelId(nextLevelId);
        },
        onGameOver: (stats) => {
          setGameOverStats(stats);
          setGameState('GAME_OVER');
        },
        onWeaponChange: (_weapon: WeaponType) => {
          if (levelId === 1) {
            setTutorialHint('Mükemmel! Silahın değişti.');
            setTimeout(() => setTutorialHint(null), 2500);
          }
        },
        onPowerUp: (level: number) => {
          if (levelId === 1) {
            setTutorialHint(`Güç Artışı: Seviye ${level}!`);
            setTimeout(() => setTutorialHint(null), 2500);
          }
        },
        onObjectiveUpdate: (current, target) => {
          setObjectiveCurrent(current);
          setObjectiveTarget(target);
        },
      });

      // Apply carried state if continuing seamlessly
      if (carriedState) {
        engine.player.score = carriedState.score;
        engine.player.currentWeapon = carriedState.weapon;
        engine.player.powerLevel = carriedState.powerLevel;
        engine.player.lives = carriedState.lives;
        engine.player.combo = carriedState.combo;
      }

      engineRef.current = engine;
      engine.start();
      setGameState('PLAYING');

      // Level 1 tutorial prompts
      if (levelId === 1 && !carriedState) {
        setTutorialHint('Uzay gemini hareket ettirmek için fareyi oynat.');
        setTimeout(() => {
          setTutorialHint('Ateş etmek için fareyi basılı tut veya BOŞLUK tuşuna bas!');
          setTimeout(() => {
            setTutorialHint(null);
          }, 4000);
        }, 3500);
      }
    },
    [saveData.settings, persistSaveData]
  );

  // Initialize Story Briefing before starting level
  const launchLevelWithBriefing = useCallback(
    (levelId: number) => {
      setCurrentLevelId(levelId);
      const config = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      if (config.briefing && config.briefing.length > 0) {
        setGameState('STORY_BRIEFING');
      } else {
        startLevel(levelId);
      }
    },
    [startLevel]
  );

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameRenderer(ctx, canvas.width, canvas.height);
    rendererRef.current = renderer;

    let animId = 0;
    let frameCount = 0;
    let fpsTimer = performance.now();

    const renderLoop = (time: number) => {
      // FPS calculation
      frameCount++;
      if (time - fpsTimer >= 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      const engine = engineRef.current;
      const region =
        PLANETARY_REGIONS[currentLevelConfig.regionId] || PLANETARY_REGIONS.EARTH_ORBIT;

      let shakeX = 0;
      let shakeY = 0;

      if (engine && gameState === 'PLAYING') {
        const shake = engine.update(time);
        shakeX = shake.shakeX;
        shakeY = shake.shakeY;
      }

      ctx.save();
      if (shakeX !== 0 || shakeY !== 0) {
        ctx.translate(shakeX, shakeY);
      }

      renderer.clear();

      // 1. Background (Pure deep space, no round planet)
      const stars = engine ? engine.stars : [];
      const warpSpeed = engine ? engine.warpSpeedMultiplier : 1.0;
      renderer.renderBackground(region, stars, warpSpeed, time / 1000);

      if (engine) {
        // 2. Checkpoint Finish Line (Hiper Geçiş Çizgisi)
        renderer.renderFinishLine(engine.finishLine, time / 1000);

        // 3. Projectiles
        renderer.renderProjectiles(engine.projectiles, time / 1000);

        // 4. Collectibles
        renderer.renderCollectibles(engine.collectibles, time / 1000);

        // 5. Asteroids
        renderer.renderAsteroids(engine.asteroids);

        // 6. Enemies
        renderer.renderEnemies(engine.enemies, time / 1000);

        // 7. Boss (Rival Spaceships & Major Bosses)
        renderer.renderBoss(engine.boss, time / 1000);

        // 8. Player (with hyperspace plume when crossing line)
        renderer.renderPlayer(engine.player, warpSpeed, time / 1000);

        // 9. Particles
        renderer.renderParticles(engine.particles);

        // 10. Floating Texts
        renderer.renderFloatingTexts(engine.floatingTexts);
      }

      ctx.restore();

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, currentLevelConfig]);

  // Window Resize & Canvas Scaling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      if (rendererRef.current) {
        rendererRef.current.resize(width, height);
      }
      if (engineRef.current) {
        engineRef.current.resize(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ambient music lifecycle
  useEffect(() => {
    soundManager.startAmbientMusic();
    return () => soundManager.stopAmbientMusic();
  }, []);

  // Pointer & Keyboard Controls
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!engineRef.current || gameState !== 'PLAYING') return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      engineRef.current.updatePointerTarget(e.clientX, e.clientY, rect);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.target !== canvasRef.current) return;
      if (!engineRef.current || gameState !== 'PLAYING') return;
      engineRef.current.setFiring(true);
    };

    const handlePointerUp = () => {
      if (!engineRef.current) return;
      engineRef.current.setFiring(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (engineRef.current && gameState === 'PLAYING') {
          engineRef.current.setFiring(true);
        }
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (engineRef.current) {
          engineRef.current.setFiring(false);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Background Canvas for High Performance 60 FPS Rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />

      {/* IN-GAME HUD OVERLAY */}
      {gameState === 'PLAYING' && engineRef.current && (
        <HUD
          player={engineRef.current.player}
          levelConfig={currentLevelConfig}
          boss={engineRef.current.boss}
          finishLineActive={!!engineRef.current.finishLine?.active}
          objectiveCurrent={objectiveCurrent}
          objectiveTarget={objectiveTarget}
          showTutorialHint={tutorialHint}
          onPause={() => {
            engineRef.current?.pause();
            setGameState('PAUSED');
          }}
        />
      )}

      {/* MAIN MENU */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          unlockedLevel={saveData.unlockedLevel}
          onPlay={() => launchLevelWithBriefing(saveData.unlockedLevel)}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onSettings={() => {
            setPreviousState('MAIN_MENU');
            setGameState('SETTINGS');
          }}
        />
      )}

      {/* LEVEL SELECT */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelect
          unlockedLevel={saveData.unlockedLevel}
          levelStars={saveData.levelStars}
          onSelectLevel={(levelId) => launchLevelWithBriefing(levelId)}
          onBack={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* STORY BRIEFING */}
      {gameState === 'STORY_BRIEFING' && (
        <StoryModal
          levelConfig={currentLevelConfig}
          dialogues={currentLevelConfig.briefing}
          onComplete={() => startLevel(currentLevelId)}
        />
      )}

      {/* PAUSE MENU */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => {
            engineRef.current?.resume();
            setGameState('PLAYING');
          }}
          onRestart={() => startLevel(currentLevelId)}
          onSettings={() => {
            setPreviousState('PAUSED');
            setGameState('SETTINGS');
          }}
          onHome={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* SETTINGS MODAL */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setGameState(previousState)}
          onResetProgress={() => {
            persistSaveData(() => DEFAULT_SAVE_DATA);
            setCurrentLevelId(1);
            setGameState('MAIN_MENU');
          }}
        />
      )}

      {/* HOW TO PLAY */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setGameState('MAIN_MENU')} />
      )}

      {/* LEVEL CLEAR MODAL (Fallback/Manual Navigation) */}
      {gameState === 'LEVEL_CLEAR' && levelClearStats && (
        <LevelClearModal
          levelConfig={currentLevelConfig}
          stats={levelClearStats}
          hasNextLevel={currentLevelId < 20}
          onNextLevel={() => launchLevelWithBriefing(currentLevelId + 1)}
          onRestart={() => startLevel(currentLevelId)}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
        />
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && gameOverStats && (
        <GameOverModal
          score={gameOverStats.score}
          asteroidsDestroyed={gameOverStats.asteroidsDestroyed}
          levelReached={gameOverStats.levelReached}
          onRestart={() => startLevel(currentLevelId)}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onHome={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* VICTORY MODAL */}
      {gameState === 'VICTORY' && levelClearStats && (
        <VictoryModal
          score={levelClearStats.score}
          totalAsteroids={saveData.totalAsteroids}
          onRestart={() => launchLevelWithBriefing(1)}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onHome={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* ORIENTATION PROMPT FOR MOBILE PORTRAIT */}
      <OrientationWarning />

      {/* DEVELOPER DEBUG PANEL */}
      {debugMode && <DebugPanel engine={engineRef.current} fps={fps} />}
    </main>
  );
}
