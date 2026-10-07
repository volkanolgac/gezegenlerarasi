import {
  Asteroid,
  Boss,
  Collectible,
  Enemy,
  FinishLine,
  FloatingText,
  Particle,
  PlanetaryRegion,
  PlayerState,
  Projectile,
  Star,
} from '../types/game';
import { WEAPON_COLORS, WEAPON_DEFINITIONS } from '../constants/weapons';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // 1. Render Pure Deep Space Background: Cosmic Gradients, Parallax Stars & Nebulae (NO PLANET)
  public renderBackground(
    region: PlanetaryRegion,
    stars: Star[],
    warpSpeedMultiplier: number,
    time: number
  ) {
    const ctx = this.ctx;

    // Deep Space Cosmic Void Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, region.bgGradient[0]);
    bgGrad.addColorStop(1, region.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Ambient Cosmic Dust / Nebula Clouds
    ctx.save();
    const nebulaGrad1 = ctx.createRadialGradient(
      this.width * 0.3,
      this.height * 0.4,
      50,
      this.width * 0.3,
      this.height * 0.4,
      this.width * 0.6
    );
    nebulaGrad1.addColorStop(0, `${region.primaryColor}18`);
    nebulaGrad1.addColorStop(0.6, `${region.secondaryColor}08`);
    nebulaGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad1;
    ctx.fillRect(0, 0, this.width, this.height);

    const nebulaGrad2 = ctx.createRadialGradient(
      this.width * 0.8,
      this.height * 0.7,
      40,
      this.width * 0.8,
      this.height * 0.7,
      this.width * 0.5
    );
    nebulaGrad2.addColorStop(0, `${region.secondaryColor}15`);
    nebulaGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad2;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    // Parallax Stars with Warp Stretching
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = Math.sin(time * 3 + i) * 0.25 + 0.75;
      const alpha = s.alpha * twinkle;

      if (warpSpeedMultiplier > 1.5) {
        // Hyperspace Warp Lines
        const lineLen = s.speed * 0.15 * warpSpeedMultiplier;
        ctx.strokeStyle = `rgba(224, 242, 254, ${Math.min(1, alpha * 1.5)})`;
        ctx.lineWidth = s.size * 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + lineLen);
        ctx.stroke();
      } else {
        // Normal Twinkling Stars
        ctx.fillStyle = s.color || `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 2. Render Checkpoint Finish Line (Hiper Geçit Çizgisi)
  public renderFinishLine(finishLine: FinishLine | null, time: number) {
    if (!finishLine || !finishLine.active) return;
    const ctx = this.ctx;
    const y = finishLine.y;

    ctx.save();
    // Neon Energy Pulse
    const pulse = Math.sin(time * 10) * 0.2 + 0.8;

    // Glowing Wide Area Scrim
    const lineGrad = ctx.createLinearGradient(0, y - 30, 0, y + 30);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
    lineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, y - 30, this.width, 60);

    // Laser Core Beam
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4 * pulse;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();

    // Inner White Core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Side Checkpoint Pylons
    [-1, 1].forEach((dir) => {
      const px = dir === -1 ? 25 : this.width - 25;
      ctx.beginPath();
      ctx.arc(px, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Checkpoint Text Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8;
    ctx.fillText('⚡ BÖLÜM GEÇİŞ ÇİZGİSİ ⚡', this.width / 2, y - 16);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // 3. Render Spaceship "Nova"
  public renderPlayer(player: PlayerState, warpSpeedMultiplier: number, time: number) {
    const ctx = this.ctx;
    const { x, y, tilt, invulnerableTime, shieldTime, magnetTime } = player;

    // Invulnerability Flashing
    if (invulnerableTime > 0 && Math.floor(time * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // Engine Thrusters & Flame Animation (Hyper boost when warping)
    const baseFlameH = warpSpeedMultiplier > 1.5 ? 45 : 20;
    const flameH = baseFlameH + Math.sin(time * 30) * 8;
    const flameGrad = ctx.createLinearGradient(0, 20, 0, 20 + flameH);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#38bdf8');
    flameGrad.addColorStop(0.7, '#0284c7');
    flameGrad.addColorStop(1, 'transparent');

    // Left Engine Flame
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-10, 22);
    ctx.lineTo(0, 22 + flameH);
    ctx.lineTo(-6, 22);
    ctx.fill();

    // Right Engine Flame
    ctx.beginPath();
    ctx.moveTo(10, 22);
    ctx.lineTo(0, 22 + flameH);
    ctx.lineTo(6, 22);
    ctx.fill();

    // Dual Thruster Ports
    ctx.beginPath();
    ctx.ellipse(-8, 22, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(8, 22, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // Spaceship Wings
    ctx.beginPath();
    ctx.moveTo(0, -28); // Nose
    ctx.lineTo(26, 16);  // Right wing tip
    ctx.lineTo(16, 22);  // Right wing bottom
    ctx.lineTo(0, 18);   // Center bottom
    ctx.lineTo(-16, 22); // Left wing bottom
    ctx.lineTo(-26, 16); // Left wing tip
    ctx.closePath();

    const wingGrad = ctx.createLinearGradient(-26, 0, 26, 0);
    wingGrad.addColorStop(0, '#0284c7');
    wingGrad.addColorStop(0.5, '#38bdf8');
    wingGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = wingGrad;
    ctx.fill();

    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wing Accent Stripes
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-22, 14);
    ctx.lineTo(-12, 10);
    ctx.lineTo(-10, 15);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(22, 14);
    ctx.lineTo(12, 10);
    ctx.lineTo(10, 15);
    ctx.lineTo(18, 18);
    ctx.closePath();
    ctx.fill();

    // Main Fuselage Hull
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.bezierCurveTo(12, -15, 14, 10, 0, 20);
    ctx.bezierCurveTo(-14, 10, -12, -15, 0, -32);
    ctx.closePath();

    const hullGrad = ctx.createLinearGradient(-10, -30, 10, 20);
    hullGrad.addColorStop(0, '#f8fafc');
    hullGrad.addColorStop(0.5, '#e2e8f0');
    hullGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = hullGrad;
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cockpit Glass
    ctx.beginPath();
    ctx.ellipse(0, -8, 6, 12, 0, 0, Math.PI * 2);
    const glassGrad = ctx.createLinearGradient(-4, -18, 4, 2);
    glassGrad.addColorStop(0, '#67e8f9');
    glassGrad.addColorStop(0.6, '#06b6d4');
    glassGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Glass Shine
    ctx.beginPath();
    ctx.ellipse(-2, -10, 2, 6, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    // Active Weapon Glow Indicator on Nose
    const curWep = WEAPON_DEFINITIONS[player.currentWeapon];
    ctx.beginPath();
    ctx.arc(0, -32, 4, 0, Math.PI * 2);
    ctx.fillStyle = curWep.color;
    ctx.shadowColor = curWep.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shield Power-up Bubble
    if (shieldTime > 0) {
      const shieldPulse = Math.sin(time * 8) * 3;
      const sRadius = player.radius + 14 + shieldPulse;
      ctx.beginPath();
      ctx.arc(0, 0, sRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Magnet Field Indicator
    if (magnetTime > 0) {
      ctx.save();
      ctx.rotate(-time * 2);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. Render Asteroids with Craters & Facets
  public renderAsteroids(asteroids: Asteroid[]) {
    const ctx = this.ctx;

    for (const ast of asteroids) {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rot);

      ctx.beginPath();
      const v = ast.vertices;
      if (v.length > 0) {
        const firstX = Math.cos(v[0].angle) * v[0].distance;
        const firstY = Math.sin(v[0].angle) * v[0].distance;
        ctx.moveTo(firstX, firstY);
        for (let i = 1; i < v.length; i++) {
          const px = Math.cos(v[i].angle) * v[i].distance;
          const py = Math.sin(v[i].angle) * v[i].distance;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.arc(0, 0, ast.radius, 0, Math.PI * 2);
      }

      const r = ast.radius;
      const aGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      aGrad.addColorStop(0, ast.highlightColor);
      aGrad.addColorStop(0.6, ast.color);
      aGrad.addColorStop(1, ast.darkColor);
      ctx.fillStyle = aGrad;
      ctx.fill();

      ctx.strokeStyle = ast.darkColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Craters
      for (const cr of ast.craters) {
        ctx.beginPath();
        ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cr.x - 1, cr.y - 1, cr.r, 0, Math.PI * 0.85);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (ast.type === 'CRYSTAL') {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.lineTo(r * 0.4, 0);
        ctx.lineTo(0, r * 0.5);
        ctx.lineTo(-r * 0.4, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 5. Render Projectiles
  public renderProjectiles(projectiles: Projectile[], time: number) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.isEnemy) {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        switch (p.type) {
          case 'NORMAL':
          case 'DOUBLE':
          case 'TRIPLE':
          case 'SPREAD': {
            const boltAngle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
            ctx.rotate(boltAngle);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius, p.radius * 2.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius * 0.4, p.radius * 1.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0;
            break;
          }
          case 'PLASMA': {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            const plGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.radius);
            plGrad.addColorStop(0, '#ffffff');
            plGrad.addColorStop(0.4, p.color);
            plGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = plGrad;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;
            break;
          }
          case 'BEAM': {
            const bLen = p.beamLength || 400;
            const beamGrad = ctx.createLinearGradient(-p.radius, 0, p.radius, 0);
            beamGrad.addColorStop(0, 'transparent');
            beamGrad.addColorStop(0.3, p.color);
            beamGrad.addColorStop(0.5, '#ffffff');
            beamGrad.addColorStop(0.7, p.color);
            beamGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = beamGrad;
            ctx.fillRect(-p.radius, -bLen, p.radius * 2, bLen);
            break;
          }
        }
      }
      ctx.restore();
    }
  }

  // 6. Render Collectibles
  public renderCollectibles(collectibles: Collectible[], time: number) {
    const ctx = this.ctx;

    for (const c of collectibles) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      const pulse = Math.sin(time * 6 + c.pulseTimer) * 2;
      const r = c.radius + pulse;

      if (c.type === 'WEAPON_ORB' && c.weaponType) {
        const colors = WEAPON_COLORS[c.weaponType];
        ctx.beginPath();
        ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.orb}40`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const orbGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.4, colors.border);
        orbGrad.addColorStop(0.8, colors.orb);
        orbGrad.addColorStop(1, colors.trail);
        ctx.fillStyle = orbGrad;
        ctx.shadowColor = colors.orb;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbolMap: Record<string, string> = {
          DOUBLE: '2x',
          TRIPLE: '3x',
          SPREAD: '❖',
          PLASMA: '●',
          BEAM: '⚡',
        };
        ctx.fillText(symbolMap[c.weaponType] || 'W', 0, 1);
      } else if (c.type === 'POWER_TRIANGLE') {
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(0, -r * 1.1);
        ctx.lineTo(r, r * 0.85);
        ctx.lineTo(-r, r * 0.85);
        ctx.closePath();

        const triGrad = ctx.createLinearGradient(0, -r, 0, r);
        triGrad.addColorStop(0, '#fef08a');
        triGrad.addColorStop(0.5, '#eab308');
        triGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = triGrad;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const glyph =
          c.type === 'SHIELD' ? '🛡️' : c.type === 'MAGNET' ? '🧲' : c.type === 'BOMB' ? '💣' : '❤️';
        ctx.fillText(glyph, 0, 1);
      }

      ctx.restore();
    }
  }

  // 7. Render Enemies
  public renderEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      const r = e.radius;

      switch (e.type) {
        case 'SCOUT': {
          // Sharp Triangular Raider Spaceship
          // Engine flame
          const flameH = 8 + Math.sin(time * 25 + e.patternTimer * 5) * 4;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-5, -r * 0.7);
          ctx.lineTo(0, -r * 0.7 - flameH);
          ctx.lineTo(5, -r * 0.7);
          ctx.fill();

          // Triangular hull
          ctx.beginPath();
          ctx.moveTo(0, r * 1.1); // Nose facing down towards player
          ctx.lineTo(r * 0.9, -r * 0.7); // Right wing tip
          ctx.lineTo(0, -r * 0.35); // Center rear indent
          ctx.lineTo(-r * 0.9, -r * 0.7); // Left wing tip
          ctx.closePath();

          const triGrad = ctx.createLinearGradient(0, -r, 0, r);
          triGrad.addColorStop(0, '#7f1d1d');
          triGrad.addColorStop(0.5, '#dc2626');
          triGrad.addColorStop(1, '#ef4444');
          ctx.fillStyle = triGrad;
          ctx.fill();

          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Glowing cockpit scanner
          ctx.beginPath();
          ctx.ellipse(0, 0, 3, 5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Wing Cannons
          ctx.fillStyle = '#f87171';
          ctx.fillRect(-r * 0.85, -r * 0.2, 2.5, 6);
          ctx.fillRect(r * 0.85 - 2.5, -r * 0.2, 2.5, 6);
          break;
        }
        case 'DRONE': {
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }
        case 'HEAVY': {
          ctx.beginPath();
          ctx.moveTo(0, r * 1.1);
          ctx.lineTo(r * 1.2, -r * 0.6);
          ctx.lineTo(r * 0.6, -r * 1.1);
          ctx.lineTo(-r * 0.6, -r * 1.1);
          ctx.lineTo(-r * 1.2, -r * 0.6);
          ctx.closePath();
          ctx.fillStyle = '#475569';
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }
        case 'ELITE': {
          // Advanced Triangular Interceptor
          const flameH = 10 + Math.sin(time * 30 + e.patternTimer * 5) * 5;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(-6, -r * 0.8);
          ctx.lineTo(0, -r * 0.8 - flameH);
          ctx.lineTo(6, -r * 0.8);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, r * 1.3);
          ctx.lineTo(r * 1.3, -r * 0.8);
          ctx.lineTo(0, -r * 0.3);
          ctx.lineTo(-r * 1.3, -r * 0.8);
          ctx.closePath();
          ctx.fillStyle = '#ec4899';
          ctx.fill();
          ctx.strokeStyle = '#fbcfe8';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }
      }

      ctx.restore();
    }
  }

  // 8. Render Bosses (Rival Spaceships, Destroyers, Titans, Core)
  public renderBoss(boss: Boss | null, time: number) {
    if (!boss) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(boss.x, boss.y);

    const r = boss.radius;

    // A. Rival Fighter / Interceptor Boss Spaceship
    if (boss.visualType === 'RIVAL_FIGHTER') {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.2); // Forward nose
      ctx.lineTo(r * 1.2, -r * 0.7); // Right wing
      ctx.lineTo(r * 0.6, -r * 1.0);
      ctx.lineTo(0, -r * 0.6);
      ctx.lineTo(-r * 0.6, -r * 1.0);
      ctx.lineTo(-r * 1.2, -r * 0.7); // Left wing
      ctx.closePath();

      const fGrad = ctx.createLinearGradient(0, -r, 0, r);
      fGrad.addColorStop(0, '#b91c1c');
      fGrad.addColorStop(0.5, '#ef4444');
      fGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = fGrad;
      ctx.fill();

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cockpit glowing eye
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // B. Rival Battlecruiser / Warship Boss Spaceship
    else if (boss.visualType === 'RIVAL_CRUISER' || boss.visualType === 'RIVAL_BATTLESHIP') {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.3);
      ctx.lineTo(r * 0.9, r * 0.4);
      ctx.lineTo(r * 1.4, -r * 0.6);
      ctx.lineTo(r * 0.7, -r * 1.2);
      ctx.lineTo(-r * 0.7, -r * 1.2);
      ctx.lineTo(-r * 1.4, -r * 0.6);
      ctx.lineTo(-r * 0.9, r * 0.4);
      ctx.closePath();

      const cGrad = ctx.createLinearGradient(-r, 0, r, 0);
      cGrad.addColorStop(0, '#1e1b4b');
      cGrad.addColorStop(0.5, '#4338ca');
      cGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = cGrad;
      ctx.fill();

      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Cannons
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-r * 0.9, r * 0.3, 8, 16);
      ctx.fillRect(r * 0.9 - 8, r * 0.3, 8, 16);

      // Reactor core
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // C. Rival Flagship / Titan Boss Spaceship
    else if (boss.visualType === 'RIVAL_FLAGSHIP') {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.4);
      ctx.lineTo(r * 1.5, -r * 0.4);
      ctx.lineTo(r * 1.1, -r * 1.2);
      ctx.lineTo(0, -r * 0.8);
      ctx.lineTo(-r * 1.1, -r * 1.2);
      ctx.lineTo(-r * 1.5, -r * 0.4);
      ctx.closePath();

      const flGrad = ctx.createLinearGradient(0, -r, 0, r);
      flGrad.addColorStop(0, '#581c87');
      flGrad.addColorStop(0.5, '#9333ea');
      flGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = flGrad;
      ctx.fill();

      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Glowing wing emitters
      ctx.beginPath();
      ctx.arc(-r * 0.9, -r * 0.1, 10, 0, Math.PI * 2);
      ctx.arc(r * 0.9, -r * 0.1, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
    }
    // D. Regional Bosses: Asteroid Guardian, Space Destroyer, Nebula Beast, Cosmic Core
    else if (boss.visualType === 'ASTEROID_GUARDIAN') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const bGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
      bGrad.addColorStop(0, '#f97316');
      bGrad.addColorStop(0.5, '#7c2d12');
      bGrad.addColorStop(1, '#27272a');
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 4;
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = time * 2 + (i * Math.PI * 2) / 3;
        const ox = Math.cos(a) * (r + 28);
        const oy = Math.sin(a) * (r + 28);
        ctx.beginPath();
        ctx.arc(ox, oy, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();
        ctx.strokeStyle = '#ffedd5';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else if (boss.visualType === 'SPACE_DESTROYER') {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.3);
      ctx.lineTo(r * 1.5, -r * 0.8);
      ctx.lineTo(r * 0.8, -r * 1.3);
      ctx.lineTo(-r * 0.8, -r * 1.3);
      ctx.lineTo(-r * 1.5, -r * 0.8);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, -r * 0.2, 18, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    } else if (boss.visualType === 'NEBULA_BEAST') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const nebGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
      nebGrad.addColorStop(0, '#f43f5e');
      nebGrad.addColorStop(0.6, '#9333ea');
      nebGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = nebGrad;
      ctx.fill();
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      ctx.rotate(time * 3);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#c084fc';
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Cosmic Core (Final Boss)
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#f43f5e');
      coreGrad.addColorStop(0.7, '#881337');
      coreGrad.addColorStop(1, '#020617');
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.rotate(time * 1.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.strokeRect(-r * 0.65, -r * 0.65, r * 1.3, r * 1.3);
      ctx.restore();
    }

    ctx.restore();
  }

  // 9. Render Particles
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 10. Render Floating Combat Text
  public renderFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    for (const ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.font = `bold ${ft.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
