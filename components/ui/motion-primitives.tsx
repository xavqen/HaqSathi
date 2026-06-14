"use client";

import Link from "next/link";
import * as React from "react";
import {
  motion,
  type HTMLMotionProps,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";

export const premiumEase = [0.16, 1, 0.3, 1] as const;

// ✅ THE FIX
const AnimatedLink = motion.create(Link as any);

type MotionLinkProps = React.ComponentProps<typeof Link> & {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: "lift" | "glow" | "none";
  reveal?: boolean;
};

export function MotionLink({
  children,
  className,
  delay = 0,
  hover = "lift",
  reveal = false,
  ...props
}: MotionLinkProps) {
  const hoverState =
    hover === "none"
      ? undefined
      : hover === "glow"
        ? { y: -2, scale: 1.01 }
        : { y: -3 };

  return (
    <AnimatedLink
      className={cn("motion-safe-transform motion-premium-fade", className)}
      initial={reveal ? { opacity: 0, y: 14 } : undefined}
      whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
      viewport={reveal ? { once: true, margin: "-8% 0px" } : undefined}
      whileHover={hoverState}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.34, ease: premiumEase, delay }}
      {...props}
    >
      {children}
    </AnimatedLink>
  );
}

type SpotlightLinkProps = MotionLinkProps & {
  spotlightClassName?: string;
};

export function SpotlightLink({
  children,
  className,
  spotlightClassName,
  delay = 0,
  hover = "glow",
  reveal = false,
  onPointerMove,
  onPointerLeave,
  ...props
}: SpotlightLinkProps) {
  function handlePointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    onPointerMove?.(event);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.removeProperty("--mouse-x");
    event.currentTarget.style.removeProperty("--mouse-y");
    onPointerLeave?.(event);
  }

  const hoverState =
    hover === "none"
      ? undefined
      : hover === "glow"
        ? { y: -3, scale: 1.006 }
        : { y: -3 };

  return (
    <AnimatedLink
      className={cn("motion-spotlight motion-safe-transform motion-premium-fade", spotlightClassName, className)}
      initial={reveal ? { opacity: 0, y: 14 } : undefined}
      whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
      viewport={reveal ? { once: true, margin: "-8% 0px" } : undefined}
      whileHover={hoverState}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.34, ease: premiumEase, delay }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </AnimatedLink>
  );
}

export function FadeIn({
  className,
  delay = 0,
  y = 18,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      className={cn("motion-safe-transform", className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: premiumEase, delay }}
      {...props}
    />
  );
}

export function MotionSurface({
  className,
  hover = true,
  ...props
}: HTMLMotionProps<"div"> & { hover?: boolean }) {
  return (
    <motion.div
      className={cn("motion-safe-transform motion-premium-fade", className)}
      whileHover={!hover ? undefined : { y: -4, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.34, ease: premiumEase }}
      {...props}
    />
  );
}

export function SpotlightSurface({
  className,
  hover = true,
  onPointerMove,
  onPointerLeave,
  ...props
}: HTMLMotionProps<"div"> & { hover?: boolean }) {
  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    onPointerMove?.(event);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty("--mouse-x");
    event.currentTarget.style.removeProperty("--mouse-y");
    onPointerLeave?.(event);
  }

  return (
    <motion.div
      className={cn("motion-spotlight motion-safe-transform motion-premium-fade", className)}
      whileHover={!hover ? undefined : { y: -4, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.34, ease: premiumEase }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    />
  );
}

export function MotionPresencePanel({
  show,
  children,
  className,
  y = 8,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={cn("motion-safe-transform", className)}
          initial={{ opacity: 0, y, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y, scale: 0.98 }}
          transition={{ duration: 0.26, ease: premiumEase }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MotionNumber({
  value,
  suffix = "",
  className,
  duration = 650,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    // Safely check OS preferences on the client side without triggering React renders
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || hasAnimated || !ref.current) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasAnimated(true);
        const start = performance.now();
        const frame = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 4);
          setDisplayValue(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        observer.disconnect();
      },
      { rootMargin: "-10% 0px", threshold: 0.3 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [duration, hasAnimated, value]);

  return (
    <span ref={ref} className={className}>
      {displayValue}{suffix}
    </span>
  );
}

export function StaggerContainer({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      }}
      {...props}
    />
  );
}

export function StaggerItem({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn("motion-safe-transform", className)}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: premiumEase },
        },
      }}
      {...props}
    />
  );
}