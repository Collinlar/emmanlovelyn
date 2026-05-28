import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import florals from "@/assets/florals.png";
import couple from "@/assets/couple.jpg";
import waxSeal from "@/assets/wax-seal.png";
import { useRevealOnScroll, type RevealVariant } from "@/hooks/use-reveal-on-scroll";

/** Uplifting wedding-style loop — I-V-vi-IV in C with bells, arpeggios, and a gentle waltz pulse. */
function createCelebrationPlayer() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let chordTimer: number | null = null;
  let pulseTimer: number | null = null;
  let stopped = false;
  let chordIndex = 0;

  // C → G → Am → F — classic celebratory wedding progression
  const chords: number[][] = [
    [261.63, 329.63, 392.0, 523.25],
    [196.0, 246.94, 293.66, 392.0],
    [220.0, 261.63, 329.63, 440.0],
    [174.61, 261.63, 349.23, 440.0],
  ];

  function playTone(
    freq: number,
    when: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
    detune = 0,
  ) {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(volume, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    o.connect(g).connect(master);
    o.start(when);
    o.stop(when + duration + 0.05);
  }

  function playChord(freqs: number[], when: number, duration: number) {
    if (!ctx || !master) return;
    freqs.forEach((f, idx) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = idx === 0 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (idx - 1.5) * 5;
      const peak = idx === 0 ? 0.07 : 0.045;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(peak, when + 0.35);
      g.gain.setValueAtTime(peak * 0.85, when + duration * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      o.connect(g).connect(master!);
      o.start(when);
      o.stop(when + duration + 0.1);
    });
  }

  function playHarpArpeggio(freqs: number[], when: number) {
    freqs.forEach((f, i) => {
      playTone(f * 2, when + i * 0.14, 1.4, 0.028, "triangle", i * 2);
    });
    playTone(freqs[0] * 4, when + 0.55, 0.9, 0.012, "sine");
  }

  function playSparkle(when: number) {
    [783.99, 987.77, 1174.66].forEach((f, i) => {
      playTone(f, when + i * 0.08, 0.7, 0.018, "sine");
    });
  }

  function playWaltzPulse(root: number, when: number) {
    playTone(root / 2, when, 0.55, 0.055, "triangle");
    playTone(root / 2, when + 0.55, 0.45, 0.035, "triangle");
    playTone(root / 2, when + 1.05, 0.35, 0.025, "triangle");
  }

  function scheduleChord(i: number) {
    if (stopped || !ctx) return;
    const freqs = chords[i % chords.length];
    const when = ctx.currentTime + 0.05;
    const duration = 3.1;

    playChord(freqs, when, duration);
    playHarpArpeggio(freqs, when + 0.2);
    playSparkle(when + 1.1);
    playWaltzPulse(freqs[0], when + 0.08);

    chordIndex = i + 1;
    chordTimer = window.setTimeout(() => scheduleChord(chordIndex), duration * 1000 - 250);
  }

  function schedulePulse() {
    if (stopped || !ctx) return;
    const freqs = chords[chordIndex % chords.length];
    playTone(freqs[0] * 1.5, ctx.currentTime, 0.35, 0.014, "sine");
    pulseTimer = window.setTimeout(schedulePulse, 780);
  }

  return {
    start() {
      if (ctx) return;
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      master.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 1.8);
      stopped = false;
      scheduleChord(0);
      pulseTimer = window.setTimeout(schedulePulse, 400);
    },
    setMuted(muted: boolean) {
      if (!ctx || !master) return;
      const target = muted ? 0.0001 : 0.38;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(target, ctx.currentTime + 0.5);
    },
    stop() {
      stopped = true;
      if (chordTimer) clearTimeout(chordTimer);
      if (pulseTimer) clearTimeout(pulseTimer);
      if (ctx) {
        const c = ctx;
        setTimeout(() => c.close(), 500);
      }
      ctx = null;
      master = null;
    },
  };
}

const EVENT_DATE = new Date("2026-08-29T10:00:00+02:00");
const VENUE_NAME = "VIU lounge";
const VENUE_ADDRESS = "Karlsplatz 1";
const VENUE_CITY = "73614 Schorndorf";
const VENUE_COUNTRY = "Germany";
const MAP_DESTINATION = `${VENUE_NAME}, ${VENUE_ADDRESS}, ${VENUE_CITY}, ${VENUE_COUNTRY}`;

