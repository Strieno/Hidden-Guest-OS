// Lightweight WebAudio sound effects — no audio files required.
// Respects browser autoplay policies by lazily creating the context on first user gesture.

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08): void {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  ring(): void {
    if (!enabled) return;
    tone(880, 0, 0.18, 'sine', 0.06);
    tone(880, 0.3, 0.18, 'sine', 0.06);
  },
  correct(): void {
    if (!enabled) return;
    tone(660, 0, 0.12, 'sine', 0.07);
    tone(880, 0.1, 0.16, 'sine', 0.07);
  },
  incorrect(): void {
    if (!enabled) return;
    tone(330, 0, 0.14, 'triangle', 0.07);
    tone(262, 0.12, 0.2, 'triangle', 0.07);
  },
  critical(): void {
    if (!enabled) return;
    tone(220, 0, 0.2, 'sawtooth', 0.06);
    tone(185, 0.18, 0.28, 'sawtooth', 0.06);
  },
  achievement(): void {
    if (!enabled) return;
    tone(523, 0, 0.12, 'sine', 0.07);
    tone(659, 0.1, 0.12, 'sine', 0.07);
    tone(784, 0.2, 0.12, 'sine', 0.07);
    tone(1047, 0.3, 0.25, 'sine', 0.08);
  },
  complete(): void {
    if (!enabled) return;
    tone(523, 0, 0.1, 'sine', 0.07);
    tone(659, 0.12, 0.1, 'sine', 0.07);
    tone(784, 0.24, 0.2, 'sine', 0.08);
  },
  click(): void {
    if (!enabled) return;
    tone(440, 0, 0.05, 'sine', 0.03);
  },
};

// Call once on first user interaction to unlock audio
export function unlockAudio(): void {
  ensureCtx();
}
