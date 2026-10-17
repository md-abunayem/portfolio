"use client";

import Image from "next/image";
import {
  Atom,
  Braces,
  Database,
  PanelsTopLeft,
  Server,
} from "lucide-react";
import type { CSSProperties, PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const orbitBadges = [
  { label: "React", icon: Atom, angle: 0 },
  { label: "Node.js", icon: Server, angle: 72 },
  { label: "MongoDB", icon: Database, angle: 144 },
  { label: "Next.js", icon: PanelsTopLeft, angle: 216 },
  { label: "TypeScript", icon: Braces, angle: 288 },
];

export function OrbitProfile({
  imageUrl,
  name,
}: {
  imageUrl: string | null | undefined;
  name: string;
}) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { damping: 22, stiffness: 100, mass: 0.6 });
  const springY = useSpring(pointerY, { damping: 22, stiffness: 100, mass: 0.6 });
  const photoX = useTransform(springX, (value) => value * 0.55);
  const photoY = useTransform(springY, (value) => value * 0.55);
  const ringX = useTransform(springX, (value) => value * -0.45);
  const ringY = useTransform(springY, (value) => value * -0.45);
  const chipX = useTransform(springX, (value) => value * 0.85);
  const chipY = useTransform(springY, (value) => value * 0.85);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      reducedMotion ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 24);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 24);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      className="orbit-profile"
      onPointerLeave={resetPointer}
      onPointerMove={handlePointerMove}
      whileHover={reducedMotion ? undefined : { scale: 1.015 }}
    >
      <div aria-hidden="true" className="orbit-profile__glow" />
      <motion.div
        aria-hidden="true"
        className="orbit-profile__ring-layer orbit-profile__ring-layer--outer"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ x: ringX, y: ringY }}
        transition={{ duration: reducedMotion ? 0.2 : 0.9, ease: "easeOut" }}
      >
        <svg className="orbit-profile__outer-ring" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            pathLength="1"
            stroke="currentColor"
            strokeDasharray="0.012 0.018"
            strokeWidth="0.6"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: reducedMotion ? 0.2 : 1.2, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="orbit-profile__ring-layer orbit-profile__ring-layer--inner"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ x: ringX, y: ringY }}
        transition={{ delay: reducedMotion ? 0 : 0.2, duration: reducedMotion ? 0.2 : 0.9 }}
      >
        <svg className="orbit-profile__inner-ring" viewBox="0 0 100 100">
          <motion.circle
            className="orbit-profile__inner-path"
            cx="50"
            cy="50"
            r="37"
            fill="none"
            pathLength="1"
            stroke="currentColor"
            strokeWidth="0.55"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ delay: reducedMotion ? 0 : 0.2, duration: reducedMotion ? 0.2 : 1.2 }}
          />
          <motion.circle
            className="orbit-profile__comet"
            cx="50"
            cy="50"
            r="37"
            fill="none"
            pathLength="1"
            stroke="currentColor"
            strokeDasharray="0.025 0.975"
            strokeLinecap="round"
            strokeWidth="1.5"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.4, duration: reducedMotion ? 0.2 : 1 }}
          />
        </svg>
      </motion.div>

      <motion.div
        aria-label="Technology stack"
        className="orbit-profile__badge-orbit-layer"
        role="list"
        style={{ x: ringX, y: ringY }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 2.1, duration: 0.5 }}
      >
        <div className="orbit-profile__badge-orbit">
          {orbitBadges.map((badge, index) => {
            const Icon = badge.icon;
            const positionStyle = {
              "--orbit-angle": `${badge.angle}deg`,
            } as CSSProperties;

            return (
              <div
                className="orbit-profile__badge-position"
                key={badge.label}
                role="listitem"
                style={positionStyle}
              >
                <div className="orbit-profile__badge-anchor">
                  <motion.div
                    aria-label={badge.label}
                    className="orbit-profile__badge"
                    role="img"
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, rotate: -badge.angle, scale: 0.55 }
                    }
                    animate={
                      reducedMotion
                        ? { opacity: 1, rotate: 0, scale: 1 }
                        : {
                            opacity: 1,
                            rotate: [-badge.angle, -(badge.angle + 360)],
                            scale: 1,
                          }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0.2 }
                        : {
                            opacity: { delay: 2.2 + index * 0.12, duration: 0.35 },
                            rotate: { duration: 50, ease: "linear", repeat: Infinity },
                            scale: { delay: 2.2 + index * 0.12, duration: 0.4 },
                          }
                    }
                    title={badge.label}
                    whileHover={reducedMotion ? undefined : { scale: 1.1 }}
                  >
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="orbit-profile__photo-anchor">
        <motion.div
          className="orbit-profile__photo-frame"
          style={{ x: photoX, y: photoY }}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: reducedMotion ? 0 : 1.45,
            duration: reducedMotion ? 0.2 : 0.7,
            ease: "easeOut",
          }}
        >
          {imageUrl ? (
            <Image
              alt={`Portrait of ${name}`}
              className="orbit-profile__photo"
              fill
              priority
              sizes="(max-width: 680px) 280px, (max-width: 900px) 340px, 440px"
              src={imageUrl}
            />
          ) : (
            <span aria-label={name} className="orbit-profile__initials" role="img">
              {name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
          )}
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        className="orbit-profile__chip-anchor orbit-profile__chip-anchor--top"
        style={{ x: chipX, y: chipY }}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reducedMotion ? 0 : 2.9, duration: reducedMotion ? 0.2 : 0.45 }}
      >
        <span className="orbit-profile__chip orbit-profile__chip--top">FULL-STACK</span>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="orbit-profile__chip-anchor orbit-profile__chip-anchor--bottom"
        style={{ x: chipX, y: chipY }}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reducedMotion ? 0 : 3.05, duration: reducedMotion ? 0.2 : 0.45 }}
      >
        <span className="orbit-profile__chip orbit-profile__chip--bottom">CSE · DIU</span>
      </motion.div>

      <span aria-hidden="true" className="orbit-profile__spark orbit-profile__spark--one">✳</span>
      <span aria-hidden="true" className="orbit-profile__spark orbit-profile__spark--two">✳</span>
    </motion.div>
  );
}
