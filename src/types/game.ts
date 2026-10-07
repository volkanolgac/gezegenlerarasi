export type GameState =
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'STORY_BRIEFING'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'HOW_TO_PLAY'
  | 'SETTINGS';

export type WeaponType =
  | 'NORMAL'
  | 'DOUBLE'
  | 'TRIPLE'
  | 'SPREAD'
  | 'PLASMA'
  | 'BEAM';

export interface WeaponInfo {
  type: WeaponType;
  nameTr: string;
  color: string;
  accentColor: string;
  description: string;
  baseFireRate: number; // shots per second
  baseDamage: number;
}

export type AsteroidType =
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'CRYSTAL'
  | 'ARMOR'
  | 'EXPLOSIVE';

export type EnemyType =
  | 'SCOUT'
  | 'DRONE'
  | 'HEAVY'
  | 'ELITE';

export type CollectibleType =
  | 'WEAPON_ORB'
  | 'POWER_TRIANGLE'
  | 'SHIELD'
  | 'MAGNET'
  | 'BOMB'
  | 'HEALTH';

export interface PlayerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  tilt: number; // visual banking angle
  radius: number;
  lives: number;
  maxLives: number;
  invulnerableTime: number; // seconds remaining
  shieldTime: number; // seconds remaining
  magnetTime: number; // seconds remaining
  currentWeapon: WeaponType;
  powerLevel: number; // 1 to 5
  score: number;
  combo: number;
  comboTimer: number; // seconds until combo resets
  maxCombo: number;
  asteroidsDestroyed: number;
  enemiesDestroyed: number;
  crystalsCollected: number;
  damageTaken: number;
  isDestroyed?: boolean;
  respawnTimer?: number;
  isRespawning?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  isEnemy: boolean;
  type: WeaponType | 'ENEMY';
  lifetime: number; // seconds
  glow?: string;
  beamLength?: number;
}

export interface AsteroidVertex {
  angle: number;
  distance: number;
}

export interface Crater {
  x: number;
  y: number;
  r: number;
}

export interface Asteroid {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: AsteroidType;
  vertices: AsteroidVertex[];
  craters: Crater[];
  color: string;
  darkColor: string;
  highlightColor: string;
  splitCount: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  radius: number;
  shootCooldown: number;
  shootTimer: number;
  patternTimer: number;
  color: string;
}

export type BossVisualType =
  | 'RIVAL_FIGHTER'
  | 'RIVAL_CRUISER'
  | 'RIVAL_BATTLESHIP'
  | 'RIVAL_FLAGSHIP'
  | 'ASTEROID_GUARDIAN'
  | 'SPACE_DESTROYER'
  | 'NEBULA_BEAST'
  | 'COSMIC_CORE';

export interface Boss {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhases: number;
  attackTimer: number;
  currentAttack: string;
  color: string;
  weakpointAngle: number;
  visualType: BossVisualType;
}

export interface FinishLine {
  y: number;
  speed: number;
  active: boolean;
  passed: boolean;
  textTr: string;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: CollectibleType;
  weaponType?: WeaponType;
  rot: number;
  vRot: number;
  lifetime: number;
  color: string;
  pulseTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'ring' | 'triangle' | 'warp';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
  layer: number;
  color?: string;
}

export interface PlanetaryRegion {
  id: string;
  nameTr: string;
  descriptionTr: string;
  primaryColor: string;
  secondaryColor: string;
  planetColor: string;
  planetRing?: boolean;
  bgGradient: [string, string];
  ambientType: 'stars' | 'lava' | 'snow' | 'gas' | 'dark' | 'core';
}

export interface LevelObjective {
  type: 'DESTROY_ASTEROIDS' | 'SURVIVE_TIME' | 'COLLECT_CRYSTALS' | 'DEFEAT_BOSS';
  target: number;
  labelTr: string;
}

export interface StoryDialogue {
  speaker: 'NOVA_PILOT' | 'HQ_COMMAND' | 'ANCIENT_AI' | 'RIVAL_COMMANDER';
  speakerNameTr: string;
  avatar: string;
  textTr: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  regionId: string;
  durationSeconds: number; // total level duration or reference
  objective: LevelObjective;
  asteroidRate: number; // asteroids per second
  asteroidSpeedMultiplier: number;
  enemySpawnRate: number; // enemies per second
  allowedAsteroids: AsteroidType[];
  allowedEnemies: EnemyType[];
  hasBoss: boolean;
  bossType?: BossVisualType;
  bossName?: string;
  briefing: StoryDialogue[];
  debriefing?: StoryDialogue[];
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  mouseSensitivity: number;
}

export interface SaveData {
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelId -> 1..3
  highScore: number;
  bestCombo: number;
  totalAsteroids: number;
  settings: GameSettings;
}
