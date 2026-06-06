// ==================== AUDIO SYSTEM ====================
let audioCtx = null;
let masterGain = null;
let sfxEnabled = true;
let musicEnabled = true;
let volume = 0.7;

export function init() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioCtx();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.value = volume;
}

export function ensureCtx() {
  if (!audioCtx) init();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function setSfx(v) { sfxEnabled = v; }
export function setMusic(v) { musicEnabled = v; }
export function setVolume(v) {
  volume = v;
  if (masterGain) masterGain.gain.value = v;
}
export function getSfx() { return sfxEnabled; }
export function getMusic() { return musicEnabled; }
export function getVolume() { return volume; }

export function play(type) {
  if (!sfxEnabled) return;
  ensureCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  const t = audioCtx.currentTime;

  switch (type) {
    case 'flap':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
      break;

    case 'score':
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.setValueAtTime(800, t + 0.08);
      osc.frequency.setValueAtTime(1000, t + 0.16);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
      break;

    case 'combo':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
      break;

    case 'powerup':
      osc.type = 'sine';
      [523, 659, 784, 1047].forEach((f, i) => {
        osc.frequency.setValueAtTime(f, t + i * 0.08);
      });
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t); osc.stop(t + 0.4);
      break;

    case 'hit':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
      break;

    case 'die':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
      break;
  }
}

// Simple background music using oscillators
let musicOsc = null;
let musicGain = null;
let musicInterval = null;

const MELODY = [
  392, 440, 494, 523, 494, 440, 392, 330,
  349, 392, 440, 494, 440, 392, 349, 330,
  294, 330, 349, 392, 440, 494, 523, 587,
  523, 494, 440, 392, 349, 330, 294, 262,
];

export function startMusic() {
  if (!musicEnabled || musicOsc) return;
  ensureCtx();

  musicGain = audioCtx.createGain();
  musicGain.connect(masterGain);
  musicGain.gain.value = 0.06;

  let noteIdx = 0;
  function playNote() {
    if (!musicOsc) return;
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    osc.connect(noteGain);
    noteGain.connect(musicGain);
    osc.type = 'sine';
    const freq = MELODY[noteIdx % MELODY.length];
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    noteGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.25);
    noteIdx++;
  }

  musicOsc = true; // flag
  playNote();
  musicInterval = setInterval(playNote, 250);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicOsc = null;
}
