import {
  Asteroid,
  AsteroidType,
  Boss,
  BossVisualType,
  Collectible,
  CollectibleType,
  Enemy,
  EnemyType,
  FinishLine,
  FloatingText,
  GameSettings,
  LevelConfig,
  Particle,
  PlayerState,
  Projectile,
  Star,
  WeaponType,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import { WEAPON_DEFINITIONS } from '../constants/weapons';
import { LEVELS, PLANETARY_REGIONS } from '../constants/levels';

export interface GameEngineCallbacks {
  onLevelComplete: (stats: {
    levelId: number;
    score: number;
    asteroidsDestroyed: number;
    maxCombo: number;
    damageTaken: number;
    timeSeconds: number;
    stars: number;
  }) => void;
  onLevelAdvance?: (nextLevelId: number) => void;
  onGameOver: (stats: {
    score: number;
    asteroidsDestroyed: number;
    levelReached: number;
  }) => void;
  onWeaponChange: (weapon: WeaponType) => void;
  onPowerUp: (level: number) => void;
  onObjectiveUpdate: (current: number, target: number) => void;
  onBossSpawn?: (boss: Boss) => void;
  onFinishLineSpawn?: () => void;
}

export class GameEngine {
  public width: number;
  public height: number;
  public player: PlayerState;
  public asteroids: Asteroid[] = [];
  public projectiles: Projectile[] = [];
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public stars: Star[] = [];
  public boss: Boss | null = null;
  public finishLine: FinishLine | null = null;

  public levelConfig: LevelConfig;
  public settings: GameSettings;
  public callbacks: GameEngineCallbacks;

  public isRunning = false;
  public isPaused = false;
  public isFiring = false;
  public isWarping = false;
  public warpSpeedMultiplier = 1.0;

  private lastTime = 0;
  private gameTime = 0;
  private levelTimer = 0;
  private lastShotTime = 0;
  private asteroidSpawnTimer = 0;
  private enemySpawnTimer = 0;
  private objectiveProgress = 0;
  private screenShakeIntensity = 0;

  private objectiveCompleted = false;
  private bossSpawned = false;
  private warpTimer = 0;

  constructor(
    width: number,
    height: number,
    levelConfig: LevelConfig,
    settings: GameSettings,
    callbacks: GameEngineCallbacks
  ) {
    this.width = width;
    this.height = height;
    this.levelConfig = levelConfig;
    this.settings = settings;
    this.callbacks = callbacks;

    this.player = {
      x: width / 2,
      y: height * 0.8,
      targetX: width / 2,
      targetY: height * 0.8,
      vx: 0,
      vy: 0,
      tilt: 0,
      radius: 22,
      lives: 3,
      maxLives: 3,
      invulnerableTime: 0,
      shieldTime: 0,
      magnetTime: 0,
      currentWeapon: 'NORMAL',
      powerLevel: 1,
      score: 0,
      combo: 0,
      comboTimer: 0,
      maxCombo: 0,
      asteroidsDestroyed: 0,
      enemiesDestroyed: 0,
      crystalsCollected: 0,
      damageTaken: 0,
    };

    this.initStars();
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  private initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 4000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 25 + Math.random() * 95,
        size: Math.random() < 0.2 ? 2.5 : Math.random() < 0.6 ? 1.8 : 1.0,
        alpha: 0.35 + Math.random() * 0.65,
        layer: Math.random() < 0.5 ? 1 : 2,
      });
    }
  }

  public spawnRivalBoss() {
    if (this.bossSpawned) return;
    this.bossSpawned = true;

    const visualType: BossVisualType = this.levelConfig.bossType || 'RIVAL_CRUISER';
    const name = this.levelConfig.bossName || 'Düşman Lider Gemisi';

    let hp = 450 + this.levelConfig.id * 80;
    let radius = 55;
    let color = '#ef4444';

    if (visualType === 'RIVAL_FIGHTER') {
      radius = 48;
      hp = 380 + this.levelConfig.id * 70;
      color = '#ef4444';
    } else if (visualType === 'RIVAL_CRUISER' || visualType === 'RIVAL_BATTLESHIP') {
      radius = 60;
      hp = 520 + this.levelConfig.id * 85;
      color = '#6366f1';
    } else if (visualType === 'RIVAL_FLAGSHIP') {
      radius = 68;
      hp = 680 + this.levelConfig.id * 95;
      color = '#a855f7';
    } else if (visualType === 'ASTEROID_GUARDIAN') {
      radius = 65;
      hp = 950;
      color = '#f97316';
    } else if (visualType === 'SPACE_DESTROYER') {
      radius = 70;
      hp = 1300;
      color = '#0284c7';
    } else if (visualType === 'NEBULA_BEAST') {
      radius = 75;
      hp = 1650;
      color = '#c084fc';
    } else if (visualType === 'COSMIC_CORE') {
      radius = 85;
      hp = 2400;
      color = '#f43f5e';
    }

    this.boss = {
      id: 'boss_' + Date.now(),
      name,
      title: 'Bölüm Lideri',
      x: this.width / 2,
      y: -120,
      vx: 110 + this.levelConfig.id * 4,
      vy: 65,
      radius,
      hp,
      maxHp: hp,
      phase: 1,
      maxPhases: 3,
      attackTimer: 0,
      currentAttack: 'SPREAD',
      color,
      weakpointAngle: 0,
      visualType,
    };

    soundManager.playBossRoar();
    this.spawnFloatingText(this.width / 2, 100, `⚠️ ${name.toUpperCase()} GİRİŞ YAPTI!`, '#ef4444', 22);

    if (this.callbacks.onBossSpawn) {
      this.callbacks.onBossSpawn(this.boss);
    }
  }

  public updatePointerTarget(clientX: number, clientY: number, rect: DOMRect) {
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const marginX = 35;
    const marginYTop = 60;
    const marginYBottom = 40;

    this.player.targetX = Math.max(marginX, Math.min(this.width - marginX, x));
    this.player.targetY = Math.max(marginYTop, Math.min(this.height - marginYBottom, y));
  }

  public setFiring(firing: boolean) {
    this.isFiring = firing;
  }

  public update(now: number): { shakeX: number; shakeY: number } {
    if (!this.isRunning || this.isPaused) {
      this.lastTime = now;
      return { shakeX: 0, shakeY: 0 };
    }

    if (this.lastTime === 0) {
      this.lastTime = now;
    }
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.gameTime += dt;
    this.levelTimer += dt;

    // Warp sequence handling during checkpoint crossing
    if (this.isWarping) {
      this.warpTimer += dt;
      this.warpSpeedMultiplier = Math.min(4.5, 1.0 + this.warpTimer * 3.5);
      if (this.warpTimer >= 1.2) {
        this.completeLevelAndSeamlessAdvance();
      }
    } else if (this.warpSpeedMultiplier > 1.0) {
      // Smooth deceleration back to normal speed
      this.warpSpeedMultiplier = Math.max(1.0, this.warpSpeedMultiplier - dt * 4.0);
    }

    // Player Movement
    const smoothing = Math.min(1.0, 14 * dt * this.settings.mouseSensitivity);
    const prevX = this.player.x;
    this.player.x += (this.player.targetX - this.player.x) * smoothing;
    this.player.y += (this.player.targetY - this.player.y) * smoothing;

    const targetTilt = Math.max(-0.35, Math.min(0.35, (this.player.x - prevX) * 0.05));
    this.player.tilt += (targetTilt - this.player.tilt) * Math.min(1.0, 12 * dt);

    if (this.player.invulnerableTime > 0) this.player.invulnerableTime -= dt;
    if (this.player.shieldTime > 0) this.player.shieldTime -= dt;
    if (this.player.magnetTime > 0) this.player.magnetTime -= dt;

    if (this.player.combo > 0) {
      this.player.comboTimer -= dt;
      if (this.player.comboTimer <= 0) {
        this.player.combo = 0;
      }
    }

    if (this.isFiring && !this.isWarping) {
      this.handlePlayerShooting(now);
    }

    // Spawners (only if objective not yet complete and finish line not active)
    if (!this.objectiveCompleted && !this.finishLine) {
      this.updateSpawners(dt);
    }

    this.updateStars(dt);
    this.updateProjectiles(dt);
    this.updateAsteroids(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateFinishLine(dt);
    this.updateCollectibles(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    this.handleCollisions();
    this.checkObjectives();

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeIntensity > 0 && this.settings.screenShake && !this.settings.reducedMotion) {
      shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 25);
    }

    return { shakeX, shakeY };
  }

  private updateStars(dt: number) {
    const spd = this.warpSpeedMultiplier;
    for (const s of this.stars) {
      s.y += s.speed * spd * dt;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    }
  }

  private updateFinishLine(dt: number) {
    if (!this.finishLine || !this.finishLine.active) return;
    const fl = this.finishLine;

    // Checkpoint line slowly descends
    fl.y += fl.speed * dt;

    // Check if player crossed the line
    if (!fl.passed && this.player.y <= fl.y + 40) {
      fl.passed = true;
      this.isWarping = true;
      this.warpTimer = 0;
      soundManager.playVictory();
      this.spawnFloatingText(this.width / 2, this.height * 0.45, 'HİPER GEÇİŞ AKTİF!', '#38bdf8', 26);
    }

    // If finish line reaches bottom without crossing, player automatically crosses
    if (fl.y > this.height + 60 && !fl.passed) {
      fl.passed = true;
      this.isWarping = true;
      this.warpTimer = 0;
      this.completeLevelAndSeamlessAdvance();
    }
  }

  private handlePlayerShooting(now: number) {
    const wep = WEAPON_DEFINITIONS[this.player.currentWeapon];
    const fireRate = wep.baseFireRate * (1 + (this.player.powerLevel - 1) * 0.12);
    const fireCooldownMs = 1000 / fireRate;

    if (now - this.lastShotTime < fireCooldownMs) {
      return;
    }
    this.lastShotTime = now;

    soundManager.playShoot(this.player.currentWeapon, this.player.powerLevel);

    const p = this.player;
    const power = p.powerLevel;
    const damage = wep.baseDamage * (1 + (power - 1) * 0.25);

    switch (p.currentWeapon) {
      case 'NORMAL': {
        if (power <= 3) {
          this.spawnProjectile(p.x, p.y - 25, 0, -850, 4.5, damage, wep.color, 'NORMAL');
        } else if (power === 4) {
          this.spawnProjectile(p.x - 7, p.y - 25, 0, -880, 5, damage * 0.85, wep.color, 'NORMAL');
          this.spawnProjectile(p.x + 7, p.y - 25, 0, -880, 5, damage * 0.85, wep.color, 'NORMAL');
        } else {
          this.spawnProjectile(p.x - 10, p.y - 25, -40, -900, 5.5, damage * 0.8, wep.color, 'NORMAL');
          this.spawnProjectile(p.x, p.y - 28, 0, -920, 6, damage, wep.color, 'NORMAL');
          this.spawnProjectile(p.x + 10, p.y - 25, 40, -900, 5.5, damage * 0.8, wep.color, 'NORMAL');
        }
        break;
      }
      case 'DOUBLE': {
        const offset = 9 + power;
        this.spawnProjectile(p.x - offset, p.y - 22, 0, -850, 5, damage, wep.color, 'DOUBLE');
        this.spawnProjectile(p.x + offset, p.y - 22, 0, -850, 5, damage, wep.color, 'DOUBLE');
        if (power >= 4) {
          this.spawnProjectile(p.x - offset * 1.8, p.y - 15, -60, -820, 4.5, damage * 0.75, wep.color, 'DOUBLE');
          this.spawnProjectile(p.x + offset * 1.8, p.y - 15, 60, -820, 4.5, damage * 0.75, wep.color, 'DOUBLE');
        }
        break;
      }
      case 'TRIPLE': {
        const spreadSpeed = 120 + power * 25;
        this.spawnProjectile(p.x - 12, p.y - 20, -spreadSpeed, -800, 5, damage, wep.color, 'TRIPLE');
        this.spawnProjectile(p.x, p.y - 25, 0, -850, 5.5, damage * 1.1, wep.color, 'TRIPLE');
        this.spawnProjectile(p.x + 12, p.y - 20, spreadSpeed, -800, 5, damage, wep.color, 'TRIPLE');
        if (power >= 4) {
          this.spawnProjectile(p.x - 18, p.y - 15, -spreadSpeed * 1.8, -750, 4.5, damage * 0.8, wep.color, 'TRIPLE');
          this.spawnProjectile(p.x + 18, p.y - 15, spreadSpeed * 1.8, -750, 4.5, damage * 0.8, wep.color, 'TRIPLE');
        }
        break;
      }
      case 'SPREAD': {
        const count = 3 + power;
        const angleStep = 0.12;
        const startAngle = -((count - 1) / 2) * angleStep;
        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * angleStep;
          const speed = 780;
          const vx = Math.sin(angle) * speed;
          const vy = -Math.cos(angle) * speed;
          this.spawnProjectile(p.x, p.y - 20, vx, vy, 4.5, damage * 0.65, wep.color, 'SPREAD');
        }
        break;
      }
      case 'PLASMA': {
        const radius = 10 + power * 3;
        if (power < 3) {
          this.spawnProjectile(p.x, p.y - 25, 0, -600, radius, damage, wep.color, 'PLASMA');
        } else if (power < 5) {
          this.spawnProjectile(p.x - 15, p.y - 22, -40, -620, radius * 0.85, damage * 0.85, wep.color, 'PLASMA');
          this.spawnProjectile(p.x + 15, p.y - 22, 40, -620, radius * 0.85, damage * 0.85, wep.color, 'PLASMA');
        } else {
          this.spawnProjectile(p.x - 22, p.y - 20, -70, -600, radius * 0.8, damage * 0.8, wep.color, 'PLASMA');
          this.spawnProjectile(p.x, p.y - 28, 0, -650, radius * 1.2, damage * 1.4, wep.color, 'PLASMA');
          this.spawnProjectile(p.x + 22, p.y - 20, 70, -600, radius * 0.8, damage * 0.8, wep.color, 'PLASMA');
        }
        break;
      }
      case 'BEAM': {
        this.spawnProjectile(p.x, p.y - 25, 0, -1200, 6 + power * 2, damage, wep.color, 'BEAM');
        break;
      }
    }
  }

  private spawnProjectile(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    damage: number,
    color: string,
    type: WeaponType | 'ENEMY',
    isEnemy = false
  ) {
    this.projectiles.push({
      id: 'proj_' + Math.random(),
      x,
      y,
      vx,
      vy,
      radius,
      damage,
      color,
      type,
      isEnemy,
      lifetime: 2.5,
    });
  }

  private updateSpawners(dt: number) {
    const cfg = this.levelConfig;

    this.asteroidSpawnTimer += dt;
    const asteroidInterval = 1 / cfg.asteroidRate;
    if (this.asteroidSpawnTimer >= asteroidInterval) {
      this.asteroidSpawnTimer = 0;
      this.spawnRandomAsteroid();
    }

    if (cfg.enemySpawnRate > 0) {
      this.enemySpawnTimer += dt;
      const enemyInterval = 1 / cfg.enemySpawnRate;
      if (this.enemySpawnTimer >= enemyInterval) {
        this.enemySpawnTimer = 0;
        this.spawnRandomEnemy();
      }
    }
  }

  private spawnRandomAsteroid(customType?: AsteroidType, spawnX?: number, spawnY?: number) {
    const allowed = this.levelConfig.allowedAsteroids;
    const type: AsteroidType =
      customType || allowed[Math.floor(Math.random() * allowed.length)] || 'SMALL';

    let radius = 18;
    let hp = 15;
    let speed = 90 + Math.random() * 50;

    switch (type) {
      case 'SMALL':
        radius = 16 + Math.random() * 6;
        hp = 18;
        speed = 120 + Math.random() * 60;
        break;
      case 'MEDIUM':
        radius = 28 + Math.random() * 8;
        hp = 45;
        speed = 85 + Math.random() * 40;
        break;
      case 'LARGE':
        radius = 42 + Math.random() * 12;
        hp = 110;
        speed = 55 + Math.random() * 30;
        break;
      case 'CRYSTAL':
        radius = 22 + Math.random() * 6;
        hp = 35;
        speed = 95 + Math.random() * 40;
        break;
      case 'ARMOR':
        radius = 32 + Math.random() * 8;
        hp = 130;
        speed = 70 + Math.random() * 30;
        break;
      case 'EXPLOSIVE':
        radius = 26 + Math.random() * 6;
        hp = 30;
        speed = 100 + Math.random() * 45;
        break;
    }

    speed *= this.levelConfig.asteroidSpeedMultiplier;

    const x = spawnX !== undefined ? spawnX : Math.random() * (this.width - 60) + 30;
    const y = spawnY !== undefined ? spawnY : -radius - 10;
    const vx = (Math.random() - 0.5) * 40;
    const vy = speed;

    const vertexCount = 8 + Math.floor(Math.random() * 5);
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i * Math.PI * 2) / vertexCount;
      const distVariance = radius * (0.8 + Math.random() * 0.4);
      vertices.push({ angle, distance: distVariance });
    }

    const craterCount = Math.floor(radius / 10);
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
      const ca = Math.random() * Math.PI * 2;
      const cd = Math.random() * (radius * 0.55);
      craters.push({
        x: Math.cos(ca) * cd,
        y: Math.sin(ca) * cd,
        r: 3 + Math.random() * (radius * 0.22),
      });
    }

    const region = PLANETARY_REGIONS[this.levelConfig.regionId] || PLANETARY_REGIONS.EARTH_ORBIT;
    let color = '#78716c';
    let darkColor = '#44403c';
    let highlightColor = '#a8a29e';

    if (region.ambientType === 'lava') {
      color = '#9a3412';
      darkColor = '#431407';
      highlightColor = '#fb923c';
    } else if (region.ambientType === 'snow') {
      color = '#0e7490';
      darkColor = '#083344';
      highlightColor = '#67e8f9';
    } else if (region.ambientType === 'gas') {
      color = '#6b21a8';
      darkColor = '#3b0764';
      highlightColor = '#d8b4fe';
    } else if (type === 'CRYSTAL') {
      color = '#be185d';
      darkColor = '#500724';
      highlightColor = '#f472b6';
    }

    this.asteroids.push({
      id: 'ast_' + Math.random(),
      x,
      y,
      vx,
      vy,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 1.8,
      radius,
      hp,
      maxHp: hp,
      type,
      vertices,
      craters,
      color,
      darkColor,
      highlightColor,
      splitCount: 0,
    });
  }

  private spawnRandomEnemy() {
    const allowed = this.levelConfig.allowedEnemies;
    if (allowed.length === 0) return;

    // High chance to spawn a formation squadron of triangular fighters
    if (Math.random() < 0.65 || !allowed.some((t) => t !== 'SCOUT')) {
      this.spawnTriangleSquadron();
      return;
    }

    const type: EnemyType = allowed[Math.floor(Math.random() * allowed.length)];

    let radius = 20;
    let hp = 30;
    let color = '#ef4444';

    if (type === 'DRONE') {
      radius = 24;
      hp = 50;
      color = '#a855f7';
    } else if (type === 'HEAVY') {
      radius = 34;
      hp = 120;
      color = '#64748b';
    } else if (type === 'ELITE') {
      radius = 28;
      hp = 85;
      color = '#ec4899';
    }

    const x = Math.random() * (this.width - 80) + 40;
    const y = -radius - 15;

    this.enemies.push({
      id: 'enemy_' + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 80,
      vy: 65 + Math.random() * 45,
      type,
      hp,
      maxHp: hp,
      radius,
      shootCooldown: type === 'HEAVY' ? 1.6 : 2.2,
      shootTimer: Math.random() * 1.5,
      patternTimer: Math.random() * Math.PI,
      color,
    });
  }

  // Spawns a flock/squadron of 3 to 5 triangular fighter craft in formation
  private spawnTriangleSquadron() {
    const squadSize = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 triangle ships
    const centerX = Math.random() * (this.width - 240) + 120;
    const startY = -40;
    const speed = 90 + Math.random() * 40;

    for (let i = 0; i < squadSize; i++) {
      // V-Formation offsets
      const colOffset = (i - (squadSize - 1) / 2) * 45;
      const rowOffset = Math.abs(i - (squadSize - 1) / 2) * 25;

      this.enemies.push({
        id: 'scout_squad_' + Math.random(),
        x: centerX + colOffset,
        y: startY - rowOffset,
        vx: (Math.random() - 0.5) * 30,
        vy: speed,
        type: 'SCOUT',
        hp: 25,
        maxHp: 25,
        radius: 18,
        shootCooldown: 1.4 + Math.random() * 0.8,
        shootTimer: 0.5 + Math.random() * 0.8,
        patternTimer: i * 0.4,
        color: '#ef4444',
      });
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt;

      if (p.lifetime <= 0 || p.y < -50 || p.y > this.height + 50 || p.x < -50 || p.x > this.width + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateAsteroids(dt: number) {
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      ast.x += ast.vx * dt;
      ast.y += ast.vy * dt;
      ast.rot += ast.vRot * dt;

      if (ast.y > this.height + ast.radius + 20) {
        this.asteroids.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.patternTimer += dt;
      e.shootTimer += dt;

      if (e.type === 'SCOUT') {
        e.x += Math.sin(e.patternTimer * 4) * 120 * dt;
        e.y += e.vy * dt;
      } else if (e.type === 'DRONE') {
        e.x += Math.cos(e.patternTimer * 2) * 80 * dt;
        e.y += e.vy * 0.8 * dt;
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }

      if (e.shootTimer >= e.shootCooldown && e.y > 50 && e.y < this.height * 0.6) {
        e.shootTimer = 0;
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 260;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        this.spawnProjectile(e.x, e.y + e.radius, vx, vy, 5.5, 1, '#ef4444', 'ENEMY', true);
      }

      if (e.y > this.height + e.radius + 20) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBoss(dt: number) {
    if (!this.boss) return;
    const b = this.boss;

    if (b.y < 120) {
      b.y += 80 * dt;
    } else {
      b.x += b.vx * dt;
      if (b.x < b.radius + 20 || b.x > this.width - b.radius - 20) {
        b.vx = -b.vx;
      }
    }

    b.attackTimer += dt;
    const attackInterval = b.phase === 3 ? 1.4 : b.phase === 2 ? 1.8 : 2.4;

    if (b.attackTimer >= attackInterval && b.y >= 100) {
      b.attackTimer = 0;
      soundManager.playBossHit();

      const count = 4 + b.phase * 2;
      for (let i = 0; i < count; i++) {
        const angle = ((i - count / 2) * 0.25) + Math.PI / 2;
        const speed = 220 + b.phase * 30;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.spawnProjectile(b.x, b.y + b.radius * 0.8, vx, vy, 6, 1, '#f43f5e', 'ENEMY', true);
      }
    }
  }

  private updateCollectibles(dt: number) {
    const magnetActive = this.player.magnetTime > 0;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.rot += c.vRot * dt;
      c.pulseTimer += dt;

      if (magnetActive) {
        const dx = this.player.x - c.x;
        const dy = this.player.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 380) {
          const pullSpeed = 450 * (1 - dist / 400);
          c.vx += (dx / dist) * pullSpeed * dt;
          c.vy += (dy / dist) * pullSpeed * dt;
        }
      }

      c.x += c.vx * dt;
      c.y += c.vy * dt;

      if (c.y > this.height + c.radius + 20) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt;
      ft.life += dt;
      ft.alpha = 1 - ft.life / ft.maxLife;

      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private handleCollisions() {
    // Projectiles vs Asteroids
    for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
      const p = this.projectiles[pi];
      if (p.isEnemy) continue;

      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const ast = this.asteroids[ai];
        const dx = p.x - ast.x;
        const dy = p.y - ast.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + ast.radius) {
          ast.hp -= p.damage;
          this.spawnHitParticles(p.x, p.y, p.color, 6);

          if (p.type !== 'BEAM') {
            this.projectiles.splice(pi, 1);
          }

          if (ast.hp <= 0) {
            this.destroyAsteroid(ai, ast);
          } else {
            soundManager.playAsteroidHit();
          }
          break;
        }
      }
    }

    // Projectiles vs Enemies
    for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
      const p = this.projectiles[pi];
      if (p.isEnemy) continue;

      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + e.radius) {
          e.hp -= p.damage;
          this.spawnHitParticles(p.x, p.y, e.color, 6);

          if (p.type !== 'BEAM') {
            this.projectiles.splice(pi, 1);
          }

          if (e.hp <= 0) {
            this.destroyEnemy(ei, e);
          } else {
            soundManager.playEnemyHit();
          }
          break;
        }
      }
    }

    // Projectiles vs Boss
    if (this.boss && this.boss.y > 0) {
      const b = this.boss;
      for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
        const p = this.projectiles[pi];
        if (p.isEnemy) continue;

        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + b.radius) {
          b.hp -= p.damage;
          this.spawnHitParticles(p.x, p.y, '#f59e0b', 8);

          if (p.type !== 'BEAM') {
            this.projectiles.splice(pi, 1);
          }

          if (b.hp <= b.maxHp * 0.66 && b.phase === 1) {
            b.phase = 2;
            this.spawnFloatingText(b.x, b.y, 'FAZ 2!', '#f97316', 22);
            soundManager.playBossRoar();
          } else if (b.hp <= b.maxHp * 0.33 && b.phase === 2) {
            b.phase = 3;
            this.spawnFloatingText(b.x, b.y, 'FAZ 3 - AŞIRI YÜKLEME!', '#ef4444', 24);
            soundManager.playBossRoar();
          }

          if (b.hp <= 0) {
            this.destroyBoss(b);
          }
          break;
        }
      }
    }

    // Player vs Collectibles
    for (let ci = this.collectibles.length - 1; ci >= 0; ci--) {
      const c = this.collectibles[ci];
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.player.radius + c.radius) {
        this.collectItem(c);
        this.collectibles.splice(ci, 1);
      }
    }

    // Player vs Asteroids / Enemies / Bullets
    if (this.player.invulnerableTime <= 0 && !this.isWarping) {
      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const ast = this.asteroids[ai];
        const dx = this.player.x - ast.x;
        const dy = this.player.y - ast.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.player.radius + ast.radius * 0.8) {
          this.damagePlayer();
          this.destroyAsteroid(ai, ast, false);
          break;
        }
      }

      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.player.radius + e.radius * 0.8) {
          this.damagePlayer();
          this.destroyEnemy(ei, e, false);
          break;
        }
      }

      for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
        const p = this.projectiles[pi];
        if (!p.isEnemy) continue;

        const dx = this.player.x - p.x;
        const dy = this.player.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.player.radius + p.radius) {
          this.projectiles.splice(pi, 1);
          this.damagePlayer();
          break;
        }
      }
    }
  }

  // Clear all remaining asteroids from screen with satisfying particle burst
  public clearAllAsteroids() {
    for (const ast of this.asteroids) {
      this.spawnExplosion(ast.x, ast.y, ast.color, ast.radius * 0.6);
    }
    this.asteroids = [];
  }

  // Spawn the Checkpoint Finish Line
  public spawnFinishLine() {
    if (this.finishLine) return;
    this.clearAllAsteroids();

    this.finishLine = {
      y: -40,
      speed: 130,
      active: true,
      passed: false,
      textTr: 'BÖLÜM GEÇİŞ ÇİZGİSİ',
    };

    soundManager.playPickupSpecial();
    this.spawnFloatingText(this.width / 2, 80, '⚡ GEÇİŞ ÇİZGİSİ GELDİ! ÇİZGİYİ GEÇ! ⚡', '#38bdf8', 22);

    if (this.callbacks.onFinishLineSpawn) {
      this.callbacks.onFinishLineSpawn();
    }
  }

  private destroyAsteroid(index: number, ast: Asteroid, scoreBonus = true) {
    this.asteroids.splice(index, 1);
    soundManager.playAsteroidExplode(ast.type);
    this.spawnExplosion(ast.x, ast.y, ast.color, ast.radius * 0.8);
    this.screenShakeIntensity = Math.min(20, this.screenShakeIntensity + (ast.radius > 30 ? 10 : 5));

    if (scoreBonus) {
      this.incrementCombo();
      let pts = 10;
      if (ast.type === 'MEDIUM') pts = 25;
      if (ast.type === 'LARGE') pts = 50;
      if (ast.type === 'CRYSTAL') pts = 75;
      if (ast.type === 'ARMOR') pts = 60;
      if (ast.type === 'EXPLOSIVE') pts = 40;

      const totalPts = pts * Math.min(10, Math.max(1, this.player.combo));
      this.player.score += totalPts;
      this.player.asteroidsDestroyed++;
      this.spawnFloatingText(ast.x, ast.y, `+${totalPts}`, '#38bdf8', 14);

      if (ast.type === 'CRYSTAL') {
        this.player.crystalsCollected++;
      }

      if (ast.type === 'LARGE') {
        this.spawnRandomAsteroid('MEDIUM', ast.x - 15, ast.y);
        this.spawnRandomAsteroid('MEDIUM', ast.x + 15, ast.y);
      } else if (ast.type === 'MEDIUM' && Math.random() < 0.4) {
        this.spawnRandomAsteroid('SMALL', ast.x - 10, ast.y);
        this.spawnRandomAsteroid('SMALL', ast.x + 10, ast.y);
      } else if (ast.type === 'EXPLOSIVE') {
        this.triggerChainExplosion(ast.x, ast.y, 90);
      }

      this.handleDrops(ast.x, ast.y, ast.type);
    }
  }

  private triggerChainExplosion(cx: number, cy: number, blastRadius: number) {
    soundManager.playBomb();
    this.spawnExplosion(cx, cy, '#ef4444', 35);
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const target = this.asteroids[i];
      const dist = Math.hypot(target.x - cx, target.y - cy);
      if (dist < blastRadius + target.radius) {
        target.hp -= 60;
        if (target.hp <= 0) {
          this.destroyAsteroid(i, target, true);
        }
      }
    }
  }

  private destroyEnemy(index: number, e: Enemy, scoreBonus = true) {
    this.enemies.splice(index, 1);
    soundManager.playEnemyExplode();
    this.spawnExplosion(e.x, e.y, e.color, e.radius * 0.9);

    if (scoreBonus) {
      this.incrementCombo();
      const pts = e.type === 'ELITE' ? 250 : e.type === 'HEAVY' ? 150 : 100;
      const totalPts = pts * Math.min(10, Math.max(1, this.player.combo));
      this.player.score += totalPts;
      this.player.enemiesDestroyed++;
      this.spawnFloatingText(e.x, e.y, `+${totalPts}`, '#f43f5e', 16);

      if (Math.random() < 0.6) {
        this.spawnCollectible(e.x, e.y, 'POWER_TRIANGLE');
      }
    }
  }

  private destroyBoss(b: Boss) {
    this.boss = null;
    soundManager.playBossRoar();
    this.screenShakeIntensity = 25;

    for (let i = 0; i < 8; i++) {
      const ox = (Math.random() - 0.5) * b.radius * 1.5;
      const oy = (Math.random() - 0.5) * b.radius * 1.5;
      setTimeout(() => {
        this.spawnExplosion(b.x + ox, b.y + oy, b.color, 40);
        soundManager.playAsteroidExplode('LARGE');
      }, i * 150);
    }

    const bossScore = 2500;
    this.player.score += bossScore;
    this.spawnFloatingText(b.x, b.y, `LİDER GEMİ İMHA EDİLDİ! +${bossScore}`, '#fbbf24', 24);

    this.spawnCollectible(b.x - 40, b.y, 'WEAPON_ORB', 'PLASMA');
    this.spawnCollectible(b.x, b.y, 'POWER_TRIANGLE');
    this.spawnCollectible(b.x + 40, b.y, 'SHIELD');

    // Clean all asteroids and spawn finish line
    setTimeout(() => {
      this.spawnFinishLine();
    }, 1200);
  }

  private handleDrops(x: number, y: number, _astType: AsteroidType) {
    const rand = Math.random();

    if (rand < 0.22) {
      this.spawnCollectible(x, y, 'POWER_TRIANGLE');
    } else if (rand < 0.32) {
      const weaponOptions: WeaponType[] = ['DOUBLE', 'TRIPLE', 'SPREAD', 'PLASMA', 'BEAM'];
      const picked = weaponOptions[Math.floor(Math.random() * weaponOptions.length)];
      this.spawnCollectible(x, y, 'WEAPON_ORB', picked);
    } else if (rand < 0.38) {
      const specials: CollectibleType[] = ['SHIELD', 'MAGNET', 'BOMB', 'HEALTH'];
      const picked = specials[Math.floor(Math.random() * specials.length)];
      this.spawnCollectible(x, y, picked);
    }
  }

  public spawnCollectible(x: number, y: number, type: CollectibleType, weaponType?: WeaponType) {
    let color = '#eab308';
    if (type === 'SHIELD') color = '#38bdf8';
    if (type === 'MAGNET') color = '#ec4899';
    if (type === 'BOMB') color = '#f97316';
    if (type === 'HEALTH') color = '#22c55e';

    this.collectibles.push({
      id: 'col_' + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: 65 + Math.random() * 25,
      radius: 15,
      type,
      weaponType,
      rot: 0,
      vRot: (Math.random() - 0.5) * 2.5,
      lifetime: 15,
      color,
      pulseTimer: 0,
    });
  }

  private collectItem(c: Collectible) {
    if (c.type === 'WEAPON_ORB' && c.weaponType) {
      this.player.currentWeapon = c.weaponType;
      soundManager.playPickupOrb();
      const wep = WEAPON_DEFINITIONS[c.weaponType];
      this.spawnFloatingText(this.player.x, this.player.y - 40, `${wep.nameTr.toUpperCase()}!`, wep.color, 20);
      this.callbacks.onWeaponChange(c.weaponType);
    } else if (c.type === 'POWER_TRIANGLE') {
      if (this.player.powerLevel < 5) {
        this.player.powerLevel++;
        soundManager.playPickupTriangle();
        this.spawnFloatingText(this.player.x, this.player.y - 40, `GÜÇ +1 (LVL ${this.player.powerLevel})`, '#eab308', 20);
        this.callbacks.onPowerUp(this.player.powerLevel);
      } else {
        this.player.score += 250;
        soundManager.playPickupTriangle();
        this.spawnFloatingText(this.player.x, this.player.y - 40, 'MAKS GÜÇ! +250', '#facc15', 18);
      }
    } else if (c.type === 'SHIELD') {
      this.player.shieldTime = 8.0;
      soundManager.playPickupSpecial();
      this.spawnFloatingText(this.player.x, this.player.y - 40, 'KALKAN AKTİF!', '#38bdf8', 18);
    } else if (c.type === 'MAGNET') {
      this.player.magnetTime = 10.0;
      soundManager.playPickupSpecial();
      this.spawnFloatingText(this.player.x, this.player.y - 40, 'MANYETİK ALAN!', '#ec4899', 18);
    } else if (c.type === 'BOMB') {
      soundManager.playBomb();
      this.screenShakeIntensity = 20;
      this.spawnFloatingText(this.player.x, this.player.y - 40, 'MEGA BOMBA!', '#f97316', 22);
      this.triggerChainExplosion(this.width / 2, this.height / 2, this.width * 0.7);
    } else if (c.type === 'HEALTH') {
      if (this.player.lives < this.player.maxLives) {
        this.player.lives++;
      }
      soundManager.playPickupSpecial();
      this.spawnFloatingText(this.player.x, this.player.y - 40, 'CAN YENİLENDİ! ❤', '#22c55e', 18);
    }

    this.spawnHitParticles(c.x, c.y, c.color, 12);
  }

  private damagePlayer() {
    if (this.player.shieldTime > 0) {
      this.player.shieldTime = 0;
      soundManager.playPickupSpecial();
      this.spawnFloatingText(this.player.x, this.player.y - 30, 'KALKAN KIRILDI!', '#38bdf8', 18);
      this.player.invulnerableTime = 1.2;
      return;
    }

    this.player.lives--;
    this.player.damageTaken++;
    this.player.combo = 0;
    this.player.invulnerableTime = 2.0;
    soundManager.playDamage();
    this.screenShakeIntensity = 18;

    this.spawnExplosion(this.player.x, this.player.y, '#ef4444', 25);
    this.spawnFloatingText(this.player.x, this.player.y - 40, 'HASAR ALINDI!', '#ef4444', 20);

    if (this.player.lives <= 0) {
      this.handleGameOver();
    }
  }

  private incrementCombo() {
    this.player.combo++;
    this.player.comboTimer = 3.2;
    if (this.player.combo > this.player.maxCombo) {
      this.player.maxCombo = this.player.combo;
    }

    if (this.player.combo >= 10 && this.player.combo % 5 === 0) {
      this.spawnFloatingText(this.player.x, this.player.y - 60, `MEGA KOMBO x${this.player.combo}!`, '#f43f5e', 22);
    }
  }

  private checkObjectives() {
    const obj = this.levelConfig.objective;
    let current = 0;

    switch (obj.type) {
      case 'DESTROY_ASTEROIDS':
        current = this.player.asteroidsDestroyed;
        break;
      case 'SURVIVE_TIME':
        current = Math.floor(this.levelTimer);
        break;
      case 'COLLECT_CRYSTALS':
        current = this.player.crystalsCollected;
        break;
      case 'DEFEAT_BOSS':
        current = this.boss === null && this.bossSpawned ? 1 : 0;
        break;
    }

    this.objectiveProgress = current;
    this.callbacks.onObjectiveUpdate(current, obj.target);

    // When wave objective is met for the first time
    if (current >= obj.target && !this.objectiveCompleted && this.isRunning) {
      this.objectiveCompleted = true;

      // If boss has not been spawned yet, spawn the rival boss spaceship now!
      if (!this.bossSpawned) {
        this.spawnRivalBoss();
      } else if (!this.finishLine && !this.boss) {
        this.spawnFinishLine();
      }
    }
  }

  // Seamlessly continue into next level without interruption or window opening
  private completeLevelAndSeamlessAdvance() {
    const completedLevelId = this.levelConfig.id;
    let stars = 3;
    if (this.player.damageTaken > 1) stars = 1;
    else if (this.player.damageTaken === 1) stars = 2;

    this.callbacks.onLevelComplete({
      levelId: completedLevelId,
      score: this.player.score,
      asteroidsDestroyed: this.player.asteroidsDestroyed,
      maxCombo: this.player.maxCombo,
      damageTaken: this.player.damageTaken,
      timeSeconds: Math.floor(this.levelTimer),
      stars,
    });

    if (completedLevelId >= 20) {
      this.isRunning = false;
      soundManager.playVictory();
      return;
    }

    // ADVANCE DIRECTLY TO NEXT LEVEL WITHIN THE SAME REAL-TIME JOURNEY
    const nextLevelId = completedLevelId + 1;
    const nextConfig = LEVELS.find((l) => l.id === nextLevelId) || LEVELS[0];

    this.levelConfig = nextConfig;
    this.finishLine = null;
    this.objectiveCompleted = false;
    this.bossSpawned = false;
    this.boss = null;
    this.asteroidSpawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.isWarping = false;
    this.levelTimer = 0;

    // Reward player +1 life on completing a level
    if (this.player.lives < this.player.maxLives) {
      this.player.lives++;
    }

    this.spawnFloatingText(
      this.width / 2,
      this.height * 0.4,
      `🚀 BÖLÜM ${nextLevelId}: ${nextConfig.name.toUpperCase()} BAŞLADI!`,
      '#38bdf8',
      24
    );

    if (this.callbacks.onLevelAdvance) {
      this.callbacks.onLevelAdvance(nextLevelId);
    }
  }

  private handleGameOver() {
    this.isRunning = false;
    soundManager.playGameOver();
    this.callbacks.onGameOver({
      score: this.player.score,
      asteroidsDestroyed: this.player.asteroidsDestroyed,
      levelReached: this.levelConfig.id,
    });
  }

  private spawnHitParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        shape: 'spark',
      });
    }
  }

  private spawnExplosion(x: number, y: number, color: string, baseRadius: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: baseRadius * 0.5,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.4,
      shape: 'ring',
    });

    const count = 15 + Math.floor(baseRadius * 0.5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color: Math.random() < 0.4 ? '#ffffff' : color,
        alpha: 1,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
        shape: 'circle',
      });
    }
  }

  public spawnFloatingText(x: number, y: number, text: string, color: string, fontSize = 16) {
    this.floatingTexts.push({
      id: 'ft_' + Math.random(),
      x,
      y,
      text,
      color,
      fontSize,
      alpha: 1,
      life: 0,
      maxLife: 1.2,
    });
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    if (this.levelConfig.objective.type === 'DEFEAT_BOSS') {
      this.spawnRivalBoss();
    }
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }
}
