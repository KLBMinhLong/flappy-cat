// ==================== CAT ====================
import { getCtx, W, H, clamp } from './utils.js';
import * as Skins from './skins.js';

export const SIZE = 28;
export const GRAVITY = 0.42;
export const JUMP = -7.2;

let cat = {};

export function reset() {
  cat = {
    x: 80,
    y: H() / 2,
    vy: 0,
    rotation: 0,
    flapAnim: 0,
  };
}

export function get() { return cat; }

export function jump() {
  cat.vy = JUMP;
  cat.flapAnim = 1;
}

export function update() {
  cat.vy += GRAVITY;
  cat.y += cat.vy;
  cat.rotation = clamp(cat.vy * 0.04, -0.5, 1.2);
  if (cat.flapAnim > 0) cat.flapAnim -= 0.1;
}

// ==================== DRAW HELPERS ====================
function drawCatShape(ctx, sz, skin, getColor, now) {
  const hx = sz * 0.15;   // head center X
  const hy = -sz * 0.25;  // head center Y
  const hr = sz * 0.35;   // head radius

  // === TAIL ===
  ctx.strokeStyle = getColor(skin.bodyColor);
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  const tw = Math.sin(now * 0.008) * 0.3;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.45, 0);
  ctx.quadraticCurveTo(-sz * 0.7, -sz * 0.25 + tw * 15, -sz * 0.6, -sz * 0.5 + tw * 10);
  ctx.stroke();

  // === BODY ===
  ctx.fillStyle = getColor(skin.bodyColor);
  ctx.beginPath();
  ctx.ellipse(0, 0, sz * 0.55, sz * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // === PAWS (small bumps at bottom) ===
  ctx.fillStyle = getColor(skin.bodyColor);
  [-0.2, 0.15].forEach(px => {
    ctx.beginPath();
    ctx.ellipse(sz * px, sz * 0.4, sz * 0.12, sz * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // === LEFT EAR (outer) ===
  ctx.fillStyle = getColor(skin.earColor);
  ctx.beginPath();
  ctx.moveTo(hx - hr * 0.75, hy - hr * 0.1);
  ctx.lineTo(hx - hr * 0.35, hy - hr * 1.15);
  ctx.lineTo(hx + hr * 0.15, hy - hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // === RIGHT EAR (outer) ===
  ctx.beginPath();
  ctx.moveTo(hx + hr * 0.75, hy - hr * 0.1);
  ctx.lineTo(hx + hr * 0.35, hy - hr * 1.15);
  ctx.lineTo(hx - hr * 0.15, hy - hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // === LEFT EAR (inner) ===
  ctx.fillStyle = getColor(skin.innerEar);
  ctx.beginPath();
  ctx.moveTo(hx - hr * 0.55, hy - hr * 0.15);
  ctx.lineTo(hx - hr * 0.28, hy - hr * 0.9);
  ctx.lineTo(hx + hr * 0.08, hy - hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // === RIGHT EAR (inner) ===
  ctx.beginPath();
  ctx.moveTo(hx + hr * 0.55, hy - hr * 0.15);
  ctx.lineTo(hx + hr * 0.28, hy - hr * 0.9);
  ctx.lineTo(hx - hr * 0.08, hy - hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // === HEAD ===
  ctx.fillStyle = getColor(skin.headColor);
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();

  // === CHEEKS (fluffy) ===
  ctx.fillStyle = getColor(skin.headColor);
  ctx.beginPath();
  ctx.ellipse(hx - hr * 0.65, hy + hr * 0.35, hr * 0.35, hr * 0.28, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + hr * 0.65, hy + hr * 0.35, hr * 0.35, hr * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // === EYES ===
  const blink = Math.sin(now * 0.005) > 0.95 ? 0.15 : 1;
  const eyeR = hr * 0.28;
  const eyeY = hy - hr * 0.08;

  // Left eye
  ctx.fillStyle = skin.eyeColor;
  ctx.beginPath();
  ctx.ellipse(hx - hr * 0.3, eyeY, eyeR, eyeR * blink, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.ellipse(hx + hr * 0.3, eyeY, eyeR, eyeR * blink, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine (big)
  if (skin.id !== 'ghost') {
    ctx.fillStyle = 'white';
    const shineR = eyeR * 0.45;
    ctx.beginPath();
    ctx.arc(hx - hr * 0.22, eyeY - eyeR * 0.25, shineR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + hr * 0.38, eyeY - eyeR * 0.25, shineR, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine (small)
    const shineR2 = eyeR * 0.2;
    ctx.beginPath();
    ctx.arc(hx - hr * 0.35, eyeY + eyeR * 0.15, shineR2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + hr * 0.33, eyeY + eyeR * 0.15, shineR2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === NOSE (inverted triangle) ===
  const noseY = hy + hr * 0.15;
  ctx.fillStyle = getColor(skin.noseColor);
  ctx.beginPath();
  ctx.moveTo(hx, noseY - hr * 0.08);
  ctx.lineTo(hx - hr * 0.1, noseY + hr * 0.06);
  ctx.lineTo(hx + hr * 0.1, noseY + hr * 0.06);
  ctx.closePath();
  ctx.fill();

  // === MOUTH (cat W-shape) ===
  ctx.strokeStyle = getColor(skin.noseColor);
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const mY = noseY + hr * 0.08;
  ctx.beginPath();
  ctx.moveTo(hx - hr * 0.2, mY + hr * 0.12);
  ctx.quadraticCurveTo(hx - hr * 0.1, mY, hx, mY + hr * 0.06);
  ctx.quadraticCurveTo(hx + hr * 0.1, mY, hx + hr * 0.2, mY + hr * 0.12);
  ctx.stroke();

  // === WHISKERS ===
  ctx.strokeStyle = getColor(skin.noseColor);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  const wY = noseY + hr * 0.05;
  // Left whiskers
  [[-0.9, -0.15], [-0.95, 0.05], [-0.85, 0.25]].forEach(([wx, wy]) => {
    ctx.beginPath();
    ctx.moveTo(hx - hr * 0.15, wY + hr * wy);
    ctx.lineTo(hx + hr * wx, wY + hr * wy - hr * 0.05);
    ctx.stroke();
  });
  // Right whiskers
  [[0.9, -0.15], [0.95, 0.05], [0.85, 0.25]].forEach(([wx, wy]) => {
    ctx.beginPath();
    ctx.moveTo(hx + hr * 0.15, wY + hr * wy);
    ctx.lineTo(hx + hr * wx, wY + hr * wy - hr * 0.05);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // === BLUSH ===
  ctx.fillStyle = 'rgba(255,150,180,0.25)';
  ctx.beginPath();
  ctx.ellipse(hx - hr * 0.55, hy + hr * 0.3, hr * 0.2, hr * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + hr * 0.55, hy + hr * 0.3, hr * 0.2, hr * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ==================== MAIN DRAW ====================
export function draw(invincibleTimer = 0, activeShield = 0) {
  const ctx = getCtx();
  const skin = Skins.getSelected();
  const now = performance.now();
  const sz = SIZE;

  ctx.save();
  ctx.translate(cat.x, cat.y);
  ctx.rotate(cat.rotation);

  // Invincibility flash
  if (invincibleTimer > 0 && Math.floor(invincibleTimer / 80) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Shield glow
  if (activeShield > 0 || invincibleTimer > 0) {
    ctx.strokeStyle = 'rgba(100,200,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, sz + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(100,200,255,0.1)';
    ctx.fill();
  }

  // Rainbow helper
  const getColor = (base) => {
    if (base === 'rainbow') {
      const hue = (now * 0.1) % 360;
      return `hsl(${hue}, 80%, 65%)`;
    }
    return base;
  };

  // Wings (when going up)
  if (cat.vy < -1) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const wingFlap = Math.sin(now * 0.02) * 8;
    ctx.beginPath();
    ctx.ellipse(-2, -sz * 0.3 - wingFlap, sz * 0.35, sz * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCatShape(ctx, sz, skin, getColor, now);

  ctx.restore();
  ctx.globalAlpha = 1;
}

// ==================== SKIN PREVIEW DRAW ====================
export function drawPreview(ctx, skin, cx, cy, size) {
  const now = performance.now();
  const sz = size;

  const getColor = (base) => {
    if (base === 'rainbow') {
      const hue = (now * 0.1) % 360;
      return `hsl(${hue}, 80%, 65%)`;
    }
    return base;
  };

  ctx.save();
  ctx.translate(cx, cy);
  drawCatShape(ctx, sz, skin, getColor, now);
  ctx.restore();
}
