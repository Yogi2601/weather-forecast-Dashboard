import { motion } from "framer-motion";

export default function FogLayer() {
  return (
    <>
      <motion.div
        className="absolute inset-x-[-20%] top-1/4 h-40 bg-white/10 blur-3xl"
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-[-30%] top-1/2 h-52 bg-white/8 blur-3xl"
        animate={{ x: [0, -80, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-[-20%] bottom-0 h-48 bg-white/12 blur-2xl"
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
