import React from 'react';
import { Play, Grid, HelpCircle, Settings as SettingsIcon, Sparkles } from 'lucide-react';

interface MainMenuProps {
  unlockedLevel: number;
  onPlay: () => void;
  onLevelSelect: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  unlockedLevel,
  onPlay,
  onLevelSelect,
  onHowToPlay,
  onSettings,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-gradient-to-b from-slate-950 via-sky-950 to-slate-950 select-none">
      {/* Animated Deep Space Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Nebula Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Decorative Floating Planet */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-sky-400 via-indigo-600 to-slate-900 border border-sky-400/30 shadow-2xl opacity-80 animate-pulse" />
      </div>

      {/* Top Bar / Brand header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Uzay Macerası</span>
        </div>
        <button
          onClick={onSettings}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 shadow-lg transition-colors cursor-pointer"
          aria-label="Ayarlar"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center: Game Logo & Hero Spaceship Illustration */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Cartoon Hero Spaceship Vector Illustration with Idle Floating Animation */}
        <div className="relative mb-6 animate-bounce" style={{ animationDuration: '3.5s' }}>
          <svg width="140" height="140" viewBox="0 0 100 100" className="drop-shadow-[0_10px_25px_rgba(56,189,248,0.4)]">
            {/* Engine Flame */}
            <path d="M42 75 Q50 98 58 75 Z" fill="url(#mainFlameGrad)" />
            {/* Wings */}
            <path d="M50 15 L88 65 L72 75 L50 70 L28 75 L12 65 Z" fill="url(#mainWingGrad)" stroke="#bae6fd" strokeWidth="2" />
            {/* Wing Accents */}
            <polygon points="18,65 32,58 35,66 22,70" fill="#f59e0b" />
            <polygon points="82,65 68,58 65,66 78,70" fill="#f59e0b" />
            {/* Hull */}
            <path d="M50 10 Q68 40 50 72 Q32 40 50 10 Z" fill="url(#mainHullGrad)" stroke="#cbd5e1" strokeWidth="2" />
            {/* Cockpit Glass */}
            <ellipse cx="50" cy="38" rx="8" ry="16" fill="url(#mainGlassGrad)" />
            <ellipse cx="48" cy="34" rx="3" ry="8" fill="rgba(255,255,255,0.8)" />

            <defs>
              <linearGradient id="mainFlameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="mainWingGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="mainHullGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="mainGlassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#083344" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-pink-300 drop-shadow-md mb-2">
          GEZEGENLER ARASI
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-medium text-sky-200/90 tracking-wide max-w-md">
          Galaksinin son yolculuğu başlıyor!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-xl pb-4">
        {/* Primary Play Button */}
        <button
          onClick={onPlay}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base md:text-lg rounded-2xl shadow-xl shadow-sky-500/25 border border-sky-300/40 hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>OYNA (BÖLÜM {unlockedLevel})</span>
        </button>

        {/* Level Select */}
        <button
          onClick={onLevelSelect}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm md:text-base rounded-2xl border border-slate-700 shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Grid className="w-5 h-5 text-sky-400" />
          <span>SEVİYE SEÇ</span>
        </button>

        {/* How to play */}
        <button
          onClick={onHowToPlay}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm md:text-base rounded-2xl border border-slate-700 shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>NASIL OYNANIR?</span>
        </button>
      </div>
    </div>
  );
};
