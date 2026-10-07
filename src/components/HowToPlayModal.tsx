import React from 'react';
import { X, MousePointer, Space, Sparkles, Shield, Magnet, Zap } from 'lucide-react';
import { WEAPON_DEFINITIONS } from '../constants/weapons';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            NASIL OYNANIR?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-6 text-slate-200 text-sm">
          {/* Controls */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
              1. TEMEL KONTROLLER
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <MousePointer className="w-6 h-6 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Fare / Dokunmatik</div>
                  <div className="text-xs text-slate-400">
                    Uzay aracını ekranda pürüzsüzce yönlendirir.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <Space className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Boşluk / Sol Tık (Basılı Tut)</div>
                  <div className="text-xs text-slate-400">
                    Sürekli ve kesintisiz lazer ateşi açar.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weapons & Orbs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
              2. SİLAH GÜÇ TOPLARI (SİLAHINI DEĞİŞTİR)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Uzaydan süzülen parıldayan dairesel güç toplarını toplayarak aktif silahını değiştir:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(WEAPON_DEFINITIONS).map((wep) => (
                <div
                  key={wep.type}
                  className="flex flex-col p-2.5 rounded-xl border bg-slate-900/80"
                  style={{ borderColor: `${wep.color}60` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: wep.color }}
                    />
                    <span className="font-bold text-xs text-white">{wep.nameTr}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    {wep.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Triangles & Specials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              3. GÜÇ ÜÇGENLERİ & ÖZEL BONUSLAR
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <div className="text-amber-400 text-lg font-black shrink-0">▲</div>
                <div>
                  <div className="font-bold text-white text-xs">Güç Üçgeni (Lv 1 - 5)</div>
                  <div className="text-xs text-slate-400">
                    Silahının hasarını, mermi sayısını ve atış hızını artırır.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <Shield className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Enerji Kalkanı</div>
                  <div className="text-xs text-slate-400">
                    Geçici olarak göktaşları ve düşman ateşlerinden korur.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <Magnet className="w-5 h-5 text-pink-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Manyetik Çekim</div>
                  <div className="text-xs text-slate-400">
                    Tüm güç kristallerini ve kürelerini gemine doğru çeker.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
                <Zap className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Mega Bomba & Can</div>
                  <div className="text-xs text-slate-400">
                    Bomba tüm küçük asteroitleri patlatır. Kalpler canını yeniler.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            ANLADIM, BAŞLA!
          </button>
        </div>
      </div>
    </div>
  );
};
