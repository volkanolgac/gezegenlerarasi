import React from 'react';
import { Play, RotateCcw, Settings as SettingsIcon, Home, Maximize2, Minimize2 } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onHome: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onSettings,
  onHome,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700 p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center my-auto">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-4 sm:mb-6 uppercase">
          OYUN DURAKLATILDI
        </h2>

        <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg border border-sky-300/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>DEVAM ET</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TEKRAR OYNA</span>
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="w-full py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4 text-sky-400" />}
              <span>{isFullscreen ? 'TAM EKRANDAN ÇIK' : 'TAM EKRAN YAP'}</span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onSettings}
            className="w-full py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-600 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 text-sky-400" />
            <span>AYARLAR</span>
          </button>

          {/* Home */}
          <button
            onClick={onHome}
            className="w-full py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-800 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>ANA MENÜ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
