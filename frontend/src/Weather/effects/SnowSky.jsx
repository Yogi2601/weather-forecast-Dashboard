import { motion } from "framer-motion";

// A dedicated snowy-day atmosphere. Real snowfall usually happens under a
// bright, flat, cloud-covered sky — not a dark evening gradient — so this
// builds a cold, bright white/light-blue cloud ceiling with real depth and a
// very soft distance haze, using the same "many overlapping density patches"
// approach as OvercastSky.jsx (kept as its own copy/tuning here since a
// snowy sky is bright and cold-toned, not dim and gray).

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function buildDensityPatches(count) {
  return Array.from({ length: count }).map((_, i) => {
    const top = randomBetween(-15, 65);
    const left = randomBetween(-10, 100);
    const size = randomBetween(150, 330);
    const blur = randomBetween(40, 65);
    const opacity = randomBetween(0.07, 0.15);
    // Cold, bright tones only — white and pale ice-blue, no warm or dark gray tones.
    const isBlue = Math.random() < 0.4;
    const tone = isBlue ? "rgba(191,219,254,VAR)" : "rgba(241,245,249,VAR)";

    return {
      key: `snowcloud-${i}`,
      top,
      left,
      size,
      blur,
      tone: tone.replace("VAR", opacity.toFixed(2)),
    };
  });
}

const GROUP_A = buildDensityPatches(10);
const GROUP_B = buildDensityPatches(8);

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

export default function SnowSky() {
  return (
    <>
      {/* Base sky: bright, cold, overcast-white with a pale ice-blue cast —
          the opposite of a dark evening gradient. This is what a real
          snowy-day sky looks like: flat, bright, and cold. */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200/22 via-sky-100/16 to-slate-300/24" />

      {/* Cold ambient light: soft, diffuse, no visible sun — just an even,
          slightly blue-white brightness filling the atmosphere */}
      <motion.div
        className="absolute -top-1/4 left-1/4 w-3/4 h-3/4"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(226,232,240,0.18) 0%, rgba(191,219,254,0.09) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cloud ceiling depth: continuous drifting density texture, same
          technique as the overcast sky but bright and cold-toned */}
      <PatchGroup patches={GROUP_A} startX={-200} distanceX={240} duration={200} />
      <PatchGroup patches={GROUP_B} startX={-120} distanceX={170} duration={280} />

      {/* Distant snow haze: very soft, low-opacity veil that suggests reduced
          visibility far away without ever approaching the card's readable
          center */}
      <div className="absolute inset-x-0 top-1/3 h-1/2 bg-gradient-to-b from-transparent via-slate-100/8 to-slate-100/14" />

      {/* Atmospheric brightness pulse: subtle breathing effect of snow-light */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(241,245,249,0.06) 0%, transparent 65%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground-level cold dimming for depth, kept light so the scene stays bright */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-800/25 to-transparent" />

      {/* Depth falloff toward the card edges so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/45" />
    </>
  );
}
