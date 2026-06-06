// ==================== BACKGROUND ====================
import { getCtx, W, H } from './utils.js';
import * as Pipes from './pipes.js';

let starField = [];
let groundX = 0;

export function init() {
  starField = [];
  for (let i = 0; i < 50; i++) {
    starField.push({
      x: Math.random(),
      y: Math.random() * 0.7,
      s: 0.5 + Math.random() * 2,
      sp: 0.0002 + Math.random() * 0.0005,
    });
  }
}

export function resetGround() { groundX = 0; }

export function scrollGround(speed) { groundX += speed; }

export function draw(difficulty) {
  const ctx = getCtx();
  const theme = Pipes.getTheme(difficulty);
  const now = performance.now();

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H());
  grad.addColorStop(0, theme.sky1);
  grad.addColorStop(0.5, theme.sky2);
  grad.addColorStop(1, theme.sky3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W(), H());

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (const s of starField) {
    s.x = (s.x + s.sp) % 1;
    ctx.globalAlpha = 0.3 + Math.sin(now * 0.002 + s.s * 10) * 0.2;
    ctx.beginPath();
    ctx.arc(s.x * W(), s.y * H(), s.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Mountains
  ctx.fillStyle = theme.mount;
  ctx.beginPath();
  ctx.moveTo(0, H() - 60);
  for (let x = 0; x <= W(); x += 40) {
    ctx.lineTo(x, H() - 60 - Math.sin(x * 0.015 + difficulty * 0.1) * 30 - 20);
  }
  ctx.lineTo(W(), H() - 30);
  ctx.lineTo(0, H() - 30);
  ctx.fill();
}

export function drawGround() {
  const ctx = getCtx();
  const groundH = 30;

  const grad = ctx.createLinearGradient(0, H() - groundH, 0, H());
  grad.addColorStop(0, '#5a3e28');
  grad.addColorStop(1, '#3d2817');
  ctx.fillStyle = grad;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, H() - groundH, W(), groundH);
  ctx.clip();
  ctx.fillRect(0, H() - groundH, W() * 2, groundH);

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = -1; i < 20; i++) {
    const gx = i * 30 - groundX % 30;
    ctx.fillRect(gx, H() - groundH, 15, groundH);
  }
  ctx.restore();

  // Grass line
  ctx.fillStyle = '#2ecc71';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, H() - groundH, W(), 4);
  ctx.globalAlpha = 1;
}
