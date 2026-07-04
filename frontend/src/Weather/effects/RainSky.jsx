import { motion } from "framer-motion";

// A dedicated rainy-day atmosphere, built with the same "many overlapping
// density patches" technique as OvercastSky/SnowSky, but darker, cooler, and
// heavier — real rain comes from a thick, low, moisture-laden cloud layer,
// not a flat dark gradient. A soft distance haze and a faint damp sheen are
// layered in to sell "wet atmosphere" without the scene going too dark or
// hiding the card.

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function buildDensityPatches(count) {
  return Array.from({ length: count }).map((_, i) => {
    const top = randomBetween(-15, 65);
    const left = randomBetween(-10, 100);
    const size = randomBetween(180, 380);
    const blur = randomBetween(40, 68);
    const opacity = randomBetween(0.22, 0.4);
    // Heavy, dramatic storm-cloud tones — dark charcoal mixed with deep
    // slate, closer to a real thick rain-cloud ceiling than a soft overcast.
    const isDeep = Math.random() < 0.55;
    const tone = isDeep ? "rgba(15,23,42,VAR)" : "rgba(51,65,85,VAR)";

    return {
      key: `raincloud-${i}`,
      top,
      left,
      size,
      blur,
      tone: tone.replace("VAR", opacity.toFixed(2)),
    };
  });
}

const GROUP_A = buildDensityPatches(11);
const GROUP_B = buildDensityPatches(9);

function PatchGroup({ patches, startX, distanceX, duration }) {
  return (
    <motion.div
      className="absolute inset-[-30%]"
      initial={{ x: startX }}
      animate={{ x: startX + distanceX }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {patches.map((p) => (
        <div
          key={p.key}
          className="absolute rounded-full"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.tone,
            filter: `blur(${p.blur}px)`,
          }}
        />
      ))}
    </motion.div>
  );
}

export default function RainSky({ heavy = false }) {
  return (
    <>
      {/* Base sky: a dark, dramatic storm gray — much closer to the heavy,
          moody rain-cloud ceiling of a real storm than a bright afternoon,
          while staying short of full night-black. */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          heavy
            ? "from-slate-700/65 via-slate-800/68 to-slate-950/78"
            : "from-slate-600/55 via-slate-700/58 to-slate-900/68"
        }`}
      />

      {/* Diffuse storm light: a dim, cool wash rather than bright daylight —
          just enough ambient brightness to see the cloud texture and rain
          against, matching a dark stormy atmosphere. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "linear-gradient(to bottom, rgba(148,163,184,0.12) 0%, rgba(148,163,184,0.16) 30%, rgba(100,116,139,0.08) 55%, transparent 80%)",
        }}
        animate={{ opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cloud ceiling depth: dark, dense, dramatic storm-cloud patches */}
      <PatchGroup patches={GROUP_A} startX={-200} distanceX={220} duration={160} />
      <PatchGroup patches={GROUP_B} startX={-120} distanceX={160} duration={220} />

      {/* Rainy distance mist: soft veil reducing visibility toward the middle
          of the frame, kept subtle and away from the card's readable center */}
      <div className="absolute inset-x-0 top-1/3 h-1/2 bg-gradient-to-b from-transparent via-slate-300/7 to-slate-300/11" />

      {/* Wet atmosphere pulse: subtle breathing effect of atmospheric moisture */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(226,232,240,0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground-level dimming for depth */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/45 to-transparent" />

      {/* Depth falloff toward the card edges so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50" />
    </>
  );
}
