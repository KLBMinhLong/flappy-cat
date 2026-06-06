// ==================== POWER-UPS ====================
import { getCtx, dist } from './utils.js';
import * as Cat from './cat.js';

let powerups = [];
let activeShield = 0, activeSlow = 0, activeTiny = 0;

export function reset() {
  powerups = [];
  activeShield = 0;
  activeSlow = 0;
  activeTiny = 0;
}

export function getShield() { return activeShield; }
export function getSlow() { return activeSlow; }
export function getTiny() { return activeTiny; }
export function setShield(v) { activeShield = v; }
export function isTiny() { return activeTiny > 0; }

export function spawn(x, topH, gap) {
  if (Math.random() < 0.2) {
    const types = ['shield', 'slow', 'tiny'];
    const type = types[Math.floor(Math.random() * types.length)];
    const py = topH + gap / 2;
    powerups.push({ x, y: py, type, collected: false, bob: Math.random() * Math.PI * 2 });
  }
}

export function update(speed, dt) {
  if (activeShield > 0) activeShield -= dt;
  if (activeSlow > 0) activeSlow -= dt;
  if (activeTiny > 0) activeTiny -= dt;

  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].x -= speed;
    if (powerups[i].x < -30) powerups.splice(i, 1);
  }
}

export function checkCollection(catX, catY) {
  for (const pu of powerups) {
    if (pu.collected) continue;
    if (dist(catX, catY, pu.x, pu.y) < Cat.SIZE + 14) {
      pu.collected = true;
      switch (pu.type) {
        case 'shield': activeShield = 5000; break;
        case 'slow': activeSlow = 4000; break;
        case 'tiny': activeTiny = 5000; break;
      }
      return pu;
    }
  }
  return null;
}

export function draw() {
  const ctx = getCtx();
  const now = performance.now();

  for (const pu of powerups) {
    if (pu.collected) continue;

    const bob = Math.sin(now * 0.003 + pu.bob) * 5;
    const sz = 14;

    ctx.save();
    ctx.translate(pu.x, pu.y + bob);

    // Glow
    const glowColor = pu.type === 'shield' ? 'rgba(100,200,255,0.2)' : pu.type === 'slow' ? 'rgba(255,200,0,0.2)' : 'rgba(0,255,150,0.2)';
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, sz + 4 + Math.sin(now * 0.005) * 2, 0, Math.PI * 2);
    ctx.fill();

    // Circle
    const circleColor = pu.type === 'shield' ? '#64c8ff' : pu.type === 'slow' ? '#ffc800' : '#00ff96';
    ctx.fillStyle = circleColor;
    ctx.beginPath();
    ctx.arc(0, 0, sz, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pu.type === 'shield' ? '🛡️' : pu.type === 'slow' ? '⏳' : '🐁', 0, 0);

    ctx.restore();
  }
}
