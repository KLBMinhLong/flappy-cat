// ==================== MENU ====================
import * as Skins from './skins.js';
import * as Audio from './audio.js';

// Stats (persisted)
let stats = {
  bestScore: 0,
  totalPipes: 0,
  totalGames: 0,
  bestCombo: 0,
  totalPowerups: 0,
  totalDodged: 0,
};

// Achievements
const ACHIEVEMENTS = [
  { id: 'first_flight', name: 'Chuyến bay đầu', desc: 'Chơi lần đầu', icon: '✈️', check: s => s.totalGames >= 1 },
  { id: 'score_10', name: 'Mười ống', desc: 'Đạt 10 điểm', icon: '🔟', check: s => s.bestScore >= 10 },
  { id: 'score_25', name: 'Bạc', desc: 'Đạt 25 điểm', icon: '🥈', check: s => s.bestScore >= 25 },
  { id: 'score_50', name: 'Vàng', desc: 'Đạt 50 điểm', icon: '🥇', check: s => s.bestScore >= 50 },
  { id: 'score_100', name: 'Bạch kim', desc: 'Đạt 100 điểm', icon: '💎', check: s => s.bestScore >= 100 },
  { id: 'score_200', name: 'Huyền thoại', desc: 'Đạt 200 điểm', icon: '👑', check: s => s.bestScore >= 200 },
  { id: 'combo_5', name: 'Combo x5', desc: 'Combo x5 liên tiếp', icon: '🔥', check: s => s.bestCombo >= 5 },
  { id: 'combo_10', name: 'Combo x10', desc: 'Combo x10 liên tiếp', icon: '💥', check: s => s.bestCombo >= 10 },
  { id: 'games_10', name: 'Chăm chỉ', desc: 'Chơi 10 lần', icon: '🎮', check: s => s.totalGames >= 10 },
  { id: 'games_50', name: 'Nghiện game', desc: 'Chơi 50 lần', icon: '🎯', check: s => s.totalGames >= 50 },
  { id: 'pipes_100', name: '100 ống', desc: 'Tổng 100 ống đã qua', icon: '🏗️', check: s => s.totalPipes >= 100 },
  { id: 'pipes_500', name: '500 ống', desc: 'Tổng 500 ống đã qua', icon: '🏰', check: s => s.totalPipes >= 500 },
  { id: 'powerup_10', name: 'Sưu tầm', desc: 'Nhặt 10 power-up', icon: '⭐', check: s => s.totalPowerups >= 10 },
  { id: 'powerup_50', name: 'Tham lam', desc: 'Nhặt 50 power-up', icon: '✨', check: s => s.totalPowerups >= 50 },
];

export function getStats() { return stats; }

export function init() {
  loadStats();
  Skins.init();
}

export function loadStats() {
  try {
    const saved = localStorage.getItem('flappyCat_stats');
    if (saved) stats = { ...stats, ...JSON.parse(saved) };
  } catch {}
}

export function saveStats() {
  localStorage.setItem('flappyCat_stats', JSON.stringify(stats));
}

export function updateAfterGame(gameData) {
  const { score, pipesCleared, powerupsCollected, combo } = gameData;

  stats.totalGames++;
  stats.totalPipes += pipesCleared;
  stats.totalPowerups += powerupsCollected;
  if (score > stats.bestScore) stats.bestScore = score;
  if (combo > stats.bestCombo) stats.bestCombo = combo;

  saveStats();

  // Try unlock skins
  const newSkins = Skins.tryUnlock(stats);
  return newSkins;
}

export function getUnlockedAchievements() {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.check(stats),
  }));
}

// ==================== SCREEN MANAGEMENT ====================
const screens = {};
let currentScreen = null;

export function registerScreens() {
  screens.menu = document.getElementById('menuScreen');
  screens.skins = document.getElementById('skinsScreen');
  screens.settings = document.getElementById('settingsScreen');
  screens.achievements = document.getElementById('achievementsScreen');
  screens.gameOver = document.getElementById('gameOverScreen');
}

export function show(screenName) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    currentScreen = screenName;
  }
}

export function getCurrentScreen() { return currentScreen; }

export function updateMenuHighscore() {
  const el = document.getElementById('menuHighscore');
  if (el) el.textContent = `Best: ${stats.bestScore}`;
}

