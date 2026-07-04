import { motion } from "framer-motion";

export default function Clouds({ prefersReducedMotion = false }) {
  const duration = prefersReducedMotion ? 0 : 80;

  return (
    <>
      <motion.div
        animate={{
          x: ["-15%", "110%"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-20 left-0"
      >
        <img
          src="/cloud1.png"
          alt=""
          className="w-80 opacity-90"
        />
      </motion.div>

      <motion.div
        animate={{
          x: ["110%", "-20%"],
        }}
        transition={{
          duration: duration + 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-40 right-0"
      >
        <img
          src="/cloud2.png"
          alt=""
          className="w-72 opacity-80"
        />
      </motion.div>
    </>
  );
}