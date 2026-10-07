import React, { useState } from 'react';
import { StoryDialogue, LevelConfig } from '../types/game';
import { ArrowRight, Play, FastForward } from 'lucide-react';

interface StoryModalProps {
  levelConfig: LevelConfig;
  dialogues: StoryDialogue[];
  isDebriefing?: boolean;
  onComplete: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  levelConfig,
  dialogues,
  isDebriefing = false,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDialogue = dialogues[currentIndex] || dialogues[0];
  const isLast = currentIndex >= dialogues.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-sky-500/40 p-6 md:p-8 shadow-2xl shadow-sky-950/50 flex flex-col justify-between">
        {/* Header with Level tag & Skip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-sky-400 uppercase">
              BÖLÜM {levelConfig.id}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-300">
              {isDebriefing ? 'GÖREV SONRASI RAPORU' : 'GÖREV BİLGİLENDİRMESİ'}
            </span>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>GEÇ</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dialogue Card */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar Icon Box */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {currentDialogue.avatar}
          </div>

          {/* Speaker & Content */}
          <div className="flex flex-col flex-1">
            <span className="text-sm font-extrabold text-sky-300 uppercase tracking-wide mb-1">
              {currentDialogue.speakerNameTr}
            </span>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              "{currentDialogue.textTr}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{dialogues.length}</span>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 border border-sky-300/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{isLast ? (isDebriefing ? 'DEVAM ET' : 'GÖREVE BAŞLA') : 'SONRAKİ'}</span>
            {isLast ? <Play className="w-4 h-4 fill-white" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
