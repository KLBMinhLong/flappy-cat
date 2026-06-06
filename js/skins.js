// ==================== SKINS SYSTEM ====================
export const SKINS = [
  {
    id: 'default',
    name: 'Mèo Hồng',
    desc: 'Mèo hồng dễ thương mặc định',
    bodyColor: '#ff96c8',
    headColor: '#ffb6d9',
    earColor: '#ff96c8',
    innerEar: '#ff69b4',
    noseColor: '#ff69b4',
    eyeColor: '#333',
    unlock: null, // always unlocked
    icon: '🐱',
  },
  {
    id: 'blue',
    name: 'Mèo Xanh',
    desc: 'Mèo xanh cool ngầu',
    bodyColor: '#60a5fa',
    headColor: '#93c5fd',
    earColor: '#60a5fa',
    innerEar: '#3b82f6',
    noseColor: '#3b82f6',
    eyeColor: '#1e3a5f',
    unlock: { type: 'score', value: 10 },
    icon: '💙',
  },
  {
    id: 'golden',
    name: 'Mèo Vàng',
    desc: 'Mèo vàng may mắn',
    bodyColor: '#fbbf24',
    headColor: '#fcd34d',
    earColor: '#fbbf24',
    innerEar: '#f59e0b',
    noseColor: '#f59e0b',
    eyeColor: '#78350f',
    unlock: { type: 'score', value: 25 },
    icon: '💛',
  },
  {
    id: 'dark',
    name: 'Mèo Bóng Đêm',
    desc: 'Mèo tối bí ẩn',
    bodyColor: '#6b7280',
    headColor: '#9ca3af',
    earColor: '#6b7280',
    innerEar: '#4b5563',
    noseColor: '#4b5563',
    eyeColor: '#fbbf24',
    unlock: { type: 'score', value: 50 },
    icon: '🖤',
  },
  {
    id: 'rainbow',
    name: 'Mèo Cầu Vồng',
    desc: 'Mèo phát sáng 7 màu',
    bodyColor: 'rainbow',
    headColor: 'rainbow',
    earColor: 'rainbow',
    innerEar: '#ff69b4',
    noseColor: '#ff69b4',
    eyeColor: '#333',
    unlock: { type: 'score', value: 100 },
    icon: '🌈',
  },
  {
    id: 'ninja',
    name: 'Mèo Ninja',
    desc: 'Ninja mèo bất khả chiến bại',
    bodyColor: '#1f2937',
    headColor: '#374151',
    earColor: '#1f2937',
    innerEar: '#ef4444',
    noseColor: '#ef4444',
    eyeColor: '#ef4444',
    unlock: { type: 'pipes', value: 100 },
    icon: '🥷',
  },
  {
    id: 'galaxy',
    name: 'Mèo Ngân Hà',
    desc: 'Du hành xuyên dải ngân hà',
    bodyColor: '#4c1d95',
    headColor: '#6d28d9',
    earColor: '#4c1d95',
    innerEar: '#a78bfa',
    noseColor: '#a78bfa',
    eyeColor: '#e0e7ff',
    unlock: { type: 'totalGames', value: 50 },
    icon: '🌌',
  },
  {
    id: 'fire',
    name: 'Mèo Lửa',
    desc: 'Thiêu đột mọi ống nước',
    bodyColor: '#dc2626',
    headColor: '#f87171',
    earColor: '#dc2626',
    innerEar: '#fbbf24',
    noseColor: '#fbbf24',
    eyeColor: '#fbbf24',
    unlock: { type: 'combo', value: 10 },
    icon: '🔥',
  },
  {
    id: 'ice',
    name: 'Mèo Băng',
    desc: 'Lạnh lùng vượt mọi thử thách',
    bodyColor: '#67e8f9',
    headColor: '#a5f3fc',
    earColor: '#67e8f9',
    innerEar: '#06b6d4',
    noseColor: '#06b6d4',
    eyeColor: '#164e63',
    unlock: { type: 'powerups', value: 50 },
    icon: '🧊',
  },
  {
    id: 'sakura',
    name: 'Mèo Hoa Anh Đào',
    desc: 'Dịu dàng như mùa xuân',
    bodyColor: '#fda4af',
    headColor: '#fecdd3',
    earColor: '#fda4af',
    innerEar: '#fb7185',
    noseColor: '#fb7185',
    eyeColor: '#881337',
    unlock: { type: 'totalGames', value: 20 },
    icon: '🌸',
  },
  {
    id: 'cyber',
    name: 'Mèo Cyber',
    desc: 'Neon & futuristic',
    bodyColor: '#06b6d4',
    headColor: '#22d3ee',
    earColor: '#06b6d4',
    innerEar: '#a855f7',
    noseColor: '#a855f7',
    eyeColor: '#a855f7',
    unlock: { type: 'score', value: 200 },
    icon: '🤖',
  },
  {
    id: 'ghost',
    name: 'Mèo Ma',
    desc: 'Xuyên qua mọi vật cản',
    bodyColor: 'rgba(200,220,255,0.6)',
    headColor: 'rgba(220,235,255,0.7)',
    earColor: 'rgba(200,220,255,0.5)',
    innerEar: 'rgba(150,180,255,0.5)',
    noseColor: '#c084fc',
    eyeColor: '#c084fc',
    unlock: { type: 'dodged', value: 500 },
    icon: '👻',
  },
];

let selectedSkin = 'default';
let unlockedSkins = new Set(['default']);

export function init() {
  const saved = localStorage.getItem('flappyCat_skin');
  if (saved && SKINS.find(s => s.id === saved)) selectedSkin = saved;

  const savedUnlocked = localStorage.getItem('flappyCat_unlocked');
  if (savedUnlocked) {
    try { unlockedSkins = new Set(JSON.parse(savedUnlocked)); } catch {}
  }
  unlockedSkins.add('default');
}

export function getSelected() {
  return SKINS.find(s => s.id === selectedSkin) || SKINS[0];
}

export function select(id) {
  if (!unlockedSkins.has(id)) return false;
  selectedSkin = id;
  localStorage.setItem('flappyCat_skin', id);
  return true;
}

export function isUnlocked(id) {
  return unlockedSkins.has(id);
}

export function tryUnlock(stats) {
  const newlyUnlocked = [];
  for (const skin of SKINS) {
    if (unlockedSkins.has(skin.id)) continue;
    if (!skin.unlock) continue;

    let val = 0;
    switch (skin.unlock.type) {
      case 'score': val = stats.bestScore || 0; break;
      case 'pipes': val = stats.totalPipes || 0; break;
      case 'totalGames': val = stats.totalGames || 0; break;
      case 'combo': val = stats.bestCombo || 0; break;
      case 'powerups': val = stats.totalPowerups || 0; break;
      case 'dodged': val = stats.totalDodged || 0; break;
    }

    if (val >= skin.unlock.value) {
      unlockedSkins.add(skin.id);
      newlyUnlocked.push(skin);
    }
  }

  if (newlyUnlocked.length > 0) {
    localStorage.setItem('flappyCat_unlocked', JSON.stringify([...unlockedSkins]));
  }
  return newlyUnlocked;
}

export function getAll() { return SKINS; }
export function getUnlockedSet() { return unlockedSkins; }
