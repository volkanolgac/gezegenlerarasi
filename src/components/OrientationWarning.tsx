import React from 'react';
import { Smartphone } from 'lucide-react';

export const OrientationWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] hidden portrait:flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 text-center select-none">
      <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center mb-6 border border-sky-400/40 animate-pulse">
        <Smartphone className="w-10 h-10 text-sky-400 rotate-90" />
      </div>

      <h2 className="text-xl md:text-2xl font-black text-white uppercase mb-2">
        CİHAZINIZI YATAY ÇEVİRİNİZ
      </h2>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        Gezegenler Arası uzay macerası en iyi yatay ekran deneyimi için tasarlanmıştır.
      </p>
    </div>
  );
};
