import { motion } from "framer-motion";

// Real falling water droplets, not lines: each drop is tiny (1px-2px wide,
// 6px-10px tall), rendered as a vertical gradient (transparent -> soft white
// -> brighter center -> transparent) with fully rounded ends, so it reads as
// a stretched droplet rather than a glowing streak. Three depth layers
// (front/middle/background) give the scene perspective. Every drop falls
// continuously from above the card to the bottom edge with a gentle
// gravity-like acceleration, holds constant opacity for the entire fall
// (never fades mid-air), then hands off to the existing splash system
// exactly on impact before repeating.

const LAYER_CONFIG = {
  // Very far rain: smallest, faintest, blurred, slowest — reads as depth,
  // not as individual objects.
  background: {
    countByIntensity: { light: 20, medium: 28, heavy: 38 },
    opacityByIntensity: { light: 0.16, medium: 0.21, heavy: 0.28 },
    height: [5, 7],
    width: [0.8, 1.1],
    duration: [3.2, 6.5],
    blur: [0.5, 0.9],
  },
  // Middle rain: medium size/opacity/speed, the bulk of the visible volume.
  middle: {
    countByIntensity: { light: 13, medium: 18, heavy: 24 },
    opacityByIntensity: { light: 0.32, medium: 0.42, heavy: 0.54 },
    height: [6.5, 8.5],
    width: [1.1, 1.5],
    duration: [1.6, 3.2],
    blur: [0.2, 0.4],
  },
  // Near-camera rain: brightest, thickest, fastest, occasional larger drops.
  front: {
    countByIntensity: { light: 5, medium: 7, heavy: 10 },
    opacityByIntensity: { light: 0.55, medium: 0.7, heavy: 0.88 },
    height: [7.5, 11],
    width: [1.5, 2],
    duration: [0.8, 1.7],
    blur: [0, 0.15],
  },
};

const WIND_BY_INTENSITY = { light: 5, medium: 8, heavy: 12 };
const GLASS_COUNT_BY_INTENSITY = { light: 2, medium: 3, heavy: 4 };
const WET_GLASS_COUNT_BY_INTENSITY = { light: 2, medium: 3, heavy: 3 };

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Rain spawns across the full width of the card, including behind the
// text — the card's own dark background/overlay keeps the text readable.
function randomLeft() {
  return randomBetween(0, 100);
}

function buildDrops(layerKey, count, { intensity, wind }) {
  const cfg = LAYER_CONFIG[layerKey];
  const baseOpacity = cfg.opacityByIntensity[intensity] ?? cfg.opacityByIntensity.medium;

  return Array.from({ length: count }).map((_, i) => {
    const left = randomLeft();
    // Drops spawn well above the visible card (not just a few pixels off
    // the edge), across a deep, wide vertical band — rain already exists
    // above the scene, so nothing should visibly "pop in" near the top.
    const startY = randomBetween(-420, -60);
    const duration = randomBetween(cfg.duration[0], cfg.duration[1]);
    // Delay is spread across a much wider window than one cycle so drops
    // within the same layer are never in phase with each other — this is
    // what prevents "waves" of drops moving together.
    const delay = randomBetween(0, duration * 3.5);
    const height = randomBetween(cfg.height[0], cfg.height[1]);
    const width = randomBetween(cfg.width[0], cfg.width[1]);
    // Wind angle: a small, natural 5deg-10deg tilt, never extreme diagonal rain.
    const tilt = randomBetween(5, 10) * (wind >= 8 ? 1 : 0.6) * (Math.random() < 0.5 ? 1 : -1);
    const blur = randomBetween(cfg.blur[0], cfg.blur[1]);
    // Drift is expressed as a mid-fall waypoint plus a final value (rather
    // than a single straight interpolation), so the horizontal motion has a
    // slight organic curve instead of a mechanically straight diagonal.
    const driftFinal = wind * randomBetween(0.5, 1.3) * (Math.random() < 0.5 ? -1 : 1);
    const driftMid = driftFinal * randomBetween(0.35, 0.6);
    const opacity = baseOpacity * randomBetween(0.65, 1.35);
    const brightness = randomBetween(0.8, 1.2);
    const hasSplash = layerKey !== "background";

    return {
      key: `${layerKey}-${i}`,
      left,
      startY,
      duration,
      delay,
      height,
      width,
      tilt,
      blur,
      driftMid,
      driftFinal,
      opacity,
      brightness,
      hasSplash,
    };
  });
}

