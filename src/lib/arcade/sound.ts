// Synthesized sound effects for the arcade games: oscillators and a noise
// buffer, no audio files. The AudioContext is created only inside a user
// gesture (`unlockAudio()` from a pointerdown/keydown handler), so browsers
// never block it and nothing plays before the player interacts. The on/off
// preference is an external store persisted in localStorage.

export type SfxName =
  | "rotate"
  | "connect"
  | "win"
  | "select"
  | "swap"
  | "invalid"
  | "pop"
  | "special"
  | "shuffle"
  | "paddle"
  | "wall"
  | "brick"
  | "crack"
  | "powerup"
  | "lifeLost"
  | "gameOver"
  | "launch";

const PREF_KEY = "vm-arcade-sound-v1";
const MAX_VOICES = 14;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let voices = 0;

// --- preference store ---------------------------------------------------------

let enabledCache: boolean | null = null;
const listeners = new Set<() => void>();

function readPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Another tab changed the preference: one shared listener notifies everyone. */
function onPrefStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== PREF_KEY) return;
  const next = readPref();
  if (next === enabledCache) return;
  enabledCache = next;
  listeners.forEach((l) => l());
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onPrefStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onPrefStorage);
  };
}

export function getSoundSnapshot(): boolean {
  if (enabledCache === null) enabledCache = readPref();
  return enabledCache;
}

export const getServerSoundSnapshot = () => true;

export function setSoundEnabled(enabled: boolean): void {
  enabledCache = enabled;
  try {
    window.localStorage.setItem(PREF_KEY, enabled ? "on" : "off");
  } catch {
    // blocked storage: the preference still applies for this page view
  }
  if (enabled) unlockAudio();
  listeners.forEach((l) => l());
}

// --- audio graph --------------------------------------------------------------

/** Create or resume the AudioContext. Call from a user-gesture handler. */
export function unlockAudio(): void {
  if (typeof window === "undefined" || !getSoundSnapshot()) return;
  try {
    if (!ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 0.4);
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null; // no audio on this device; games stay silent
  }
}

function ready(): AudioContext | null {
  if (!ctx || !master || ctx.state !== "running" || !getSoundSnapshot()) return null;
  if (voices >= MAX_VOICES) return null;
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  {
    type = "sine",
    dur = 0.12,
    gain = 0.2,
    slide,
    delay = 0,
    attack = 0.006,
  }: { type?: OscillatorType; dur?: number; gain?: number; slide?: number; delay?: number; attack?: number } = {},
) {
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master!);
  voices++;
  osc.onended = () => {
    voices--;
    osc.disconnect();
    g.disconnect();
  };
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function burst(ac: AudioContext, { dur = 0.12, gain = 0.25, freq = 1800, q = 0.8, delay = 0 } = {}) {
  if (!noise) return;
  const t0 = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master!);
  voices++;
  src.onended = () => {
    voices--;
    src.disconnect();
    filter.disconnect();
    g.disconnect();
  };
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const semis = (base: number, n: number) => base * Math.pow(2, n / 12);

/**
 * Play one effect. `level` raises the pitch for combos and chains (0 = base).
 * Silently does nothing while muted, before the first gesture, or when too
 * many voices are already playing.
 */
export function playSfx(name: SfxName, level = 0): void {
  const ac = ready();
  if (!ac) return;
  const step = Math.min(level, 12);
  switch (name) {
    case "rotate":
      tone(ac, 520, { type: "triangle", dur: 0.07, gain: 0.12, slide: 700 });
      break;
    case "connect":
      tone(ac, semis(880, step), { dur: 0.16, gain: 0.12, slide: semis(1320, step) });
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        tone(ac, f, { type: "triangle", dur: 0.28, gain: 0.14, delay: i * 0.085 }),
      );
      break;
    case "select":
      tone(ac, 660, { type: "triangle", dur: 0.05, gain: 0.08 });
      break;
    case "swap":
      tone(ac, 340, { dur: 0.1, gain: 0.12, slide: 560 });
      break;
    case "invalid":
      tone(ac, 190, { type: "square", dur: 0.14, gain: 0.05, slide: 140 });
      break;
    case "pop":
      tone(ac, semis(620, step * 2), { type: "triangle", dur: 0.11, gain: 0.13, slide: semis(900, step * 2) });
      break;
    case "special":
      burst(ac, { dur: 0.3, gain: 0.22, freq: 900, q: 0.5 });
      tone(ac, 220, { type: "sawtooth", dur: 0.32, gain: 0.06, slide: 1400 });
      break;
    case "shuffle":
      [0, 1, 2, 3].forEach((i) => tone(ac, semis(400, i * 3), { dur: 0.08, gain: 0.08, delay: i * 0.05 }));
      break;
    case "paddle":
      tone(ac, 420, { type: "triangle", dur: 0.07, gain: 0.14, slide: 520 });
      break;
    case "wall":
      tone(ac, 300, { type: "triangle", dur: 0.04, gain: 0.06 });
      break;
    case "brick":
      tone(ac, semis(700, step), { type: "triangle", dur: 0.06, gain: 0.1 });
      burst(ac, { dur: 0.1, gain: 0.12, freq: semis(2400, step) });
      break;
    case "crack":
      tone(ac, 260, { type: "square", dur: 0.05, gain: 0.05 });
      break;
    case "powerup":
      tone(ac, 400, { dur: 0.22, gain: 0.12, slide: 1600 });
      tone(ac, 600, { type: "triangle", dur: 0.22, gain: 0.06, slide: 2400, delay: 0.04 });
      break;
    case "lifeLost":
      tone(ac, 320, { type: "sawtooth", dur: 0.45, gain: 0.07, slide: 70 });
      break;
    case "gameOver":
      [392, 330, 262, 196].forEach((f, i) =>
        tone(ac, f, { type: "triangle", dur: 0.3, gain: 0.12, delay: i * 0.14 }),
      );
      break;
    case "launch":
      tone(ac, 330, { dur: 0.09, gain: 0.12, slide: 660 });
      break;
  }
}
