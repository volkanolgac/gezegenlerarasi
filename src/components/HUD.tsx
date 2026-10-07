import React from 'react';
import { Boss, PlayerState, LevelConfig } from '../types/game';
import { WEAPON_DEFINITIONS } from '../constants/weapons';
import { Pause, Shield, Zap, Magnet, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  levelConfig: LevelConfig;
  boss: Boss | null;
  finishLineActive?: boolean;
  objectiveCurrent: number;
  objectiveTarget: number;
  onPause: () => void;
  showTutorialHint?: string | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  levelConfig,
  boss,
  finishLineActive,
  objectiveCurrent,
  objectiveTarget,
  onPause,
  showTutorialHint,
  isFullscreen,
  onToggleFullscreen,
}) => {
  // Real-time synchronization loop to guarantee hearts, score, and combo update immediately
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    let animId: number;
    const loop = () => {
      setTick((prev) => (prev + 1) % 10000);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const currentWeaponInfo = WEAPON_DEFINITIONS[player.currentWeapon];
  const objPct = Math.min(100, Math.max(0, (objectiveCurrent / (objectiveTarget || 1)) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2.5 sm:p-4 md:p-6 z-20">
      {/* TOP ROW: Level, Objective, Boss Bar, Score, Lives, Controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-between w-full gap-2">
        {/* Top Left: Level & Objective */}
        <div className="flex flex-col gap-1 bg-slate-900/85 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-700/60 shadow-lg shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-sky-400 uppercase">
              BÖLÜM {levelConfig.id}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate max-w-[90px] sm:max-w-none">
              {levelConfig.name}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex justify-between text-[10px] sm:text-xs font-medium">
              <span className="text-slate-300 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                {finishLineActive ? '⚡ Geçiş çizgisi bekleniyor' : levelConfig.objective.labelTr}
              </span>
              <span className="text-sky-300 font-bold tabular-nums ml-2">
                {objectiveCurrent} / {objectiveTarget}
              </span>
            </div>
            <div className="w-28 sm:w-44 md:w-56 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${objPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Center: Boss Health Bar (if active) */}
        {boss && (
          <div className="order-last sm:order-none w-full sm:w-auto flex flex-col items-center bg-rose-950/85 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl border border-rose-600/70 shadow-xl animate-pulse">
            <div className="flex items-center gap-2 text-rose-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
              <span className="truncate max-w-[140px] sm:max-w-none">⚠️ {boss.name}</span>
              <span>·</span>
              <span className="text-amber-400">FAZ {boss.phase}</span>
            </div>
            <div className="w-full sm:w-56 md:w-80 h-2 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-500/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-150"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Finish Line Notice */}
        {finishLineActive && !boss && (
          <div className="order-last sm:order-none w-full sm:w-auto flex items-center justify-center gap-1.5 bg-sky-950/90 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-sky-400 shadow-xl shadow-sky-950/50 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            <span className="text-[11px] sm:text-xs md:text-sm font-black text-sky-200 uppercase tracking-wide text-center">
              ÇİZGİYİ GEÇEREK BÖLÜMÜ BİTİR!
            </span>
          </div>
        )}

        {/* Top Right: Score, Combo, Lives, Fullscreen & Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
          {/* Score & Combo */}
          <div className="flex flex-col items-end bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-[9px] sm:text-xs font-medium text-slate-400">PUAN</span>
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide tabular-nums">
                {player.score.toLocaleString()}
              </span>
            </div>
            {player.combo > 1 && (
              <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-400 animate-bounce">
                <Zap className="w-3 h-3 fill-amber-400" />
                <span>x{player.combo}</span>
              </div>
            )}
          </div>

          {/* Lives - Dynamically render only existing active lives (up to 5) */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/85 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-700/60 shadow-lg min-h-[36px] sm:min-h-[42px]">
            {player.lives > 0 ? (
              <div className="flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: player.lives }).map((_, idx) => (
                  <span
                    key={idx}
                    className="text-base sm:text-lg md:text-xl inline-block text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] select-none transition-all duration-200"
                    title={`Can: ${player.lives}/5`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-red-400 select-none">
                0 CAN
              </span>
            )}
          </div>

          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="pointer-events-auto p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-600/60 shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Tam Ekran"
              title="Tam Ekran"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600/60 shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Oyunu Duraklat"
            title="Duraklat"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* CENTER: Interactive Tutorial Hint if present */}
      {showTutorialHint && (
        <div className="self-center bg-sky-950/90 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-sky-400/80 text-sky-100 text-xs sm:text-sm md:text-base font-semibold shadow-2xl animate-pulse text-center max-w-[90vw]">
          ✨ {showTutorialHint}
        </div>
      )}

      {/* BOTTOM ROW: Active Weapon & Power Level */}
      <div className="flex items-end justify-between w-full gap-2">
        {/* Bottom Left: Active Weapon */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-slate-700/60 shadow-xl">
          <div
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm shadow-md border border-white/30 shrink-0"
            style={{ backgroundColor: currentWeaponInfo.color, color: '#0f172a' }}
          >
            {player.currentWeapon === 'DOUBLE'
              ? '2x'
              : player.currentWeapon === 'TRIPLE'
              ? '3x'
              : player.currentWeapon === 'SPREAD'
              ? '❖'
              : player.currentWeapon === 'PLASMA'
              ? '●'
              : player.currentWeapon === 'BEAM'
              ? '⚡'
              : '1x'}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
              SİLAH
            </span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[100px] sm:max-w-none">
              {currentWeaponInfo.nameTr}
            </span>
          </div>

          {/* Buff Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2">
            {player.shieldTime > 0 && (
              <div
                className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/50 shadow-sm animate-pulse"
                title={`Kalkan: ${Math.ceil(player.shieldTime)} saniye`}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                <span className="text-[10px] sm:text-xs font-bold tabular-nums">
                  {Math.ceil(player.shieldTime)}s
                </span>
              </div>
            )}
            {player.magnetTime > 0 && (
              <div
                className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-pink-500/20 text-pink-300 rounded-lg border border-pink-400/50 shadow-sm animate-pulse"
                title={`Mıknatıs: ${Math.ceil(player.magnetTime)} saniye`}
              >
                <Magnet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
                <span className="text-[10px] sm:text-xs font-bold tabular-nums">
                  {Math.ceil(player.magnetTime)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Power Level Triangles */}
        <div className="flex flex-col items-end bg-slate-900/85 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-slate-700/60 shadow-xl">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-0.5 sm:mb-1">
            GÜÇ {player.powerLevel}/5
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-transform ${
                  lvl <= player.powerLevel
                    ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'text-slate-600 scale-90'
                }`}
              >
                ▲
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
