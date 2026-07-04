import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeatherTheme } from "./WeatherConditionMapper";
import Clouds from "./effects/Clouds";
import SunGlow from "./effects/SunGlow";
import OvercastSky from "./effects/OvercastSky";
import SnowSky from "./effects/SnowSky";
import RainSky from "./effects/RainSky";
import RainParticles from "./effects/RainParticles";
import SnowParticles from "./effects/SnowParticles";
import RainMist from "./effects/RainMist";
import StormAtmosphere from "./effects/StormAtmosphere";
import LightningIllumination from "./effects/LightningIllumination";
import FogLayer from "./effects/FogLayer";

const NIGHT_STARS = [
  { top: "12%", left: "10%", size: 1.5, baseOpacity: 0.35, duration: 4.2, delay: 0 },
  { top: "20%", left: "25%", size: 1, baseOpacity: 0.25, duration: 5.6, delay: 1.1 },
  { top: "8%", left: "40%", size: 2, baseOpacity: 0.45, duration: 3.4, delay: 2.3 },
  { top: "30%", left: "15%", size: 1, baseOpacity: 0.2, duration: 6.2, delay: 0.6 },
  { top: "18%", left: "55%", size: 1.5, baseOpacity: 0.3, duration: 4.8, delay: 3.1 },
  { top: "38%", left: "35%", size: 1, baseOpacity: 0.22, duration: 5.1, delay: 1.8 },
  { top: "10%", left: "70%", size: 1.5, baseOpacity: 0.32, duration: 4.5, delay: 2.7 },
  { top: "45%", left: "60%", size: 1, baseOpacity: 0.2, duration: 5.9, delay: 0.3 },
  { top: "25%", left: "85%", size: 1.5, baseOpacity: 0.38, duration: 3.9, delay: 3.6 },
  { top: "50%", left: "20%", size: 1, baseOpacity: 0.24, duration: 5.4, delay: 1.4 },
  { top: "6%", left: "90%", size: 1, baseOpacity: 0.28, duration: 4.7, delay: 2.1 },
  { top: "42%", left: "8%", size: 1.5, baseOpacity: 0.3, duration: 5.2, delay: 0.9 },
  { top: "15%", left: "48%", size: 1, baseOpacity: 0.2, duration: 6.5, delay: 3.9 },
  { top: "33%", left: "78%", size: 1, baseOpacity: 0.26, duration: 4.9, delay: 1.6 },
];

const NIGHT_CLOUDS = [
  { top: "14%", width: 260, height: 60, opacity: 0.22, duration: 130, startX: -300 },
  { top: "34%", width: 320, height: 70, opacity: 0.16, duration: 170, startX: -420 },
  { top: "6%", width: 200, height: 50, opacity: 0.14, duration: 150, startX: -260 },
];

export default function WeatherSceneManager({ weather }) {
  const theme = getWeatherTheme(weather);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none"
      >
        {theme === "clear" && (
          <>
            {/* Base sky: clean natural blue, deeper and more saturated at the top,
                lightening with distance toward the horizon — no warm color mixed in yet */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/75 via-sky-700/40 to-sky-500/18" />

            {/* Sunlight, as part of the sky itself: one radial gradient anchored at the
                sun's position (top-right), so the light appears to originate from and
                blend into the atmosphere rather than sitting on top of it as a separate
                glowing circle. This is the single source of "sun-ness" in the scene —
                SunGlow only adds the small solid disc at its center. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 75% 65% at 82% 18%, rgba(255,214,140,0.35) 0%, rgba(255,196,120,0.18) 22%, rgba(186,196,220,0.08) 45%, transparent 70%)",
              }}
            />

            {/* Atmospheric distance haze: a pale, desaturated veil low on the horizon
                that lightens the blue without introducing a second hue, giving depth */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sky-100/12 to-transparent" />

            {/* Horizon warmth: soft, narrow, sitting only at the very bottom edge, and
                gently pulled toward the sun's side so it reads as light reaching the
                horizon rather than an unrelated color band */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/4"
              style={{
                background:
                  "linear-gradient(to top, rgba(252,191,120,0.16) 0%, rgba(252,191,120,0.05) 55%, transparent 100%)",
              }}
            />

            {/* Depth falloff toward the card edges so content stays readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/55" />

            <SunGlow />
            <Clouds />
          </>
        )}

        {theme === "cloudy" && <OvercastSky />}

        {theme === "rain" && (
          <>
            <RainSky />
            <StormAtmosphere />
            <RainMist />
            <RainParticles intensity="light" />
          </>
        )}

        {theme === "heavy-rain" && (
          <>
            <RainSky heavy />
            <StormAtmosphere />
            <RainMist />
            <RainParticles intensity="heavy" />
          </>
        )}

        {theme === "storm" && (
          <>
            <RainSky heavy />
            <StormAtmosphere />
            <RainMist />
            <LightningIllumination />
            <RainParticles intensity="heavy" />
          </>
        )}

        {theme === "snow" && (
          <>
            <SnowSky />
            <SnowParticles />
          </>
        )}

        {theme === "fog" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-500/20 via-slate-700/35 to-slate-950/80" />
            <FogLayer />
          </>
        )}

        {theme === "night" && (
          <>
            {/* Layered sky for depth instead of one flat gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-blue-950/45 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,41,59,0.35),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(2,6,23,0.4),transparent_55%)]" />

            {/* Twinkling Stars (subtle, staggered, varied) */}
            {NIGHT_STARS.map((star, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute rounded-full bg-slate-100"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                }}
                animate={{
                  opacity: [star.baseOpacity * 0.4, star.baseOpacity, star.baseOpacity * 0.4],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Moon with soft, gradual glow and faint surface texture */}
            <motion.div
              className="absolute top-6 right-10 w-48 h-48 rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 35%, rgba(226,232,240,0.16) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
              animate={{ opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-11 right-16 w-24 h-24 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 38% 32%, rgba(248,250,252,0.95) 0%, rgba(226,232,240,0.85) 55%, rgba(203,213,225,0.6) 100%)",
                boxShadow: "0 0 24px 6px rgba(226,232,240,0.25)",
              }}
              animate={{ opacity: [0.88, 1, 0.88] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="absolute rounded-full bg-slate-400/20"
                style={{ top: "28%", left: "22%", width: 10, height: 10 }}
              />
              <div
                className="absolute rounded-full bg-slate-400/15"
                style={{ top: "55%", left: "55%", width: 14, height: 14 }}
              />
              <div
                className="absolute rounded-full bg-slate-400/15"
                style={{ top: "62%", left: "28%", width: 7, height: 7 }}
              />
            </motion.div>

            {/* Very slow-drifting night clouds that occasionally pass in front of the moon */}
            {NIGHT_CLOUDS.map((cloud, i) => (
              <motion.div
                key={`night-cloud-${i}`}
                className="absolute rounded-full bg-slate-300 blur-3xl"
                style={{
                  top: cloud.top,
                  width: cloud.width,
                  height: cloud.height,
                  opacity: cloud.opacity,
                }}
                initial={{ x: cloud.startX }}
                animate={{ x: cloud.startX + 1600 }}
                transition={{
                  duration: cloud.duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
