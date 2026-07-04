import { motion } from "framer-motion";

// Volumetric atmospheric mist — airborne water vapor, not smoke/fog/clouds.
// Built from a handful of large, heavily blurred, overlapping radial
// gradients rather than particles, so there is nothing discrete to notice:
// only a slow, breathing sense that the air itself is saturated with
// moisture. Sits behind RainParticles but above RainSky in the stacking
// order (mounted after RainSky, before RainParticles, in the scene).

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Each mist blob is a soft radial gradient with no hard edge (fades to
// fully transparent well before its own bounding box), so overlapping
// blobs blend into a continuous haze instead of forming visible shapes.
function MistBlob({ top, left, width, height, opacity, blur, hueLight, driftX, driftY, duration, breatheDuration, breatheDelay }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        top,
        left,
        width,
        height,
        filter: `blur(${blur}px)`,
        background: hueLight
          ? `radial-gradient(ellipse 55% 45% at 50% 50%, rgba(226,232,240,${opacity}) 0%, rgba(203,213,225,${opacity * 0.55}) 45%, transparent 75%)`
          : `radial-gradient(ellipse 55% 45% at 50% 50%, rgba(148,163,184,${opacity}) 0%, rgba(100,116,139,${opacity * 0.5}) 45%, transparent 75%)`,
      }}
      animate={{
        // Slow horizontal drift plus a very small vertical bob — turbulence,
        // not a directional wind gust.
        x: [0, driftX, driftX * 0.4, -driftX * 0.3, 0],
        y: [0, -driftY, driftY * 0.5, driftY, 0],
        // Tiny, slow density fluctuation ("breathing") — never a hard pulse,
        // just a gentle thickening/thinning of that patch of mist.
        opacity: [1, 0.82, 1, 0.9, 1],
      }}
      transition={{
        x: { duration, repeat: Infinity, ease: "easeInOut" },
        y: { duration: duration * 1.3, repeat: Infinity, ease: "easeInOut" },
        opacity: {
          duration: breatheDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: breatheDelay,
        },
      }}
    />
  );
}

function buildLayer(count, { widthRange, heightRange, opacityRange, blurRange, driftXRange, driftYRange, durationRange, breatheRange, hueLight }) {
  return Array.from({ length: count }).map(() => ({
    top: `${randomBetween(-20, 70)}%`,
    left: `${randomBetween(-25, 85)}%`,
    width: randomBetween(widthRange[0], widthRange[1]),
    height: randomBetween(heightRange[0], heightRange[1]),
    opacity: randomBetween(opacityRange[0], opacityRange[1]),
    blur: randomBetween(blurRange[0], blurRange[1]),
    driftX: randomBetween(driftXRange[0], driftXRange[1]) * (Math.random() < 0.5 ? -1 : 1),
    driftY: randomBetween(driftYRange[0], driftYRange[1]),
    duration: randomBetween(durationRange[0], durationRange[1]),
    breatheDuration: randomBetween(breatheRange[0], breatheRange[1]),
    breatheDelay: randomBetween(0, breatheRange[1]),
    hueLight,
  }));
}

// Far atmosphere: widest, faintest, slowest — almost invisible on its own,
// only contributes when perceived as part of the whole.
const FAR_LAYER = buildLayer(2, {
  widthRange: [420, 560],
  heightRange: [180, 240],
  opacityRange: [0.05, 0.08],
  blurRange: [70, 90],
  driftXRange: [30, 55],
  driftYRange: [8, 14],
  durationRange: [50, 70],
  breatheRange: [18, 26],
  hueLight: false,
});

// Mid atmosphere: a touch more present, subtle density variation between
// patches so it doesn't read as one uniform veil.
const MID_LAYER = buildLayer(2, {
  widthRange: [320, 440],
  heightRange: [140, 200],
  opacityRange: [0.07, 0.11],
  blurRange: [55, 75],
  driftXRange: [22, 40],
  driftYRange: [6, 12],
  durationRange: [38, 55],
  breatheRange: [14, 20],
  hueLight: false,
});

// Near atmosphere: slightly brighter and softer-edged, sits closest to the
// viewer — this is the layer that would catch lightning illumination.
const NEAR_LAYER = buildLayer(2, {
  widthRange: [260, 360],
  heightRange: [110, 160],
  opacityRange: [0.09, 0.14],
  blurRange: [45, 60],
  driftXRange: [16, 30],
  driftYRange: [5, 10],
  durationRange: [28, 42],
  breatheRange: [10, 16],
  hueLight: true,
});

export default function RainMist() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FAR_LAYER.map((m, i) => (
        <MistBlob key={`mist-far-${i}`} {...m} />
      ))}
      {MID_LAYER.map((m, i) => (
        <MistBlob key={`mist-mid-${i}`} {...m} />
      ))}
      {NEAR_LAYER.map((m, i) => (
        <MistBlob key={`mist-near-${i}`} {...m} />
      ))}
    </div>
  );
}
