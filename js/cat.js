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

export function draw(invincibleTimer = 0, activeShield = 0) {
  const ctx = getCtx();
  const skin = Skins.getSelected();
  const now = performance.now();
  const tiny = false; // handled by powerups externally
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

  // Body
  ctx.fillStyle = getColor(skin.bodyColor);
  ctx.beginPath();
  ctx.ellipse(0, 0, sz * 0.55, sz * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings (when going up)
  if (cat.vy < -1) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const wingFlap = Math.sin(now * 0.02) * 8;
    ctx.beginPath();
    ctx.ellipse(-2, -sz * 0.3 - wingFlap, sz * 0.35, sz * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = getColor(skin.headColor);
  ctx.beginPath();
  ctx.arc(sz * 0.25, -sz * 0.18, sz * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = getColor(skin.earColor);
  [[0.08, -0.42, 0.03, -0.7, 0.25, -0.46], [0.32, -0.42, 0.42, -0.7, 0.48, -0.42]].forEach(e => {
    ctx.beginPath();
    ctx.moveTo(sz * e[0], sz * e[1]);
    ctx.lineTo(sz * e[2], sz * e[3]);
    ctx.lineTo(sz * e[4], sz * e[5]);
    ctx.fill();
  });

  // Inner ears
  ctx.fillStyle = getColor(skin.innerEar);
  [[0.1, -0.44, 0.08, -0.62, 0.23, -0.47], [0.34, -0.44, 0.41, -0.62, 0.46, -0.44]].forEach(e => {
    ctx.beginPath();
    ctx.moveTo(sz * e[0], sz * e[1]);
    ctx.lineTo(sz * e[2], sz * e[3]);
    ctx.lineTo(sz * e[4], sz * e[5]);
    ctx.fill();
  });

  // Eyes
  const blink = Math.sin(now * 0.005) > 0.95 ? 0.1 : 1;
  ctx.fillStyle = skin.eyeColor;
  [0.17, 0.35].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(sz * ex, -sz * 0.22, 3, 4 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Eye shine
  if (skin.id !== 'ghost') {
    ctx.fillStyle = 'white';
    [0.19, 0.37].forEach(ex => {
      ctx.beginPath();
      ctx.arc(sz * ex, -sz * 0.25, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Nose
  ctx.fillStyle = getColor(skin.noseColor);
  ctx.beginPath();
  ctx.arc(sz * 0.26, -sz * 0.1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = getColor(skin.noseColor);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(sz * 0.22, -sz * 0.05, 3, 0, Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sz * 0.3, -sz * 0.05, 3, Math.PI * 0.3, Math.PI);
  ctx.stroke();

  // Tail
  ctx.strokeStyle = getColor(skin.bodyColor);
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  const tw = Math.sin(now * 0.008) * 0.3;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.45, 0);
  ctx.quadraticCurveTo(-sz * 0.7, -sz * 0.25 + tw * 15, -sz * 0.6, -sz * 0.5 + tw * 10);
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;
}

// Draw preview of a specific skin (for skin selection screen)
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

  // Body
  ctx.fillStyle = getColor(skin.bodyColor);
  ctx.beginPath();
  ctx.ellipse(0, 0, sz * 0.55, sz * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = getColor(skin.headColor);
  ctx.beginPath();
  ctx.arc(sz * 0.25, -sz * 0.18, sz * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = getColor(skin.earColor);
  [[0.08, -0.42, 0.03, -0.7, 0.25, -0.46], [0.32, -0.42, 0.42, -0.7, 0.48, -0.42]].forEach(e => {
    ctx.beginPath();
    ctx.moveTo(sz * e[0], sz * e[1]);
    ctx.lineTo(sz * e[2], sz * e[3]);
    ctx.lineTo(sz * e[4], sz * e[5]);
    ctx.fill();
  });

  // Inner ears
  ctx.fillStyle = getColor(skin.innerEar);
  [[0.1, -0.44, 0.08, -0.62, 0.23, -0.47], [0.34, -0.44, 0.41, -0.62, 0.46, -0.44]].forEach(e => {
    ctx.beginPath();
    ctx.moveTo(sz * e[0], sz * e[1]);
    ctx.lineTo(sz * e[2], sz * e[3]);
    ctx.lineTo(sz * e[4], sz * e[5]);
    ctx.fill();
  });

  // Eyes
  ctx.fillStyle = skin.eyeColor;
  [0.17, 0.35].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(sz * ex, -sz * 0.22, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  if (skin.id !== 'ghost') {
    ctx.fillStyle = 'white';
    [0.19, 0.37].forEach(ex => {
      ctx.beginPath();
      ctx.arc(sz * ex, -sz * 0.25, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Nose
  ctx.fillStyle = getColor(skin.noseColor);
  ctx.beginPath();
  ctx.arc(sz * 0.26, -sz * 0.1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = getColor(skin.bodyColor);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-sz * 0.45, 0);
  ctx.quadraticCurveTo(-sz * 0.7, -sz * 0.3, -sz * 0.6, -sz * 0.55);
  ctx.stroke();

  ctx.restore();
}
