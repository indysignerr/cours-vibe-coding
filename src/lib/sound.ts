import { soundStore } from "@/lib/stage";

/**
 * Le son d'allumage, synthétisé.
 *
 * Aucun fichier audio : trois oscillateurs et un souffle de bruit
 * fabriqués à la demande par l'API Web Audio. Rien à télécharger, rien
 * qui pèse sur la page tant que le son est coupé — et il l'est par
 * défaut. Le navigateur n'autorise le son qu'après un geste de
 * l'utilisateur : le contexte est créé au premier clic sur le bouton.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Un souffle de bruit blanc, pour l'étincelle. */
function noise(ac: AudioContext, seconds: number) {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  return src;
}

/** L'allumage : un déclic, un tintement de filament, un bourdon qui monte puis s'efface. */
export function playIgnite() {
  if (!soundStore.get()) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = 0.5;
  out.connect(ac.destination);

  // Le déclic.
  const click = noise(ac, 0.05);
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2600;
  const clickGain = ac.createGain();
  clickGain.gain.setValueAtTime(0.5, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  click.connect(band).connect(clickGain).connect(out);
  click.start(now);

  // Le filament qui tinte.
  const tink = ac.createOscillator();
  tink.type = "sine";
  tink.frequency.setValueAtTime(1900, now + 0.02);
  tink.frequency.exponentialRampToValueAtTime(1250, now + 0.2);
  const tinkGain = ac.createGain();
  tinkGain.gain.setValueAtTime(0.0001, now);
  tinkGain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
  tinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  tink.connect(tinkGain).connect(out);
  tink.start(now);
  tink.stop(now + 0.55);

  // Le bourdon.
  const hum = ac.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.value = 100;
  const hum2 = ac.createOscillator();
  hum2.type = "sine";
  hum2.frequency.value = 200;
  const low = ac.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 320;
  const humGain = ac.createGain();
  humGain.gain.setValueAtTime(0.0001, now);
  humGain.gain.exponentialRampToValueAtTime(0.07, now + 0.35);
  humGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
  hum.connect(low);
  hum2.connect(low);
  low.connect(humGain).connect(out);
  hum.start(now);
  hum2.start(now);
  hum.stop(now + 1.7);
  hum2.stop(now + 1.7);
}

/** L'extinction : un bruit sourd, court. */
export function playOff() {
  if (!soundStore.get()) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(170, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}
