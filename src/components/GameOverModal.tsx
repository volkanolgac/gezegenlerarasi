import React from 'react';
import { RotateCcw, Grid, Home } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  asteroidsDestroyed: number;
  levelReached: number;
  onRestart: () => void;
  onLevelSelect: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  asteroidsDestroyed,
  levelReached,
  onRestart,
  onLevelSelect,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-rose-600/40 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header */}
        <div className="text-4xl mb-2">💥</div>
        <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
          MACERA BURADA BİTMEDİ!
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          Kalkanlar tükendi ama Nova her zaman yeniden kalkışa hazır!
        </p>

        {/* Stats */}
        <div className="w-full bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-6 flex flex-col gap-2.5 text-xs font-semibold">
          <div className="flex justify-between text-slate-300">
            <span>Toplam Puan:</span>
            <span className="text-sky-300 font-extrabold text-sm tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Ulaşılan Seviye:</span>
            <span className="text-slate-100 tabular-nums">Bölüm {levelReached}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Yok Edilen Asteroit:</span>
            <span className="text-slate-100 tabular-nums">{asteroidsDestroyed}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-extrabold text-base rounded-xl shadow-lg border border-rose-300/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>KALDIĞIN YERDEN DEVAM ET (BÖLÜM {levelReached})</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={onLevelSelect}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>SEVİYE SEÇ</span>
            </button>

            <button
              onClick={onHome}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
