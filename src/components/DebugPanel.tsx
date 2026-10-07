import React from 'react';
import { GameEngine } from '../game/GameEngine';

interface DebugPanelProps {
  engine: GameEngine | null;
  fps: number;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ engine, fps }) => {
  if (!engine) return null;

  return (
    <div className="absolute bottom-4 left-4 z-40 bg-black/85 backdrop-blur-md p-3 rounded-lg border border-emerald-500/50 text-[11px] font-mono text-emerald-400 pointer-events-none select-none flex flex-col gap-0.5 shadow-2xl">
      <div className="font-bold text-emerald-300 mb-1 border-b border-emerald-900 pb-0.5">
        🛠️ GEZEGENLER ARASI DEBUG
      </div>
      <div>FPS: <span className="text-white tabular-nums">{fps}</span></div>
      <div>
        GEMİ: <span className="text-white tabular-nums">{Math.round(engine.player.x)}, {Math.round(engine.player.y)}</span>
      </div>
      <div>
        SİLAH: <span className="text-sky-300">{engine.player.currentWeapon}</span> (Lv {engine.player.powerLevel})
      </div>
      <div>
        SEVİYE: <span className="text-white">{engine.levelConfig.id}</span> ({engine.levelConfig.name})
      </div>
      <div>
        ASTEROİT: <span className="text-white tabular-nums">{engine.asteroids.length}</span>
      </div>
      <div>
        MERMİ: <span className="text-white tabular-nums">{engine.projectiles.length}</span>
      </div>
      <div>
        DÜŞMAN: <span className="text-white tabular-nums">{engine.enemies.length}</span>
      </div>
      <div>
        PARÇACIK: <span className="text-white tabular-nums">{engine.particles.length}</span>
      </div>
    </div>
  );
};
