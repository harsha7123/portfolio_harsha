/**
 * Synthesized audio engine — no external files needed.
 * - Ambient bed: layered low-frequency drone + filtered white noise wind
 * - Ignition SFX: short downward sweep + noise burst (engine start)
 * - Drive-on SFX: short upward chime
 * All gesture-gated; user must opt-in via SoundToggle.
 */
let ctx = null;
let masterGain = null;
let ambientNodes = null;
let userEnabled = false;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function fade(param, target, time = 0.6) {
  if (!ctx) return;
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(target, now + time);
}

export function enableSound() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  userEnabled = true;
  fade(masterGain.gain, 0.32, 0.9);
  startAmbient();
}

export function disableSound() {
  userEnabled = false;
  if (!ctx) return;
  fade(masterGain.gain, 0.0, 0.5);
  setTimeout(() => stopAmbient(), 600);
}

function startAmbient() {
  if (!ctx || ambientNodes) return;

  // Low drone — two slightly detuned sine oscillators
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = "sine";
  o2.type = "sine";
  o1.frequency.value = 55;
  o2.frequency.value = 55 * 1.005;

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.32;

  // Slow LFO modulating drone gain
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain).connect(droneGain.gain);

  o1.connect(droneGain);
  o2.connect(droneGain);

  // Wind — filtered noise
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 320;
  noiseFilter.Q.value = 0.7;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.05;

  noise.connect(noiseFilter).connect(noiseGain);

  droneGain.connect(masterGain);
  noiseGain.connect(masterGain);

  o1.start();
  o2.start();
  lfo.start();
  noise.start();

  ambientNodes = { o1, o2, lfo, noise, droneGain, noiseGain };
}

function stopAmbient() {
  if (!ambientNodes) return;
  try {
    ambientNodes.o1.stop();
    ambientNodes.o2.stop();
    ambientNodes.lfo.stop();
    ambientNodes.noise.stop();
  } catch {
    /* noop */
  }
  ambientNodes = null;
}

/* ---- one-shot SFX ---- */
function playSweep({ from, to, dur = 0.7, gain = 0.18, type = "sawtooth" }) {
  if (!ctx || !userEnabled) return;
  const o = ctx.createOscillator();
  o.type = type;
  const g = ctx.createGain();
  g.gain.value = 0;

  const now = ctx.currentTime;
  o.frequency.setValueAtTime(from, now);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + dur);

  g.gain.linearRampToValueAtTime(gain, now + 0.02);
  g.gain.linearRampToValueAtTime(0, now + dur);

  o.connect(g).connect(masterGain);
  o.start(now);
  o.stop(now + dur + 0.05);
}

function playNoiseBurst({ dur = 0.35, gain = 0.22, lp = 1200 }) {
  if (!ctx || !userEnabled) return;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lp;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(masterGain);
  src.start();
}

export function sfxIgnition() {
  // engine start: noise burst + low rumble sweep
  playNoiseBurst({ dur: 0.45, gain: 0.25, lp: 900 });
  playSweep({ from: 120, to: 55, dur: 0.6, gain: 0.18, type: "sawtooth" });
  setTimeout(() => playSweep({ from: 80, to: 50, dur: 0.5, gain: 0.12, type: "square" }), 280);
}

export function sfxWhoosh() {
  playNoiseBurst({ dur: 0.25, gain: 0.15, lp: 1800 });
  playSweep({ from: 220, to: 880, dur: 0.25, gain: 0.05, type: "triangle" });
}

export function sfxClick() {
  playSweep({ from: 1400, to: 600, dur: 0.08, gain: 0.07, type: "square" });
}

export function isAudioAvailable() {
  return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
}
