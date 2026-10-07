import { WeaponInfo, WeaponType } from '../types/game';

export const WEAPON_DEFINITIONS: Record<WeaponType, WeaponInfo> = {
  NORMAL: {
    type: 'NORMAL',
    nameTr: 'Normal Lazer',
    color: '#38bdf8',
    accentColor: '#0284c7',
    description: 'Dengeli tekli enerji atışı. Hızlı ve güvenilir.',
    baseFireRate: 5.5, // shots per sec
    baseDamage: 22,
  },
  DOUBLE: {
    type: 'DOUBLE',
    nameTr: 'Çift Atış',
    color: '#60a5fa',
    accentColor: '#2563eb',
    description: 'İki paralel namludan eşzamanlı ikiz lazer ateşi.',
    baseFireRate: 6.0,
    baseDamage: 18,
  },
  TRIPLE: {
    type: 'TRIPLE',
    nameTr: 'Üçlü Atış',
    color: '#c084fc',
    accentColor: '#9333ea',
    description: 'Sol, orta ve sağa dağılan üç yönlü plazma yayılımı.',
    baseFireRate: 5.0,
    baseDamage: 20,
  },
  SPREAD: {
    type: 'SPREAD',
    nameTr: 'Saçılma Atışı',
    color: '#fb923c',
    accentColor: '#ea580c',
    description: 'Geniş yelpaze şeklinde açılan çoklu mermi yağmuru.',
    baseFireRate: 4.2,
    baseDamage: 15,
  },
  PLASMA: {
    type: 'PLASMA',
    nameTr: 'Plazma Topu',
    color: '#2dd4bf',
    accentColor: '#0d9488',
    description: 'Büyük ve yoğun enerji küresi. Yüksek yıkım gücü.',
    baseFireRate: 2.8,
    baseDamage: 55,
  },
  BEAM: {
    type: 'BEAM',
    nameTr: 'Enerji Işını',
    color: '#f472b6',
    accentColor: '#db2777',
    description: 'Kesintisiz odaklanmış lazer ışını. Sürekli hasar verir.',
    baseFireRate: 15.0,
    baseDamage: 8,
  },
};

export const WEAPON_COLORS: Record<WeaponType, { orb: string; trail: string; border: string }> = {
  NORMAL: { orb: '#38bdf8', trail: '#0284c7', border: '#7dd3fc' },
  DOUBLE: { orb: '#3b82f6', trail: '#1d4ed8', border: '#93c5fd' },
  TRIPLE: { orb: '#a855f7', trail: '#6b21a8', border: '#d8b4fe' },
  SPREAD: { orb: '#f97316', trail: '#c2410c', border: '#fdba74' },
  PLASMA: { orb: '#14b8a6', trail: '#0f766e', border: '#5eead4' },
  BEAM: { orb: '#ec4899', trail: '#be185d', border: '#f472b6' },
};
