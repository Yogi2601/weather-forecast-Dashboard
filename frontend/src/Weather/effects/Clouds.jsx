import { motion } from "framer-motion";

// Each cloud is a small cluster of overlapping soft-edged blobs (instead of a
// single long oval), so the silhouette reads as irregular and natural rather
// than a blurred cylinder. The four clouds keep their original motion system
// (x drift, wind-tilt rotate, brightness pulse) — only the shape composition
// changes.

function CloudShape({ blobs }) {
  return (
    <>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: b.top,
            left: b.left,
            width: b.width,
            height: b.height,
            opacity: b.opacity,
            filter: `blur(${b.blur}px)`,
          }}
          animate={{
            scale: [1, b.scalePeak, 1],
            borderRadius: ["50%", b.shapeShift, "50%"],
          }}
          transition={{
            duration: b.morphDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.morphDelay,
          }}
        />
      ))}
    </>
  );
}

export default function Clouds() {
  return (
    <>
      {/* Ground Shadow */}
      <motion.div
        className="absolute inset-x-0 top-1/3 h-40 bg-gradient-to-b from-slate-900/15 via-slate-900/5 to-transparent"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Cloud 1 */}
      <motion.div
        className="absolute top-10 left-[-260px] w-72 h-24"
        animate={{
          x: [0, 1800],
          rotate: [0, 1.2, 0, -1.2, 0],
          filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"],
        }}
        transition={{
          x: { duration: 70, repeat: Infinity, ease: "linear" },
          rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <CloudShape
          blobs={[
            { top: 6, left: 0, width: 120, height: 60, opacity: 0.16, blur: 26, scalePeak: 1.06, shapeShift: "46%", morphDuration: 14, morphDelay: 0 },
            { top: -6, left: 70, width: 150, height: 70, opacity: 0.2, blur: 30, scalePeak: 1.08, shapeShift: "42%", morphDuration: 17, morphDelay: 1.5 },
            { top: 14, left: 160, width: 100, height: 50, opacity: 0.14, blur: 24, scalePeak: 1.05, shapeShift: "48%", morphDuration: 12, morphDelay: 3 },
            { top: 0, left: 210, width: 90, height: 44, opacity: 0.12, blur: 22, scalePeak: 1.07, shapeShift: "44%", morphDuration: 15, morphDelay: 2 },
          ]}
        />
      </motion.div>

      {/* Cloud 2 */}
      <motion.div
        className="absolute top-32 left-[-360px] w-96 h-28"
        animate={{
          x: [0, 2100],
          rotate: [0, -1, 0, 1, 0],
          filter: ["brightness(1)", "brightness(1.12)", "brightness(1)"],
        }}
        transition={{
          x: { duration: 95, repeat: Infinity, ease: "linear" },
          rotate: { duration: 11, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 8.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <CloudShape
          blobs={[
            { top: 8, left: 0, width: 150, height: 70, opacity: 0.12, blur: 34, scalePeak: 1.07, shapeShift: "44%", morphDuration: 16, morphDelay: 0.5 },
            { top: -10, left: 90, width: 190, height: 84, opacity: 0.14, blur: 38, scalePeak: 1.09, shapeShift: "40%", morphDuration: 19, morphDelay: 2 },
            { top: 18, left: 210, width: 130, height: 60, opacity: 0.1, blur: 30, scalePeak: 1.05, shapeShift: "48%", morphDuration: 13, morphDelay: 4 },
            { top: 2, left: 280, width: 110, height: 52, opacity: 0.09, blur: 28, scalePeak: 1.06, shapeShift: "46%", morphDuration: 15, morphDelay: 1 },
          ]}
        />
      </motion.div>

      {/* Cloud 3 */}
      <motion.div
        className="absolute top-56 left-[-410px] w-80 h-24"
        animate={{
          x: [0, 2300],
          rotate: [0, 1, 0, -1, 0],
          filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
        }}
        transition={{
          x: { duration: 110, repeat: Infinity, ease: "linear" },
          rotate: { duration: 13, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <CloudShape
          blobs={[
            { top: 6, left: 0, width: 110, height: 54, opacity: 0.1, blur: 24, scalePeak: 1.06, shapeShift: "46%", morphDuration: 15, morphDelay: 0 },
            { top: -8, left: 70, width: 140, height: 66, opacity: 0.12, blur: 28, scalePeak: 1.08, shapeShift: "42%", morphDuration: 18, morphDelay: 2.5 },
            { top: 12, left: 170, width: 95, height: 46, opacity: 0.08, blur: 22, scalePeak: 1.05, shapeShift: "48%", morphDuration: 12, morphDelay: 4.5 },
          ]}
        />
      </motion.div>

      {/* Cloud 4 - Near Layer (parallax) */}
      <motion.div
        className="absolute top-20 left-[-310px] w-[430px] h-32"
        animate={{
          x: [0, 1900],
          rotate: [0, -1.4, 0, 1.4, 0],
          filter: ["brightness(1)", "brightness(1.18)", "brightness(1)"],
        }}
        transition={{
          x: { duration: 42, repeat: Infinity, ease: "linear" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <CloudShape
          blobs={[
            { top: 10, left: 0, width: 170, height: 84, opacity: 0.24, blur: 18, scalePeak: 1.07, shapeShift: "44%", morphDuration: 13, morphDelay: 0 },
            { top: -12, left: 110, width: 210, height: 100, opacity: 0.28, blur: 20, scalePeak: 1.09, shapeShift: "40%", morphDuration: 16, morphDelay: 1.8 },
            { top: 20, left: 250, width: 150, height: 72, opacity: 0.2, blur: 16, scalePeak: 1.06, shapeShift: "48%", morphDuration: 11, morphDelay: 3.2 },
            { top: 4, left: 340, width: 120, height: 58, opacity: 0.18, blur: 15, scalePeak: 1.05, shapeShift: "46%", morphDuration: 14, morphDelay: 2.4 },
          ]}
        />
      </motion.div>
    </>
  );
}
