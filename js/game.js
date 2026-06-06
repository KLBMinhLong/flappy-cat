// ==================== GAME ENGINE ====================
import { W, H, getCtx } from './utils.js';
import * as Audio from './audio.js';
import * as Cat from './cat.js';
import * as Pipes from './pipes.js';
import * as Powerups from './powerups.js';
import * as Particles from './particles.js';
import * as FloatText from './floattext.js';
import * as Background from './background.js';

export const STATE = { IDLE: 0, PLAYING: 1, OVER: 2 };

let state = STATE.IDLE;
let score = 0;
let combo = 1;
let comboTimer = 0;
let pipesCleared = 0;
let powerupsCollected = 0;
let difficulty = 0;
let invincibleTimer = 0;
let shakeTimer = 0;
let shakeMag = 0;
let lastPipe = 0;
let animFrame = null;

// Callbacks
let onScoreChange = null;
let onComboChange = null;
let onPUBarUpdate = null;
let onGameOver = null;

export function setCallbacks(cbs) {
  onScoreChange = cbs.onScoreChange || null;
  onComboChange = cbs.onComboChange || null;
  onPUBarUpdate = cbs.onPUBarUpdate || null;
  onGameOver = cbs.onGameOver || null;
}

export function getState() { return state; }
export function getScore() { return score; }
export function getCombo() { return combo; }
export function getPipesCleared() { return pipesCleared; }
export function getPowerupsCollected() { return powerupsCollected; }
export function getDifficulty() { return difficulty; }

export function start() {
  Cat.reset();
  Pipes.reset();
  Powerups.reset();
  Particles.reset();
  FloatText.reset();
  Background.resetGround();

  score = 0;
  combo = 1;
  comboTimer = 0;
  pipesCleared = 0;
  powerupsCollected = 0;
  difficulty = 0;
  invincibleTimer = 0;
  shakeTimer = 0;
  lastPipe = performance.now() - Pipes.getInterval(0) + 500;

  state = STATE.PLAYING;

  if (onScoreChange) onScoreChange(score);
  if (onComboChange) onComboChange(combo);
  if (onPUBarUpdate) onPUBarUpdate();

  Audio.startMusic();

  if (animFrame) cancelAnimationFrame(animFrame);
  loop();
}

export function stop() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  Audio.stopMusic();
}

export function jump() {
  if (state !== STATE.PLAYING) return;
  Cat.jump();
  Audio.play('flap');
  const c = Cat.get();
  Particles.spawn(c.x - 10, c.y + 10, 'rgba(255,255,255,0.5)', 3);
}

function update() {
  if (state !== STATE.PLAYING) return;

  const dt = 16.67;
  const now = performance.now();
  difficulty = Math.floor(score / 5);

  Cat.update();

  if (invincibleTimer > 0) invincibleTimer -= dt;
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      combo = 1;
      if (onComboChange) onComboChange(combo);
    }
  }
  if (shakeTimer > 0) shakeTimer -= dt;

  const speedMul = Powerups.getSlow() > 0 ? 0.6 : 1;
  const speed = Pipes.getSpeed(difficulty) * speedMul;
  const gap = Pipes.getGap(difficulty);

  // Spawn pipes
  if (now - lastPipe > Pipes.getInterval(difficulty)) {
    const minTop = 70;
    const maxTop = H() - gap - 70;
    const topH = minTop + Math.random() * (maxTop - minTop);
    Pipes.spawn(topH);
    Powerups.spawn(W() + Pipes.WIDTH + 40, topH, gap);
    lastPipe = now;
  }

  Pipes.update(speed, gap);
  Powerups.update(speed, dt);

  // Check scoring
  if (Pipes.checkScoring(Cat.get().x, gap)) {
    pipesCleared++;
    score++;
    combo++;
    comboTimer = 2000;

    if (combo >= 3) {
      score++; // bonus point
      Audio.play('combo');
      FloatText.add(Cat.get().x + 30, Cat.get().y - 20, `x${combo}!`, '#ffcc00');
    } else {
      Audio.play('score');
    }

    if (onScoreChange) onScoreChange(score);
    if (onComboChange) onComboChange(combo);
  }

  // Check power-up collection
  const collected = Powerups.checkCollection(Cat.get().x, Cat.get().y);
  if (collected) {
    powerupsCollected++;
    Audio.play('powerup');
    Particles.spawn(collected.x, collected.y, '#ffcc00', 10);
    const label = collected.type === 'shield' ? '🛡️ Shield!' : collected.type === 'slow' ? '⏳ Slow-mo!' : '🐁 Tiny!';
    FloatText.add(collected.x, collected.y - 20, label, '#00ff96');
    if (onPUBarUpdate) onPUBarUpdate();
  }

  Particles.update();
  FloatText.update();
  Background.scrollGround(speed);

  // Collision
  const hit = checkCollision();
  if (hit === 'shield') {
    Powerups.setShield(0);
    invincibleTimer = 500;
    Cat.get().x -= 15;
    Cat.get().vy = Cat.JUMP;
    Audio.play('hit');
    shakeTimer = 200;
    shakeMag = 5;
    Particles.spawn(Cat.get().x, Cat.get().y, '#64c8ff', 15);
    FloatText.add(Cat.get().x, Cat.get().y - 30, '🛡️ Saved!', '#64c8ff');
    if (onPUBarUpdate) onPUBarUpdate();
  } else if (hit === 'die') {
    gameOver();
  }
}

function checkCollision() {
  const c = Cat.get();
  const sz = Powerups.isTiny() ? Cat.SIZE * 0.65 : Cat.SIZE;
  const gap = Pipes.getGap(difficulty);

  if (invincibleTimer > 0) return 'none';
  if (c.y + sz * 0.3 > H() - 30 || c.y - sz * 0.5 < 0) return 'die';

  for (const p of Pipes.getAll()) {
    if (c.x + sz * 0.5 > p.x && c.x - sz * 0.5 < p.x + Pipes.WIDTH) {
      if (c.y - sz * 0.3 < p.topH || c.y + sz * 0.3 > p.topH + gap) {
        return Powerups.getShield() > 0 ? 'shield' : 'die';
      }
    }
  }
  return 'none';
}

function gameOver() {
  state = STATE.OVER;
  Audio.stopMusic();
  Audio.play('die');

  Particles.spawn(Cat.get().x, Cat.get().y, '#ff69b4', 25);

  if (onGameOver) {
    onGameOver({
      score,
      pipesCleared,
      powerupsCollected,
      combo: combo,
    });
  }
}

function draw() {
  const ctx = getCtx();
  ctx.save();

  if (shakeTimer > 0) {
    ctx.translate(
      (Math.random() - 0.5) * shakeMag,
      (Math.random() - 0.5) * shakeMag
    );
  }

  Background.draw(difficulty);
  Pipes.draw(difficulty);
  Powerups.draw();
  Background.drawGround();
  Cat.draw(invincibleTimer, Powerups.getShield());
  Particles.draw();
  FloatText.draw();

  ctx.restore();
}

function loop() {
  update();
  draw();
  animFrame = requestAnimationFrame(loop);
}

// Draw idle scene (for menu background)
export function drawIdle() {
  difficulty = 0;
  Background.draw(0);
  Background.drawGround();
}