// ==================== SKINS SCREEN ====================
export function renderSkinsScreen() {
  const grid = document.getElementById('skinsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const allSkins = Skins.getAll();
  const selected = Skins.getSelected();

  for (const skin of allSkins) {
    const slot = document.createElement('div');
    slot.className = 'skin-slot';
    if (skin.id === selected.id) slot.classList.add('selected');
    if (!Skins.isUnlocked(skin.id)) slot.classList.add('locked');

    slot.textContent = skin.icon;
    slot.addEventListener('click', () => {
      if (Skins.isUnlocked(skin.id)) {
        Skins.select(skin.id);
        renderSkinsScreen();
        renderSkinPreview(skin);
      } else {
        renderSkinPreview(skin);
      }
    });

    grid.appendChild(slot);
  }

  renderSkinPreview(selected);
}

function renderSkinPreview(skin) {
  document.getElementById('skinName').textContent = skin.name;
  document.getElementById('skinDesc').textContent = skin.desc;

  const unlockEl = document.getElementById('skinUnlock');
  if (Skins.isUnlocked(skin.id)) {
    unlockEl.textContent = '✅ Đã mở khóa';
    unlockEl.style.color = '#00ff96';
  } else if (skin.unlock) {
    const labels = {
      score: `Đạt ${skin.unlock.value} điểm`,
      pipes: `Qua ${skin.unlock.value} ống`,
      totalGames: `Chơi ${skin.unlock.value} lần`,
      combo: `Combo x${skin.unlock.value}`,
      powerups: `Nhặt ${skin.unlock.value} power-up`,
      dodged: `Tổng ${skin.unlock.value} ống né được`,
    };
    unlockEl.textContent = `🔒 ${labels[skin.unlock.type] || skin.unlock.type}`;
    unlockEl.style.color = '#ffcc00';
  }

  // Draw preview
  const canvas = document.getElementById('skinPreviewCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 120, 120);
  // Import cat drawPreview dynamically
  import('./cat.js').then(Cat => {
    Cat.drawPreview(ctx, skin, 60, 65, 35);
  });
}

// ==================== SETTINGS SCREEN ====================
export function initSettings() {
  const sfxToggle = document.getElementById('sfxToggle');
  const musicToggle = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const vibrateToggle = document.getElementById('vibrateToggle');

  // Load saved settings
  const saved = JSON.parse(localStorage.getItem('flappyCat_settings') || '{}');
  if (saved.sfx !== undefined) { sfxToggle.checked = saved.sfx; Audio.setSfx(saved.sfx); }
  if (saved.music !== undefined) { musicToggle.checked = saved.music; Audio.setMusic(saved.music); }
  if (saved.volume !== undefined) { volumeSlider.value = saved.volume; Audio.setVolume(saved.volume / 100); }
  if (saved.vibrate !== undefined) { vibrateToggle.checked = saved.vibrate; }

  sfxToggle.addEventListener('change', () => {
    Audio.setSfx(sfxToggle.checked);
    saveSettings();
  });

  musicToggle.addEventListener('change', () => {
    Audio.setMusic(musicToggle.checked);
    saveSettings();
  });

  volumeSlider.addEventListener('input', () => {
    Audio.setVolume(volumeSlider.value / 100);
    saveSettings();
  });

  vibrateToggle.addEventListener('change', () => {
    saveSettings();
  });
}

function saveSettings() {
  localStorage.setItem('flappyCat_settings', JSON.stringify({
    sfx: document.getElementById('sfxToggle').checked,
    music: document.getElementById('musicToggle').checked,
    volume: document.getElementById('volumeSlider').value,
    vibrate: document.getElementById('vibrateToggle').checked,
  }));
}

export function shouldVibrate() {
  return document.getElementById('vibrateToggle')?.checked ?? true;
}

// ==================== ACHIEVEMENTS SCREEN ====================
export function renderAchievementsScreen() {
  const list = document.getElementById('achievementsList');
  if (!list) return;

  list.innerHTML = '';
  const achievements = getUnlockedAchievements();

  for (const a of achievements) {
    const item = document.createElement('div');
    item.className = 'achievement-item' + (a.unlocked ? ' unlocked' : '');
    item.innerHTML = `
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
      ${a.unlocked ? '<div class="achievement-check">✓</div>' : ''}
    `;
    list.appendChild(item);
  }
}
