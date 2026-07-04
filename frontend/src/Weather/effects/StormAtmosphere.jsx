import { motion } from "framer-motion";

// Distant atmospheric scattering — the real optical effect of humid air
// sitting between the viewer and the horizon, which desaturates and
// flattens contrast on anything far away. This is NOT fog (no density
// texture), NOT cloud (no shapes), NOT mist (no turbulence/movement) — it
// is a near-static, almost-invisible softening of the horizon band that
// exists purely to add depth by making "far" look optically different from
// "near." Motion, if any, is extremely slow and barely perceptible.

export default function StormAtmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Horizon scattering: a wide, very soft band that lightens and
          desaturates the distance — the classic "haze washes out the
          horizon" look, concentrated low in the frame where distant
          elements would sit. */}
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: "35%",
          height: "45%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(148,163,184,0.06) 40%, rgba(148,163,184,0.09) 70%, rgba(148,163,184,0.05) 100%)",
          filter: "blur(18px)",
        }}
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Contrast reduction: a faint desaturating wash across the whole
          scene, strongest toward the horizon band and fading toward the
          viewer — this is what makes distant cloud/rain detail read as
          softer and lower-contrast than near detail, without adding any
          visible shape of its own. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 25%, rgba(203,213,225,0.04) 50%, rgba(203,213,225,0.07) 65%, rgba(203,213,225,0.03) 80%, transparent 100%)",
        }}
      />

      {/* A single, extremely slow-drifting scattering layer — barely
          perceptible motion, just enough that the haze doesn't feel like a
          static painted-on gradient. */}
      <motion.div
        className="absolute inset-x-[-10%]"
        style={{
          top: "40%",
          height: "35%",
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(226,232,240,0.05) 0%, transparent 70%)",
          filter: "blur(35px)",
        }}
        animate={{ x: [0, 40, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 70, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
