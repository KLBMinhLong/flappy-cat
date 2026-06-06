// ==================== FLOATING TEXT ====================
import { getCtx } from './utils.js';

let texts = [];

export function reset() { texts = []; }

export function add(x, y, text, color = '#fff') {
  texts.push({ x, y, text, color, life: 1, vy: -2 });
}

export function update() {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y += t.vy;
    t.life -= 0.02;
    if (t.life <= 0) texts.splice(i, 1);
  }
}

export function draw() {
  const ctx = getCtx();
  for (const t of texts) {
    ctx.globalAlpha = t.life;
    ctx.fillStyle = t.color;
    ctx.font = `bold ${18 + (1 - t.life) * 10}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}