function Drop({ d }) {
  const core = Math.min(0.9, 0.7 * d.brightness);

  return (
    <motion.div
      initial={{ y: d.startY, x: 0, opacity: 0 }}
      animate={{
        // One continuous fall per drop, from deep above the card to the
        // bottom edge. translateY/X only — no visibility toggling, no
        // mid-flight reset, no popping in near the top.
        y: "100%",
        // A three-point drift curve (not a single straight interpolation)
        // gives the horizontal motion a slight organic curve rather than a
        // mechanically straight diagonal line.
        x: [0, d.driftMid, d.driftFinal],
        // Opacity ramps in gradually while still off-screen/near the top
        // edge, stays constant through the entire visible fall, and only
        // eases down in the last instant right at impact — never a
        // mid-air fade, never an abrupt pop-in.
        opacity: [0, d.opacity, d.opacity, d.opacity * 0.3, 0],
      }}
      transition={{
        // A gentle ease-in on the fall approximates gravity — drops start
        // slightly slower and gain momentum toward impact — while still
        // guaranteeing arrival at the bottom every cycle.
        duration: d.duration,
        repeat: Infinity,
        delay: d.delay,
        ease: "easeIn",
        x: {
          duration: d.duration,
          repeat: Infinity,
          delay: d.delay,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        },
        opacity: {
          duration: d.duration,
          repeat: Infinity,
          delay: d.delay,
          ease: "linear",
          times: [0, 0.15, 0.93, 0.97, 1],
        },
      }}
      className="absolute top-0 rounded-full"
      style={{
        left: `${d.left}%`,
        width: d.width,
        height: d.height,
        rotate: `${d.tilt}deg`,
        filter: d.blur ? `blur(${d.blur}px)` : "none",
        transformOrigin: "top center",
        background: `linear-gradient(to bottom, rgba(203,213,225,0) 0%, rgba(203,213,225,${(core * 0.7).toFixed(2)}) 30%, rgba(226,232,240,${core.toFixed(2)}) 55%, rgba(203,213,225,${(core * 0.6).toFixed(2)}) 80%, rgba(203,213,225,0) 100%)`,
      }}
    />
  );
}

function Splash({ drop }) {
  // Synced to the drop's own fall duration/delay so the splash appears
  // right as that specific drop reaches the bottom of the card, then fades
  // quickly. Built from a small impact core plus two expanding ripple rings.
  const impactDelay = drop.delay + drop.duration * 0.985;
  const repeatDelay = Math.max(drop.duration - 0.4, 0.3);
  const coreSize = randomBetween(4, 6);

  return (
    <div className="absolute" style={{ left: `${drop.left}%`, bottom: 0 }}>
      {/* Impact core: a brief bright dot at the point of contact */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: 0,
          left: -coreSize / 2,
          width: coreSize,
          height: coreSize * 0.5,
          background: "radial-gradient(ellipse 50% 50% at center, rgba(220,230,255,0.9) 0%, rgba(220,230,255,0) 75%)",
        }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{
          duration: 0.18,
          repeat: Infinity,
          repeatDelay: Math.max(drop.duration - 0.18, 0.3),
          delay: impactDelay,
          ease: "easeOut",
        }}
      />

      {/* Ripple ring 1: expands and fades quickly */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          bottom: -1,
          left: -6,
          width: 12,
          height: 6,
          borderColor: "rgba(200,210,230,0.55)",
          borderWidth: 1,
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.6], opacity: [0, 0.55, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay,
          delay: impactDelay,
          ease: "easeOut",
        }}
      />

      {/* Ripple ring 2: slightly delayed, expands further and softer, giving
          the impression of a natural water ripple rather than a single pulse */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          bottom: -1,
          left: -8,
          width: 16,
          height: 8,
          borderColor: "rgba(200,210,230,0.35)",
          borderWidth: 1,
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 2.1], opacity: [0, 0.35, 0] }}
        transition={{
          duration: 0.65,
          repeat: Infinity,
          repeatDelay: Math.max(repeatDelay - 0.15, 0.2),
          delay: impactDelay + 0.05,
          ease: "easeOut",
        }}
      />
    </div>
  );
}

function buildGlassStreaks(count) {
  return Array.from({ length: count }).map((_, i) => {
    const left = randomLeft();
    const duration = randomBetween(4, 9);
    const delay = randomBetween(0, duration * 1.5);
    const length = randomBetween(70, 140);
    const wobble = randomBetween(3, 7);

    return { key: `glass-${i}`, left, duration, delay, length, wobble };
  });
}

