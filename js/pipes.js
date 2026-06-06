// ==================== PIPES ====================
import { getCtx, W, H } from './utils.js';

export const WIDTH = 56;

let pipes = [];

export function reset() { pipes = []; }

export function getAll() { return pipes; }

export function spawn(topH) {
  pipes.push({ x: W(), topH, scored: false });
}

export function update(speed, gap) {
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= speed;
    if (pipes[i].x + WIDTH < -10) pipes.splice(i, 1);
  }
}

export function checkScoring(catX, gap) {
  let scored = false;
  for (const p of pipes) {
    if (!p.scored && p.x + WIDTH < catX) {
      p.scored = true;
      scored = true;
    }
  }
  return scored;
}

export function draw(difficulty) {
  const ctx = getCtx();
  const theme = getTheme(difficulty);
  const gap = getGap(difficulty);

  for (const p of pipes) {
    const capH = 18, capExtra = 7;

    const grad = ctx.createLinearGradient(p.x, 0, p.x + WIDTH, 0);
    grad.addColorStop(0, theme.pipe);
    grad.addColorStop(0.5, theme.pipeDark);
    grad.addColorStop(1, theme.pipe);

    // Top pipe
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, 0, WIDTH, p.topH);
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(p.x - capExtra, p.topH - capH, WIDTH + capExtra * 2, capH);

    // Bottom pipe
    const bottomY = p.topH + gap;
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, bottomY, WIDTH, H() - bottomY);
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(p.x - capExtra, bottomY, WIDTH + capExtra * 2, capH);

    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(p.x + 7, 0, 5, p.topH - capH);
    ctx.fillRect(p.x + 7, bottomY + capH, 5, H() - bottomY - capH);

    // Vine
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    const vineX = p.x + WIDTH - 5;
    ctx.beginPath();
    ctx.moveTo(vineX, p.topH);
    for (let vy = p.topH; vy < p.topH + 30; vy += 5) {
      ctx.lineTo(vineX + Math.sin(vy * 0.2) * 4, vy);
    }
    ctx.stroke();
  }
}

export function getGap(difficulty) {
  return Math.max(100, 155 - difficulty * 3);
}

export function getSpeed(difficulty) {
  return 2.5 + difficulty * 0.15;
}

export function getInterval(difficulty) {
  return Math.max(1000, 1600 - difficulty * 40);
}

export function getTheme(difficulty) {
  if (difficulty < 5) return { sky1: '#667eea', sky2: '#764ba2', sky3: '#f093fb', pipe: '#2ecc71', pipeDark: '#27ae60', mount: 'rgba(100,60,150,0.3)' };
  if (difficulty < 10) return { sky1: '#ee6676', sky2: '#d63384', sky3: '#6f42c1', pipe: '#e74c3c', pipeDark: '#c0392b', mount: 'rgba(150,60,60,0.3)' };
  if (difficulty < 15) return { sky1: '#0f2027', sky2: '#203a43', sky3: '#2c5364', pipe: '#f39c12', pipeDark: '#d68910', mount: 'rgba(30,60,80,0.4)' };
  return { sky1: '#0f0c29', sky2: '#302b63', sky3: '#24243e', pipe: '#e91e63', pipeDark: '#c2185b', mount: 'rgba(20,20,60,0.5)' };
}
