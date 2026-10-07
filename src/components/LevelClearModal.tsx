import React from 'react';
import { Star, Play, RotateCcw, Grid } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface LevelClearStats {
  score: number;
  asteroidsDestroyed: number;
  maxCombo: number;
  damageTaken: number;
  timeSeconds: number;
  stars: number;
}

interface LevelClearModalProps {
  levelConfig: LevelConfig;
  stats: LevelClearStats;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  levelConfig,
  stats,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onLevelSelect,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-sky-500/40 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header */}
        <span className="text-xs font-black tracking-widest text-sky-400 uppercase mb-1">
          BÖLÜM {levelConfig.id}
        </span>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4 uppercase">
          BÖLÜM TAMAMLANDI!
        </h2>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 md:w-10 md:h-10 transition-all ${
                starIdx <= stats.stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110'
                  : 'text-slate-700 scale-90'
              }`}
            />
          ))}
        </div>

        {/* Performance Stats */}
        <div className="w-full bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-6 flex flex-col gap-2.5 text-xs font-semibold">
          <div className="flex justify-between text-slate-300">
            <span>Kazanılan Puan:</span>
            <span className="text-sky-300 font-extrabold text-sm tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Yok Edilen Asteroit:</span>
            <span className="text-slate-100 tabular-nums">{stats.asteroidsDestroyed}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>En Yüksek Kombo:</span>
            <span className="text-amber-400 font-bold tabular-nums">x{stats.maxCombo}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Alınan Hasar:</span>
            <span className="text-rose-400 tabular-nums">{stats.damageTaken} Darbe</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tamamlama Süresi:</span>
            <span className="text-slate-100 tabular-nums">{stats.timeSeconds} Saniye</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base rounded-xl shadow-lg border border-sky-300/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>SONRAKİ BÖLÜM</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={onRestart}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>TEKRAR OYNA</span>
            </button>

            <button
              onClick={onLevelSelect}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>SEVİYE SEÇ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