function GlassStreak({ s }) {
  return (
    <motion.div
      initial={{ y: "-10%", opacity: 0 }}
      animate={{
        y: "115%",
        x: [0, s.wobble, s.wobble * 0.3, -s.wobble * 0.5, 0],
        opacity: [0, 0.1, 0.1, 0],
      }}
      transition={{
        duration: s.duration,
        repeat: Infinity,
        delay: s.delay,
        ease: "linear",
      }}
      className="absolute top-0"
      style={{
        left: `${s.left}%`,
        width: 5,
        height: s.length,
        filter: "blur(2.5px)",
        background: "linear-gradient(to bottom, rgba(226,232,240,0) 0%, rgba(226,232,240,0.5) 50%, rgba(226,232,240,0) 100%)",
      }}
    />
  );
}

function buildWetGlassTrails(count) {
  // A slow, lazy bead of water running down the inside of a window pane —
  // much slower and wider than falling rain, with a gentle, almost idle drift.
  return Array.from({ length: count }).map((_, i) => {
    const left = randomLeft();
    const duration = randomBetween(9, 16);
    const delay = randomBetween(0, duration * 1.6);
    const length = randomBetween(90, 160);
    const drift = randomBetween(-4, 4);

    return { key: `wetglass-${i}`, left, duration, delay, length, drift };
  });
}

function WetGlassTrail({ s }) {
  return (
    <motion.div
      initial={{ y: "-10%", opacity: 0 }}
      animate={{
        y: "112%",
        x: [0, s.drift, s.drift * 0.6, s.drift],
        opacity: [0, 0.09, 0.09, 0],
      }}
      transition={{
        duration: s.duration,
        repeat: Infinity,
        delay: s.delay,
        ease: "easeInOut",
      }}
      className="absolute top-0"
      style={{
        left: `${s.left}%`,
        width: 9,
        height: s.length,
        filter: "blur(3px)",
        background: "linear-gradient(to bottom, rgba(226,232,240,0) 0%, rgba(226,232,240,0.4) 20%, rgba(226,232,240,0.4) 80%, rgba(226,232,240,0) 100%)",
      }}
    />
  );
}

export default function RainParticles({ intensity = "medium" }) {
  const wind = WIND_BY_INTENSITY[intensity] ?? WIND_BY_INTENSITY.medium;
  const glassCount = GLASS_COUNT_BY_INTENSITY[intensity] ?? GLASS_COUNT_BY_INTENSITY.medium;
  const wetGlassCount = WET_GLASS_COUNT_BY_INTENSITY[intensity] ?? WET_GLASS_COUNT_BY_INTENSITY.medium;

  const backgroundDrops = buildDrops("background", LAYER_CONFIG.background.countByIntensity[intensity] ?? LAYER_CONFIG.background.countByIntensity.medium, { intensity, wind });
  const middleDrops = buildDrops("middle", LAYER_CONFIG.middle.countByIntensity[intensity] ?? LAYER_CONFIG.middle.countByIntensity.medium, { intensity, wind });
  const frontDrops = buildDrops("front", LAYER_CONFIG.front.countByIntensity[intensity] ?? LAYER_CONFIG.front.countByIntensity.medium, { intensity, wind });
  const glassStreaks = buildGlassStreaks(glassCount);
  const wetGlassTrails = buildWetGlassTrails(wetGlassCount);

  const splashDrops = [...middleDrops, ...frontDrops].filter((d) => d.hasSplash);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {backgroundDrops.map((d) => (
        <Drop key={d.key} d={d} />
      ))}

      {middleDrops.map((d) => (
        <Drop key={d.key} d={d} />
      ))}

      {frontDrops.map((d) => (
        <Drop key={d.key} d={d} />
      ))}

      {glassStreaks.map((s) => (
        <GlassStreak key={s.key} s={s} />
      ))}

      {wetGlassTrails.map((s) => (
        <WetGlassTrail key={s.key} s={s} />
      ))}

      {splashDrops.map((d) => (
        <Splash key={`splash-${d.key}`} drop={d} />
      ))}

      {/* Wet surface: a very soft, low shimmer band at the bottom edge,
          suggesting light reflecting off a rain-soaked surface */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-3"
        style={{
          background: "linear-gradient(to top, rgba(220,230,255,0.12) 0%, transparent 100%)",
        }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
