import { motion } from "framer-motion";

const flakes = Array.from({ length: 90 });
const nearFlakes = Array.from({ length: 18 });

export default function SnowParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map((_, i) => {
        const left = Math.random() * 100;
        const size = 3 + Math.random() * 6;
        const duration = 6 + Math.random() * 8;
        const delay = Math.random() * 6;
        const drift = 20 + Math.random() * 40;

        return (
          <motion.div
            key={i}
            initial={{
              y: -20,
              x: `${left}vw`,
              opacity: 0,
            }}
            animate={{
              y: "110vh",
              x: [`${left}vw`, `${left + drift / 10}vw`, `${left}vw`],
              opacity: [0, 0.55, 0.55, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white/80 blur-[0.5px]"
            style={{
              width: size,
              height: size,
            }}
          />
        );
      })}

      {nearFlakes.map((_, i) => {
        const left = Math.random() * 100;
        const size = 8 + Math.random() * 6;
        const duration = 3.5 + Math.random() * 3;
        const delay = Math.random() * 4;
        const drift = 30 + Math.random() * 50;

        return (
          <motion.div
            key={`near-${i}`}
            initial={{
              y: -20,
              x: `${left}vw`,
              opacity: 0,
            }}
            animate={{
              y: "110vh",
              x: [`${left}vw`, `${left + drift / 10}vw`, `${left}vw`],
              opacity: [0, 0.75, 0.75, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white/95 shadow-[0_0_4px_rgba(255,255,255,0.3)]"
            style={{
              width: size,
              height: size,
            }}
          />
        );
      })}

      {/* Ground Accumulation Glow */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/14 to-transparent"
        animate={{
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
