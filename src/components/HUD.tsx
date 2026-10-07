import React from 'react';
import { Boss, PlayerState, LevelConfig } from '../types/game';
import { WEAPON_DEFINITIONS } from '../constants/weapons';
import { Pause, Shield, Zap, Magnet, Sparkles } from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  levelConfig: LevelConfig;
  boss: Boss | null;
  finishLineActive?: boolean;
  objectiveCurrent: number;
  objectiveTarget: number;
  onPause: () => void;
  showTutorialHint?: string | null;
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
}) => {
  const currentWeaponInfo = WEAPON_DEFINITIONS[player.currentWeapon];
  const objPct = Math.min(100, Math.max(0, (objectiveCurrent / (objectiveTarget || 1)) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 md:p-6">
      {/* TOP ROW: Level, Objective, Boss Bar, Score, Lives, Pause */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Level & Objective */}
        <div className="flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">
              BÖLÜM {levelConfig.id}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-200">{levelConfig.name}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300 truncate max-w-[180px] md:max-w-none">
                {finishLineActive ? '⚡ Geçiş çizgisi bekleniyor...' : levelConfig.objective.labelTr}
              </span>
              <span className="text-sky-300 font-bold tabular-nums ml-3">
                {objectiveCurrent} / {objectiveTarget}
              </span>
            </div>
            <div className="w-44 md:w-56 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${objPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Center: Boss Health Bar (if active) */}
        {boss && (
          <div className="flex flex-col items-center bg-rose-950/85 backdrop-blur-md px-5 py-2.5 rounded-xl border border-rose-600/70 shadow-xl animate-pulse">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
              <span>⚠️ {boss.name}</span>
              <span>·</span>
              <span className="text-amber-400">FAZ {boss.phase}</span>
            </div>
            <div className="w-56 md:w-80 h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-500/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-150"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Finish Line Notice */}
        {finishLineActive && !boss && (
          <div className="flex items-center gap-2 bg-sky-950/90 backdrop-blur-md px-5 py-2 rounded-xl border border-sky-400 shadow-xl shadow-sky-950/50 animate-bounce">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs md:text-sm font-black text-sky-200 uppercase tracking-wide">
              ÇİZGİYİ GEÇEREK BÖLÜMÜ BİTİR!
            </span>
          </div>
        )}

        {/* Top Right: Score, Combo, Lives, Pause Button */}
        <div className="flex items-center gap-3">
          {/* Score & Combo */}
          <div className="flex flex-col items-end bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">PUAN</span>
              <span className="text-base md:text-lg font-extrabold text-white tracking-wide tabular-nums">
                {player.score.toLocaleString()}
              </span>
            </div>
            {player.combo > 1 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 animate-bounce">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>KOMBO x{player.combo}</span>
              </div>
            )}
          </div>

          {/* Lives */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-3 py-3 rounded-xl border border-slate-700/60 shadow-lg">
            {Array.from({ length: player.maxLives }).map((_, idx) => (
              <span
                key={idx}
                className={`text-base md:text-lg transition-transform ${
                  idx < player.lives ? 'text-red-500 scale-100' : 'text-slate-600 scale-75'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600/60 shadow-lg transition-colors cursor-pointer"
            aria-label="Oyunu Duraklat"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CENTER: Interactive Tutorial Hint if present */}
      {showTutorialHint && (
        <div className="self-center bg-sky-950/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-sky-400/80 text-sky-100 text-sm md:text-base font-semibold shadow-2xl animate-pulse text-center">
          ✨ {showTutorialHint}
        </div>
      )}

      {/* BOTTOM ROW: Active Weapon & Power Level */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Active Weapon */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/60 shadow-xl">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shadow-md border border-white/30"
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
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              AKTİF SİLAH
            </span>
            <span className="text-sm md:text-base font-bold text-white">
              {currentWeaponInfo.nameTr}
            </span>
          </div>

          {/* Buff Icons */}
          <div className="flex items-center gap-1.5 ml-2">
            {player.shieldTime > 0 && (
              <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-400/40 animate-pulse">
                <Shield className="w-4 h-4" />
              </div>
            )}
            {player.magnetTime > 0 && (
              <div className="p-1.5 bg-pink-500/20 text-pink-400 rounded-lg border border-pink-400/40 animate-pulse">
                <Magnet className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Power Level Triangles */}
        <div className="flex flex-col items-end bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/60 shadow-xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1">
            GÜÇ SEVİYESİ {player.powerLevel} / 5
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`w-5 h-5 flex items-center justify-center font-bold text-xs transition-transform ${
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
