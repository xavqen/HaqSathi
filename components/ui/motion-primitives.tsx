"use client";

import Link from "next/link";
import * as React from "react";
import {
  motion,
  type HTMLMotionProps,
  AnimatePresence,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export const premiumEase = [0.16, 1, 0.3, 1] as const;

const AnimatedLink = motion.create(Link as unknown as React.ComponentType<any>);

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
  const reduceMotion = usePrefersReducedMotion();
  const hoverState =
    reduceMotion || hover === "none"
      ? undefined
      : hover === "glow"
        ? { y: -2, scale: 1.01 }
        : { y: -3 };

  return (
    <AnimatedLink
      suppressHydrationWarning
      className={cn("motion-safe-transform motion-premium-fade", className)}
      initial={reveal && !reduceMotion ? { opacity: 0, y: 14 } : false}
      animate={reveal && reduceMotion ? { opacity: 1, y: 0 } : undefined}
      whileInView={reveal && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={reveal ? { once: true, margin: "-8% 0px" } : undefined}
      whileHover={hoverState}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.34, ease: premiumEase, delay: reduceMotion ? 0 : delay }}
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
  const reduceMotion = usePrefersReducedMotion();

  function handlePointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (!reduceMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLAnchorElement>) {
    if (!reduceMotion) {
      event.currentTarget.style.removeProperty("--mouse-x");
      event.currentTarget.style.removeProperty("--mouse-y");
    }
    onPointerLeave?.(event);
  }

  const hoverState =
    reduceMotion || hover === "none"
      ? undefined
      : hover === "glow"
        ? { y: -3, scale: 1.006 }
        : { y: -3 };

  return (
    <AnimatedLink
      suppressHydrationWarning
      className={cn("motion-spotlight motion-safe-transform motion-premium-fade", spotlightClassName, className)}
      initial={reveal && !reduceMotion ? { opacity: 0, y: 14 } : false}
      animate={reveal && reduceMotion ? { opacity: 1, y: 0 } : undefined}
      whileInView={reveal && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={reveal ? { once: true, margin: "-8% 0px" } : undefined}
      whileHover={hoverState}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.34, ease: premiumEase, delay: reduceMotion ? 0 : delay }}
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
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.div
      suppressHydrationWarning
      className={cn("motion-safe-transform", className)}
      initial={reduceMotion ? false : { opacity: 0, y }}
      animate={reduceMotion ? { opacity: 1, y: 0 } : undefined}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: premiumEase, delay: reduceMotion ? 0 : delay }}
      {...props}
    />
  );
}

export function MotionSurface({
  className,
  hover = true,
  ...props
}: HTMLMotionProps<"div"> & { hover?: boolean }) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.div
      suppressHydrationWarning
      className={cn("motion-safe-transform motion-premium-fade", className)}
      whileHover={!hover || reduceMotion ? undefined : { y: -4, scale: 1.005 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
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
  const reduceMotion = usePrefersReducedMotion();

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!reduceMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    if (!reduceMotion) {
      event.currentTarget.style.removeProperty("--mouse-x");
      event.currentTarget.style.removeProperty("--mouse-y");
    }
    onPointerLeave?.(event);
  }

  return (
    <motion.div
      suppressHydrationWarning
      className={cn("motion-spotlight motion-safe-transform motion-premium-fade", className)}
      whileHover={!hover || reduceMotion ? undefined : { y: -4, scale: 1.005 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
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
  const reduceMotion = usePrefersReducedMotion();
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          suppressHydrationWarning
          className={cn("motion-safe-transform", className)}
          initial={reduceMotion ? false : { opacity: 0, y, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y, scale: 0.98 }}
          transition={{ duration: 0.26, ease: premiumEase }}
        >
          {children}
        </motion.div>
      ) : null}
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
  const reduceMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(value);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduceMotion || hasAnimated || !ref.current) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasAnimated(true);
        setDisplayValue(0);
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
  }, [duration, hasAnimated, reduceMotion, value]);

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
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.div
      suppressHydrationWarning
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? "show" : undefined}
      whileInView={reduceMotion ? undefined : "show"}
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
      suppressHydrationWarning
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
