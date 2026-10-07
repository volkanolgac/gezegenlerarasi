import React from 'react';
import { ArrowLeft, Lock, Star, AlertTriangle } from 'lucide-react';
import { LEVELS, PLANETARY_REGIONS } from '../constants/levels';

interface LevelSelectProps {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  unlockedLevel,
  levelStars,
  onSelectLevel,
  onBack,
}) => {
  // Group levels by region
  const regionIds = ['EARTH_ORBIT', 'VOLCANIC', 'ICE', 'NEBULA', 'DARK_GALAXY', 'FINAL_PLANET'];

  return (
    <div className="relative w-full h-full min-h-[100dvh] flex flex-col p-3 sm:p-6 md:p-8 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4 sm:mb-6 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-semibold">ANA MENÜ</span>
        </button>

        <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase text-center">
          SEVİYE SEÇİMİ
        </h2>

        <div className="text-[11px] sm:text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 sm:px-3 py-1.5 rounded-lg border border-sky-800">
          AÇILAN: {Math.min(20, unlockedLevel)}/20
        </div>
      </div>

      {/* Regions Grid */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6 pb-12">
        {regionIds.map((regId) => {
          const region = PLANETARY_REGIONS[regId];
          const regionLevels = LEVELS.filter((lvl) => lvl.regionId === regId);

          return (
            <div
              key={regId}
              className="bg-slate-900/60 rounded-2xl p-3.5 sm:p-5 border border-slate-800/80 shadow-lg"
            >
              {/* Region Title & Color Bar */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: region.primaryColor }}
                  />
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                    {region.nameTr}
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:inline truncate max-w-xs">
                  {region.descriptionTr}
                </span>
              </div>

              {/* Level Nodes - Responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {regionLevels.map((lvl) => {
                  const isUnlocked = lvl.id <= unlockedLevel;
                  const stars = levelStars[lvl.id] || 0;
                  const isCurrent = lvl.id === unlockedLevel;

                  return (
                    <button
                      key={lvl.id}
                      disabled={!isUnlocked}
                      onClick={() => onSelectLevel(lvl.id)}
                      className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isUnlocked
                          ? isCurrent
                            ? 'bg-gradient-to-b from-sky-900/90 to-indigo-950/90 border-sky-400 shadow-lg shadow-sky-500/20 scale-102 hover:scale-105'
                            : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 hover:border-slate-500 hover:scale-102 active:scale-98'
                          : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Boss Badge */}
                      {lvl.hasBoss && (
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] font-extrabold text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-800">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>LİDER</span>
                        </div>
                      )}

                      {/* Level Number or Lock */}
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 mb-1.5 sm:mb-2 border border-slate-700">
                        {isUnlocked ? (
                          <span className="text-sm sm:text-base font-black text-white">{lvl.id}</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                        )}
                      </div>

                      {/* Level Name */}
                      <span className="text-[11px] sm:text-xs font-bold text-slate-200 text-center truncate w-full mb-1">
                        {lvl.name}
                      </span>

                      {/* Stars */}
                      {isUnlocked && (
                        <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                          {[1, 2, 3].map((starNum) => (
                            <Star
                              key={starNum}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                starNum <= stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
