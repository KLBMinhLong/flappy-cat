// ==================== UTILITY ====================
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function rand(min, max) { return min + Math.random() * (max - min); }
export function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
export function dist(x1, y1, x2, y2) {
  const dx = x1 - x2, dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

// Canvas reference (set once in main)
let _canvas, _ctx;
export function setCanvas(canvas) {
  _canvas = canvas;
  _ctx = canvas.getContext('2d');
}
export function getCanvas() { return _canvas; }
export function getCtx() { return _ctx; }
export function W() { return _canvas.width; }
export function H() { return _canvas.height; }

// Time
let _dt = 16.67;
export function setDt(dt) { _dt = dt; }
export function dt() { return _dt; }
