import React from 'react';
import { RotateCcw, Grid, Home, Trophy, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  totalAsteroids: number;
  onRestart: () => void;
  onLevelSelect: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  totalAsteroids,
  onRestart,
  onLevelSelect,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 rounded-3xl border border-sky-400/50 p-6 md:p-10 shadow-2xl flex flex-col items-center text-center">
        {/* Trophy & Sparkles */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/50 shadow-xl shadow-amber-500/20 animate-bounce">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-sky-300 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-200 to-pink-300 mb-3 uppercase">
          GALAKSİ KURTARILDI!
        </h2>

        {/* Narrative */}
        <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-6 max-w-md">
          Nova, insanlığın uzaydaki en uzak yolculuğunu tamamladı. Kozmik Fırtına Çekirdeği imha edildi ve tüm gezegen sistemleri yeniden huzura kavuştu.
        </p>

        {/* Total stats */}
        <div className="w-full bg-slate-900/80 rounded-2xl p-4 border border-slate-700/80 mb-6 flex flex-col gap-2.5 text-xs font-semibold">
          <div className="flex justify-between text-slate-300">
            <span>Toplam Galaksi Skoru:</span>
            <span className="text-amber-300 font-extrabold text-base tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Temizlenen Toplam Asteroit:</span>
            <span className="text-sky-300 font-bold tabular-nums">{totalAsteroids}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tamamlanan Seviyeler:</span>
            <span className="text-emerald-400 font-bold tabular-nums">20 / 20 Bölüm (TÜMÜ)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-300/40 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>YENİDEN OYNA (BÖLÜM 1)</span>
          </button>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onLevelSelect}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>SEVİYE SEÇ</span>
            </button>

            <button
              onClick={onHome}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ANA MENÜ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
