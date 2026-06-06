// ==================== PARTICLES ====================
import { getCtx } from './utils.js';

let particles = [];

export function reset() { particles = []; }

export function spawn(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

export function update() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function draw() {
  const ctx = getCtx();
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function count() { return particles.length; }
