// ==================== MAIN ENTRY ====================
import { setCanvas, W, H } from './utils.js';
import * as Audio from './audio.js';
import * as Game from './game.js';
import * as Menu from './menu.js';
import * as Background from './background.js';
import * as Skins from './skins.js';

// ==================== INIT ====================
const canvas = document.getElementById('game');
const container = document.getElementById('gameContainer');

function resize() {
  canvas.width = Math.min(400, window.innerWidth);
  canvas.height = Math.min(650, window.innerHeight);
}
resize();
window.addEventListener('resize', resize);

setCanvas(canvas);
Background.init();
Menu.init();
Menu.registerScreens();
Menu.initSettings();

// ==================== GAME CALLBACKS ====================
Game.setCallbacks({
  onScoreChange: (score) => {
    document.getElementById('score').textContent = score;
  },
  onComboChange: (combo) => {
    const el = document.getElementById('combo');
    if (combo >= 2) {
      el.textContent = `🔥 x${combo} combo`;
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
  },
  onPUBarUpdate: () => {
    document.getElementById('puShield').classList.toggle('active', Game.getPowerupsCollected() > 0 && document.getElementById('puShield') !== null);
    // Simpler: just read from powerups module
    import('./powerups.js').then(PU => {
      document.getElementById('puShield').classList.toggle('active', PU.getShield() > 0);
      document.getElementById('puSlow').classList.toggle('active', PU.getSlow() > 0);
      document.getElementById('puTiny').classList.toggle('active', PU.getTiny() > 0);
    });
  },
  onGameOver: (data) => {
    const newSkins = Menu.updateAfterGame(data);

    // Show unlock notification
    if (newSkins.length > 0) {
      const names = newSkins.map(s => `${s.icon} ${s.name}`).join(', ');
      setTimeout(() => alert(`🎉 Mở khóa skin mới: ${names}!`), 500);
    }

    // Update game over screen
    const stats = Menu.getStats();
    const isNewBest = data.score >= stats.bestScore;
    document.getElementById('finalScore').textContent = data.score;
    document.getElementById('statBest').textContent = stats.bestScore;
    document.getElementById('statPipes').textContent = data.pipesCleared;
    document.getElementById('statPowerups').textContent = data.powerupsCollected;

    const bestLabel = document.getElementById('bestLabel');
    bestLabel.textContent = isNewBest ? '🏆 NEW BEST!' : `Best: ${stats.bestScore}`;
    bestLabel.className = isNewBest ? 'best new-best' : 'best';

    // Vibrate on mobile
    if (Menu.shouldVibrate() && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Hide HUD, show game over
    document.getElementById('hud').classList.add('hidden');
    Menu.show('gameOver');
  },
});

// ==================== BUTTON HANDLERS ====================
document.getElementById('btnPlay').addEventListener('click', () => {
  Audio.ensureCtx();
  Menu.show(null); // hide all screens
  document.getElementById('hud').classList.remove('hidden');
  Game.start();
});

document.getElementById('btnSkins').addEventListener('click', () => {
  Menu.show('skins');
  Menu.renderSkinsScreen();
});

document.getElementById('btnSettings').addEventListener('click', () => {
  Menu.show('settings');
});

document.getElementById('btnAchievements').addEventListener('click', () => {
  Menu.show('achievements');
  Menu.renderAchievementsScreen();
});

document.getElementById('btnRestart').addEventListener('click', () => {
  Menu.show(null);
  document.getElementById('hud').classList.remove('hidden');
  Game.start();
});

document.getElementById('btnBackToMenu').addEventListener('click', () => {
  Game.stop();
  Menu.updateMenuHighscore();
  Menu.show('menu');
});

// Back buttons
document.getElementById('btnSkinsBack').addEventListener('click', () => Menu.show('menu'));
document.getElementById('btnSettingsBack').addEventListener('click', () => Menu.show('menu'));
document.getElementById('btnAchievementsBack').addEventListener('click', () => Menu.show('menu'));

// ==================== GAME INPUT ====================
function handleGameInput(e) {
  if (e) e.preventDefault();
  if (Game.getState() === Game.STATE.PLAYING) {
    Game.jump();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (Menu.getCurrentScreen() === null && Game.getState() === Game.STATE.PLAYING) {
      Game.jump();
    } else if (Menu.getCurrentScreen() === 'gameOver') {
      Menu.show(null);
      document.getElementById('hud').classList.remove('hidden');
      Game.start();
    } else if (Menu.getCurrentScreen() === 'menu') {
      document.getElementById('btnPlay').click();
    }
  }
});

canvas.addEventListener('pointerdown', (e) => {
  if (Game.getState() === Game.STATE.PLAYING && Menu.getCurrentScreen() === null) {
    handleGameInput(e);
  }
});

// ==================== MENU BACKGROUND ANIMATION ====================
function menuBackgroundLoop() {
  if (Menu.getCurrentScreen() === 'menu') {
    Game.drawIdle();
  }
  requestAnimationFrame(menuBackgroundLoop);
}

// ==================== START ====================
Menu.updateMenuHighscore();
Menu.show('menu');
menuBackgroundLoop();
