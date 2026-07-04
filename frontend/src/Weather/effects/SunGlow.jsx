import { motion } from "framer-motion";

// The large-scale atmospheric light now lives in WeatherSceneManager's sky
// gradient stack (a radial glow anchored at the same position as the sun
// below), so the light and the sky are one connected system. This component
// only renders the sun's own small, bright core and its immediate corona —
// no separate wide blur stack that would read as an independent glowing
// circle floating over the sky.

export default function SunGlow() {
  return (
    <>
      {/* Corona: a tight, soft-edged halo hugging the disc, not a wide independent glow */}
      <motion.div
        className="absolute top-[15%] right-[15%] w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,236,190,0.55) 0%, rgba(255,214,140,0.22) 55%, transparent 80%)",
          filter: "blur(6px)",
        }}
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.75, 1, 0.75],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sun core: a small, bright, mostly solid disc — the only defined shape */}
      <motion.div
        className="absolute top-[18%] right-[18%] w-14 h-14 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, #fff8e6 0%, #ffe4a3 45%, #ffc768 100%)",
          boxShadow: "0 0 18px 4px rgba(255, 214, 140, 0.5)",
        }}
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Heat Haze */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-200/15 to-transparent origin-bottom"
        animate={{
          scaleY: [1, 1.3, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}