function useCountdown(active: boolean) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (now === null) return null;
  const diff = Math.max(0, EVENT_DATE.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Synthesizes a soft chime + ambient pad via Web Audio. No external files. */
function playOpenSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();

    // Soft "seal break" — quick warm thump
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(180, ctx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    thumpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start();
    thump.stop(ctx.currentTime + 0.5);

    // Shimmering chime — C major triad bells
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      const start = ctx.currentTime + 0.15 + i * 0.12;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 2.5);
      o.connect(g).connect(ctx.destination);
      o.start(start);
      o.stop(start + 2.6);
    });

    // Warm pad underneath
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = "sine";
    pad.frequency.value = 261.63;
    padGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    padGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.6);
    padGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);
    pad.connect(padGain).connect(ctx.destination);
    pad.start();
    pad.stop(ctx.currentTime + 4.1);

    setTimeout(() => ctx.close(), 5000);
  } catch {
    /* no-op */
  }
}

function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    playOpenSound();
    
    // Smooth transition timeline:
    // 1. Click seal -> play sound, break seal (opacity 0), start folding top flap (duration 1.5s).
    // 2. At 500ms, start sliding the letter card up (duration 1.8s).
    // 3. At 2200ms, start fading out the entire envelope (duration 700ms).
    // 4. At 2800ms, call onOpen to transition fully to the scrollable page.
    setTimeout(() => {
      setIsOpened(true);
      onOpen();
    }, 2800);
  };

  const paperTextureStyle = {
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.7), rgba(246, 240, 228, 0.45)),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
    `
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-hidden bg-[oklch(0.965_0.012_75)] select-none transition-all duration-[700ms] cubic-bezier(0.4, 0, 0.2, 1) ${
        isOpened ? "opacity-0 pointer-events-none invisible" : "opacity-100"
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Envelope Back Panel / Lining */}
        <div 
          className="absolute inset-0 bg-[oklch(0.955_0.015_75)]" 
          style={paperTextureStyle}
        />

        {/* Letter Card (slides up out of the envelope) */}
        <div
          className="absolute rounded-sm transition-all duration-[1800ms] cubic-bezier(0.25, 1, 0.5, 1)"
          style={{
            width: "min(90vw, 520px)",
            height: "min(75vh, 650px)",
            top: "50%",
            left: "50%",
            transform: opening 
              ? "translate(-50%, -125vh) scale(0.95)" 
              : "translate(-50%, -46%) scale(0.95)",
            opacity: opening ? 0.3 : 1,
            zIndex: 10,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.9), rgba(252, 250, 244, 0.95)),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='cardNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cardNoise)' opacity='0.025'/%3E%3C/svg%3E")
            `,
            border: "1px solid oklch(0.85 0.022 70 / 0.5)",
            boxShadow: "0 15px 45px oklch(0.35 0.05 50 / 0.12), inset 0 0 30px oklch(0.72 0.06 65 / 0.05)",
            transitionDelay: opening ? "500ms" : "0ms"
          }}
        >
          {/* Card Frame Content */}
          <div className="flex h-full flex-col items-center justify-center p-6 text-center border-4 border-double border-accent/20 m-2.5 rounded-sm">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.55em] text-accent-foreground/80 mb-2">
              Save The Date
            </p>
            <div className="h-px w-16 bg-accent/20 my-2" />
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground/90">
              Traditional Engagement Ceremony
            </p>
            <h2 className="mt-5 font-script text-4xl leading-tight text-primary md:text-5xl">
              Emmanuel
            </h2>
            <p className="font-display text-lg italic text-accent-foreground/60 my-1">&amp;</p>
            <h2 className="font-script text-4xl leading-tight text-primary md:text-5xl">
              Lovelyne
            </h2>
            <div className="h-px w-16 bg-accent/20 my-4" />
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground mb-1">
              August 29, 2026
            </p>
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground/80 mb-1">
              10 am - 4 pm
            </p>
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground/80">
              {VENUE_NAME}, {VENUE_CITY}, {VENUE_COUNTRY}
            </p>
          </div>
        </div>

        {/* Diagonal Flaps Layer (Perspective container) */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ perspective: "2200px" }}>
          
          {/* Left Flap */}
          <div className="absolute inset-0" style={{ filter: "drop-shadow(4px 0 10px rgba(0, 0, 0, 0.05))" }}>
            <div 
              className="absolute left-0 top-0 bottom-0 transition-transform duration-1000"
              style={{
                width: "50.2%",
                height: "100.2%",
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                background: "oklch(0.96 0.012 75)",
                backgroundImage: `
                  linear-gradient(135deg, oklch(0.975 0.01 75) 40%, oklch(0.925 0.018 72) 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                `,
                boxShadow: "inset -15px 0 30px oklch(0.35 0.05 50 / 0.02)"
              }}
            />
          </div>

          {/* Right Flap */}
          <div className="absolute inset-0" style={{ filter: "drop-shadow(-4px 0 10px rgba(0, 0, 0, 0.05))" }}>
            <div 
              className="absolute right-0 top-0 bottom-0 transition-transform duration-1000"
              style={{
                width: "50.2%",
                height: "100.2%",
                clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
                background: "oklch(0.96 0.012 75)",
                backgroundImage: `
                  linear-gradient(225deg, oklch(0.975 0.01 75) 40%, oklch(0.925 0.018 72) 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                `,
                boxShadow: "inset 15px 0 30px oklch(0.35 0.05 50 / 0.02)"
              }}
            />
          </div>

          {/* Bottom Flap */}
          <div className="absolute inset-0" style={{ filter: "drop-shadow(0 -5px 12px rgba(0, 0, 0, 0.08))" }}>
            <div 
              className="absolute left-0 right-0 bottom-0 transition-transform duration-1000"
              style={{
                height: "50.2%",
                width: "100.2%",
                clipPath: "polygon(0 100%, 100% 100%, 50% 0)",
                background: "oklch(0.95 0.015 75)",
                backgroundImage: `
                  linear-gradient(to top, oklch(0.965 0.012 75) 50%, oklch(0.90 0.022 70) 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                `,
                boxShadow: "inset 0 15px 30px oklch(0.35 0.05 50 / 0.03)",
                zIndex: 11
              }}
            />
          </div>

          {/* Top Flap (opens) */}
          <div 
            className="absolute inset-0 transition-all duration-[1500ms] ease-in-out"
            style={{
              height: "50.2%",
              width: "100.2%",
              transform: opening ? "rotateX(-180deg)" : "rotateX(0deg)",
              transformStyle: "preserve-3d",
              transformOrigin: "top",
              filter: opening 
                ? "drop-shadow(0 -10px 15px rgba(0, 0, 0, 0.05))" 
                : "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12))",
              zIndex: opening ? 5 : 12,
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "oklch(0.97 0.01 75)",
                backgroundImage: `
                  linear-gradient(to bottom, oklch(0.975 0.01 75) 50%, oklch(0.91 0.02 70) 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                `,
                boxShadow: "inset 0 -15px 30px oklch(0.35 0.05 50 / 0.03)",
              }}
            />
          </div>
        </div>

        {/* Seal and Decorative Cupid Branding (Clickable layer) */}
        <div 
          className="absolute z-30 flex items-center justify-center pointer-events-auto transition-all duration-[800ms] ease-out"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: opening ? 0 : 1,
            pointerEvents: opening ? "none" : "auto",
          }}
        >
          {/* Main Wax Seal button */}
          <button
            onClick={handleOpen}
            aria-label="Open invitation"
            className="relative cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            style={{
              width: "min(28vw, 140px)",
              height: "min(28vw, 140px)",
              filter: "drop-shadow(0 8px 16px rgba(110, 80, 40, 0.4))",
            }}
          >
            <img
              src={waxSeal}
              alt="Golden wax seal with monogram"
              width={512}
              height={512}
              className="h-full w-full object-contain"
              draggable={false}
            />
          </button>

          {/* Cupid illustration next to the seal (Reference Site style) */}
          <div 
            className="absolute left-[calc(100%+12px)] flex flex-col items-center pointer-events-none opacity-85 select-none hidden sm:flex"
            style={{
              transform: "translateY(-15px)",
            }}
          >
            {/* Elegant classical cherub SVG */}
            <svg 
              width="90" 
              height="80" 
              viewBox="0 0 120 90" 
              fill="none" 
              className="text-[#6d1b22]"
              style={{ filter: "drop-shadow(1px 1px 0px rgba(255,255,255,0.85))" }}
            >
              {/* Cherub Head & Body details */}
              <path d="M 65 25 C 67 22, 70 20, 73 21 C 76 22, 77 25, 76 28 C 74 31, 71 33, 67 33 C 64 33, 63 30, 65 25 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              {/* Curly hair details */}
              <path d="M 68 20 C 67 18, 69 16, 71 17 C 73 18, 73 20, 71 21 M 73 21 C 75 19, 77 20, 77 22 C 77 24, 75 24, 73 24 M 76 25 C 79 25, 80 27, 79 29 C 78 31, 76 30, 75 28" stroke="currentColor" strokeWidth="1" />
              {/* Face profile */}
              <path d="M 65 27 C 64 27, 63 28, 63 29 C 63 30, 64 30, 64 31 M 61 30 C 60 31, 60 32, 61 33 M 62 33 L 64 33" stroke="currentColor" strokeWidth="1" />
              {/* Torso & arms */}
              <path d="M 67 33 C 64 36, 56 38, 48 40 C 44 41, 38 41, 35 43 C 33 44, 32 46, 34 47 C 36 48, 40 46, 44 45 M 54 37 C 55 42, 53 46, 50 49 C 48 51, 45 52, 42 53 M 43 45 L 30 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              {/* Little letter/envelope held by cherub */}
              <g transform="translate(12, 38) rotate(-12)">
                <rect x="0" y="0" width="22" height="15" rx="1" fill="#fafcf7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M 0 0 L 11 8 L 22 0 M 0 15 L 8 9 M 22 15 L 14 9" stroke="currentColor" strokeWidth="1.2" />
                {/* Tiny red heart on envelope */}
                <path d="M 11 5.5 C 11 5.5, 10.2 4.2, 9.2 4.7 C 8.2 5.2, 9.2 7.2, 11 8.7 C 12.8 7.2, 13.8 5.2, 12.8 4.7 C 11.8 4.2, 11 5.5, 11 5.5 Z" fill="#b91c1c" stroke="#b91c1c" strokeWidth="0.5" />
              </g>
              {/* Back legs */}
              <path d="M 68 33 C 74 35, 82 38, 88 35 C 93 32, 98 33, 101 37 C 98 39, 95 38, 92 41 C 88 44, 82 43, 76 40" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 70 38 C 76 42, 82 46, 88 44 C 91 43, 94 45, 96 49 C 93 50, 90 48, 88 51 C 84 54, 78 51, 74 46" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              {/* Wings */}
              <path d="M 52 35 C 50 25, 42 16, 32 18 C 26 19, 24 24, 28 29 C 33 34, 41 35, 48 35 M 48 35 C 44 28, 38 22, 31 23 C 28 24, 28 27, 31 30" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M 55 36 C 54 28, 48 20, 41 21 C 36 22, 35 25, 38 29 C 41 33, 46 34, 52 35" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span 
              className="mt-1 font-display text-[9px] tracking-[0.25em] text-[#6d1b22] uppercase font-semibold"
              style={{ textShadow: "1px 1px 0px rgba(255,255,255,0.75)" }}
            >
              The Digital Yes
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div 
          className="absolute bottom-10 left-0 right-0 z-30 text-center transition-opacity duration-500"
          style={{ opacity: opening ? 0 : 0.85 }}
        >
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.45em] text-[#6d1b22] font-semibold animate-pulse">
            Tap the seal to open
          </p>
        </div>
      </div>
    </div>
  );
}

