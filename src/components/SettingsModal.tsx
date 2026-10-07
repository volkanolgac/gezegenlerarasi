import React from 'react';
import { GameSettings } from '../types/game';
import { X, Volume2, Music, Sparkles, Maximize2, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onResetProgress?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetProgress,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">AYARLAR</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Toggles */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Sound Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Genel Ses Düzeyi</span>
              </div>
              <span className="tabular-nums text-slate-400">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Müzik Düzeyi</span>
              </div>
              <span className="tabular-nums text-slate-400">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ses Efektleri</span>
              </div>
              <span className="tabular-nums text-slate-400">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Mouse Sensitivity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Fare Hassasiyeti</span>
              <span className="tabular-nums text-slate-400">{settings.mouseSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                settings.screenShake
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span>Ekran Sarsıntısı</span>
              <span>{settings.screenShake ? 'AÇIK' : 'KAPALI'}</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                settings.reducedMotion
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span>Azaltılmış Hareket</span>
              <span>{settings.reducedMotion ? 'AÇIK' : 'KAPALI'}</span>
            </button>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-600 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Tam Ekran Geçişi</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          {onResetProgress && (
            <button
              onClick={() => {
                if (window.confirm('Tüm oyun ilerlemesini sıfırlamak istediğinden emin misin?')) {
                  onResetProgress();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>İlerlemeyi Sıfırla</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            KAYDET & KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
