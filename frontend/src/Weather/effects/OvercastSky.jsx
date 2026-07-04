import { motion } from "framer-motion";

// A dedicated overcast atmosphere, separate from the reusable drifting
// Clouds.jsx used elsewhere. Real overcast light doesn't come from a visible
// sun — it's diffuse light scattered through a solid, uneven cloud ceiling.
// Instead of a few discrete oval "cloud" shapes (which read as separate
// floating objects), this builds one continuous mass out of many small,
// irregularly placed, differently-toned patches layered on top of each
// other — density variation reads as texture, not shapes. The whole mass
// drifts together, very slowly, as two large groups rather than as
// individually-tracked pieces.

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Generates a cluster of overlapping patches with varied tone (darker/
// lighter than the base) and blur, so no single patch reads as "a cloud" —
// only the combined density texture is visible.
function buildDensityPatches(count, { darkRatio }) {
  return Array.from({ length: count }).map((_, i) => {
    const isDark = Math.random() < darkRatio;
    const top = randomBetween(-15, 70);
    const left = randomBetween(-10, 100);
    const size = randomBetween(140, 320);
    const blur = randomBetween(35, 60);
    const opacity = isDark ? randomBetween(0.08, 0.16) : randomBetween(0.06, 0.13);
    const tone = isDark ? "rgba(51,65,85,VAR)" : "rgba(203,213,225,VAR)";

    return {
      key: `patch-${i}`,
      top,
      left,
      size,
      blur,
      opacity,
      tone: tone.replace("VAR", opacity.toFixed(2)),
    };
  });
}

const GROUP_A_PATCHES = buildDensityPatches(11, { darkRatio: 0.45 });
const GROUP_B_PATCHES = buildDensityPatches(9, { darkRatio: 0.4 });

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

export default function OvercastSky() {
  return (
    <>
      {/* Base overcast tone: cool, muted, no blue-sky saturation — this is what
          "light through a solid cloud layer" looks like, not a tinted sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700/55 via-slate-600/40 to-slate-800/60" />

      {/* Hidden sunlight: diffuse, uneven, no clean circular edge — light that
          is scattered and partly blocked by thick cloud, not a glowing source.
          Sits low-opacity and off-center so it never reads as "a glow." */}
      <motion.div
        className="absolute -top-1/3 left-1/4 w-3/4 h-3/4"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(226,232,240,0.14) 0%, rgba(203,213,225,0.07) 35%, transparent 65%)",
          filter: "blur(70px)",
        }}
        animate={{ opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Continuous cloud-density texture: many small overlapping patches of
          varied tone/size/blur instead of a few smooth ellipse bands. Two
          large groups drift together at very different, very slow speeds so
          the whole mass feels like one drifting ceiling, not countable
          objects — the relative motion between groups is what reads as
          uneven, organic density rather than a repeated pattern. */}
      <PatchGroup patches={GROUP_A_PATCHES} startX={-200} distanceX={260} duration={220} />
      <PatchGroup patches={GROUP_B_PATCHES} startX={-120} distanceX={180} duration={310} />

      {/* Cloud drama animation: subtle darkening and lightening for atmospheric effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(148,163,184,0.05) 0%, transparent 65%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground-level dimming: overcast days feel flatter and dimmer near the
          surface, distinct from the lit cloud ceiling above */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/35 to-transparent" />

      {/* Depth falloff toward the card edges so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/55" />
    </>
  );
}