function RevealSection({
  children,
  className = "",
  variant = "fade-up",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const { ref, visible } = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-section reveal-${variant} ${visible ? "is-visible" : ""} relative mx-auto w-full max-w-3xl px-6 py-20 sm:py-28 ${className}`}
    >
      <div className="reveal-content">{children}</div>
    </section>
  );
}

function Countdown({ active }: { active: boolean }) {
  const c = useCountdown(active);
  const items = [
    { label: "Days", value: c?.days ?? 0 },
    { label: "Hours", value: c?.hours ?? 0 },
    { label: "Minutes", value: c?.minutes ?? 0 },
    { label: "Seconds", value: c?.seconds ?? 0 },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6">
      {items.map((i) => (
        <div key={i.label} className="rounded-md border border-border bg-card/60 px-2 py-5 text-center backdrop-blur-sm">
          <div className="font-display text-3xl font-light text-primary sm:text-5xl tabular-nums">
            {c ? String(i.value).padStart(2, "0") : "--"}
          </div>
          <div className="mt-2 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
            {i.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Invitation() {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(false);
  const playerRef = useRef<ReturnType<typeof createCelebrationPlayer> | null>(null);

  useEffect(() => {
    if (!opened) return;
    playerRef.current = createCelebrationPlayer();
    playerRef.current.start();
    return () => {
      playerRef.current?.stop();
      playerRef.current = null;
    };
  }, [opened]);

  useEffect(() => {
    playerRef.current?.setMuted(muted);
  }, [muted]);

  return (
    <main className="min-h-screen">
      {!opened && <EnvelopeIntro onOpen={() => setOpened(true)} />}

      {opened && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute music" : "Mute music"}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/80 text-primary shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:scale-105 hover:bg-card"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}

      <div className={opened ? "animate-fade-up" : "opacity-0"}>
        {/* HERO */}
        <RevealSection variant="fade-up" className="flex min-h-screen flex-col items-center justify-center text-center">
          <div className="reveal-stagger flex w-full flex-col items-center">
          <img
            src={florals}
            alt=""
            loading="lazy"
            width={1024}
            height={1024}
            className="absolute left-1/2 top-6 w-72 -translate-x-1/2 opacity-80 sm:w-96"
          />

          <h1 className="relative z-10 mt-32 font-script text-6xl leading-none text-primary sm:text-8xl">Emmanuel</h1>
          <p className="relative z-10 my-3 font-display text-xl italic text-accent-foreground">&amp;</p>
          <h1 className="relative z-10 font-script text-6xl leading-none text-primary sm:text-8xl">Lovelyne</h1>

          <p className="relative z-10 mt-10 max-w-md font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            We cordially invite you to our
          </p>
          <p className="relative z-10 mt-3 font-sans text-sm uppercase tracking-[0.45em] text-foreground sm:text-base">
            Traditional Engagement Ceremony
          </p>

          <p className="relative z-10 mt-8 font-display text-2xl text-foreground sm:text-3xl">29 · 08 · 2026</p>
          <p className="relative z-10 mt-3 font-display text-lg text-muted-foreground sm:text-xl">10 am - 4 pm</p>
          </div>
        </RevealSection>

        {/* COUPLE IMAGE */}
        <RevealSection variant="scale-up" className="!max-w-5xl">
          <div className="reveal-stagger">
          <div className="overflow-hidden rounded-sm shadow-[var(--shadow-elegant)]">
            <img
              src={couple}
              alt="Emmanuel and Lovelyne"
              loading="lazy"
              width={1080}
              height={1920}
              className="h-[60vh] w-full object-cover sm:h-[80vh]"
            />
          </div>
          <p className="mt-8 text-center font-display text-xl italic text-muted-foreground sm:text-2xl">
            "...if we love one another, God lives in us and His love is made complete in us."
          </p>
          <p className="mt-3 text-center font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            1 John 4:12
          </p>
          </div>
        </RevealSection>

        {/* COUNTDOWN */}
        <RevealSection variant="blur-up">
          <div className="reveal-stagger flex flex-col items-center text-center">
            <div className="divider-ornament mb-6 flex w-full items-center gap-4">
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">
                Counting Down
              </span>
            </div>
            <h2 className="font-display text-3xl font-light text-primary sm:text-4xl">Until we celebrate together</h2>
            <div className="mt-10 w-full">
              <Countdown active={opened} />
            </div>
          </div>
        </RevealSection>

        {/* DETAILS */}
        <RevealSection variant="fade-left">
          <div className="reveal-stagger flex flex-col items-center text-center">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">The Celebration</p>
            <h2 className="mt-4 font-script text-5xl text-primary sm:text-6xl">When &amp; Where</h2>

            <div className="mt-12 grid w-full gap-10 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-card/50 p-8">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-accent-foreground">The Date</p>
                <p className="mt-4 font-display text-2xl text-primary">Saturday</p>
                <p className="mt-1 font-script text-4xl text-foreground">29 August</p>
                <p className="mt-1 font-display text-xl text-muted-foreground">Two Thousand Twenty Six</p>
                <p className="mt-4 font-display text-lg text-foreground">10 am - 4 pm</p>
              </div>
              <div className="rounded-sm border border-border bg-card/50 p-8">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-accent-foreground">The Venue</p>
                <p className="mt-4 font-display text-2xl text-primary">{VENUE_NAME}</p>
                <p className="mt-1 font-display text-lg text-foreground">{VENUE_ADDRESS}</p>
                <p className="mt-1 font-display text-lg text-foreground">{VENUE_CITY}</p>
                <p className="mt-1 font-display text-lg text-muted-foreground">{VENUE_COUNTRY}</p>
              </div>
            </div>

            <p className="mt-10 max-w-lg font-display text-lg text-muted-foreground">
              The event will include drinks and cocktails refreshments.
            </p>
          </div>
        </RevealSection>

        {/* MAP */}
        <RevealSection variant="fade-right" className="!max-w-5xl">
          <div className="reveal-stagger">
          <div className="text-center">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">Find Us Here</p>
            <h2 className="mt-3 font-display text-3xl font-light text-primary sm:text-4xl">
              {VENUE_NAME}, {VENUE_CITY}, {VENUE_COUNTRY}
            </h2>
          </div>
          <div className="mt-10 overflow-hidden rounded-sm border border-border shadow-[var(--shadow-elegant)]">
            <iframe
              title="Event venue map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_DESTINATION)}&output=embed`}
              className="h-[400px] w-full sm:h-[500px]"
              style={{ border: 0, filter: "sepia(0.15) saturate(0.9)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-6 text-center">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_DESTINATION)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block border-b border-accent px-2 pb-1 font-sans text-xs uppercase tracking-[0.4em] text-primary transition hover:text-accent-foreground"
            >
              Get Directions
            </a>
          </div>
          </div>
        </RevealSection>

        {/* GIFTS */}
        <RevealSection variant="fade-up">
          <div className="reveal-stagger flex flex-col items-center text-center">
            <h2 className="font-sans text-sm uppercase tracking-[0.5em] text-muted-foreground">Gifts</h2>
            <p className="mt-8 max-w-xl font-display text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We are incredibly blessed to have your love and support. If you would like to honor us with a gift,
              please find our registry and contribution details listed below:
            </p>
            <a
              href="https://www.paypal.com/pool/9pyygG8bGg?sr=ancr"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block border-b border-accent px-2 pb-1 font-sans text-xs uppercase tracking-[0.25em] text-primary transition hover:text-accent-foreground break-all sm:text-sm"
            >
              View our gift registry
            </a>
          </div>
        </RevealSection>

        {/* CLOSING */}
        <RevealSection variant="scale-up" className="text-center">
          <div className="reveal-stagger">
          <img
            src={florals}
            alt=""
            loading="lazy"
            width={1024}
            height={1024}
            className="mx-auto w-48 rotate-180 opacity-70 sm:w-64"
          />
          <p className="mt-6 font-display text-2xl italic text-muted-foreground">
            Your presence is the greatest gift of all.
          </p>
          <p className="mt-10 font-script text-5xl text-primary">With love,</p>
          <p className="mt-2 font-script text-4xl text-accent-foreground">Emmanuel &amp; Lovelyne</p>
          <div className="mx-auto mt-12 h-px w-24 bg-border" />
          <p className="mt-6 font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
            29 · 08 · 2026 · {VENUE_NAME}, {VENUE_CITY}
          </p>
          </div>
        </RevealSection>
      </div>
    </main>
  );
}
