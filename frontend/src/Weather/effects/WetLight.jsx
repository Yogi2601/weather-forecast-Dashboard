import { motion } from "framer-motion";

// Not a weather effect — a light-diffusion quality applied to the whole
// scene, simulating how humid, moisture-saturated air softly scatters
// ambient light during rainfall. No particles, no shapes, no density
// texture: just two or three enormous, heavily blurred radial gradients
// whose brightness drifts almost imperceptibly slowly. The goal is a felt
// quality of "the air is wet," never a noticeable animation.

const LIGHT_AREAS = [
  {
    top: "-10%",
    left: "10%",
    width: "90%",
    height: "70%",
    color: "148,163,184",
    peak: 0.05,
    base: 0.03,
    duration: 42,
  },
  {
    top: "20%",
    left: "-15%",
    width: "80%",
    height: "65%",
    color: "100,116,139",
    peak: 0.045,
    base: 0.025,
    duration: 55,
  },
  {
    top: "10%",
    left: "35%",
    width: "75%",
    height: "60%",
    color: "203,213,225",
    peak: 0.04,
    base: 0.02,
    duration: 48,
  },
];

export default function WetLight() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {LIGHT_AREAS.map((area, i) => (
        <motion.div
          key={`wetlight-${i}`}
          className="absolute rounded-full"
          style={{
            top: area.top,
            left: area.left,
            width: area.width,
            height: area.height,
            filter: "blur(90px)",
            background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(${area.color},${area.peak}) 0%, rgba(${area.color},${area.base}) 45%, transparent 75%)`,
          }}
          animate={{
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: area.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 6,
          }}
        />
      ))}
    </div>
  );
}
