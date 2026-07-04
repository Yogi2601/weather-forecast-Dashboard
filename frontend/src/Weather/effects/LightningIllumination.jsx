import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// This is the LIGHT a lightning strike casts through the atmosphere, not the
// bolt itself — no jagged shape, no flat white overlay. A flash is built
// from several large, soft radial gradients anchored at a random origin,
// staged so the illumination reads as passing through the sky in order:
// clouds catch it first (brightest, tightest to the origin), then the mist
// layer glows softly, then the rain volume gets the faintest, widest wash,
// and everything fades together. Every flash has its own random origin,
// intensity, and duration so no two flashes look alike.

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomOrigin() {
  // Origins bias toward the upper portion of the scene, where storm clouds
  // sit, but vary in both x and y so flashes don't all come from one spot.
  return {
    x: randomBetween(10, 90),
    y: randomBetween(-10, 45),
  };
}

function FlashBurst({ origin, intensity }) {
  // intensity in [0.6, 1] scales how strong this particular flash is —
  // some flashes are a distant flicker, others a near, bright strike.
  const cloudPeak = 0.5 * intensity;
  const mistPeak = 0.3 * intensity;
  const rainPeak = 0.16 * intensity;

  return (
    <>
      {/* Stage 1: clouds catch the light first — brightest, tightest to the
          flash origin, very short-lived. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${origin.x}% ${origin.y}%, rgba(226,232,240,${cloudPeak}) 0%, rgba(203,213,225,${cloudPeak * 0.5}) 35%, transparent 65%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4, 0.75, 0] }}
        transition={{ duration: 0.5, times: [0, 0.08, 0.22, 0.32, 1], ease: "easeOut" }}
      />

      {/* Stage 2: the mist volume glows next — softer, wider, slightly
          delayed so the light visibly travels outward through the
          atmosphere rather than appearing everywhere at once. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 65% at ${origin.x}% ${origin.y + 15}%, rgba(203,213,225,${mistPeak}) 0%, rgba(148,163,184,${mistPeak * 0.45}) 45%, transparent 75%)`,
          filter: "blur(6px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0.35, 0.55, 0] }}
        transition={{ duration: 0.62, times: [0, 0.1, 0.22, 0.4, 0.5, 1], ease: "easeOut" }}
      />

      {/* Stage 3: the rain volume gets the faintest, widest wash last —
          the light has now diffused through the whole depth of the scene. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 100% 85% at ${origin.x}% ${origin.y + 30}%, rgba(148,163,184,${rainPeak}) 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 1, 0.3, 0] }}
        transition={{ duration: 0.75, times: [0, 0.16, 0.3, 0.42, 0.6, 1], ease: "easeOut" }}
      />
    </>
  );
}

export default function LightningIllumination() {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    let timeoutId;

    const scheduleFlash = () => {
      const nextDelay = randomBetween(3000, 8500);

      timeoutId = setTimeout(() => {
        const origin = randomOrigin();
        const intensity = randomBetween(0.6, 1);
        const isDouble = Math.random() < 0.3;

        setFlash({ id: Date.now(), origin, intensity });

        const clearAfter = randomBetween(750, 950);

        if (isDouble) {
          const secondDelay = randomBetween(120, 260);
          setTimeout(() => {
            setFlash({
              id: Date.now() + 1,
              origin: randomOrigin(),
              intensity: randomBetween(0.5, 0.85),
            });
            setTimeout(() => setFlash(null), randomBetween(650, 850));
          }, secondDelay);
        } else {
          setTimeout(() => setFlash(null), clearAfter);
        }

        scheduleFlash();
      }, nextDelay);
    };

    scheduleFlash();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {flash && <FlashBurst key={flash.id} origin={flash.origin} intensity={flash.intensity} />}
      </AnimatePresence>
    </div>
  );
}
