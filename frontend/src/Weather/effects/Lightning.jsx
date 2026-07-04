import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function randomDelay(min, max) {
  return min + Math.random() * (max - min);
}

export default function Lightning() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timeoutId;

    const scheduleFlash = () => {
      timeoutId = setTimeout(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 120 + Math.random() * 100);
        scheduleFlash();
      }, randomDelay(2500, 7000));
    };

    scheduleFlash();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key="lightning-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0.15, 0.6, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, times: [0, 0.15, 0.35, 0.5, 1] }}
          className="absolute inset-0 bg-white pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
