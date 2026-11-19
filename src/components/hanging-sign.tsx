"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

const signTones = {
  default: "bg-primary text-neutral",
  error: "bg-error text-error-content",
} as const;

// Shop-door sign for empty and error states. It swings once when it mounts;
// the MotionConfig in NavigationViewport skips the rotation for reduced
// motion. The text beside it carries the message, so the sign is decorative.
export function HangingSign({
  label,
  tone = "default",
}: {
  label: string;
  tone?: keyof typeof signTones;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="flex origin-top flex-col items-center"
      initial={{ rotate: -10 }}
      animate={{ rotate: -1 }}
      transition={{ type: "spring", stiffness: 140, damping: 7 }}
    >
      <svg
        width="144"
        height="32"
        viewBox="0 0 144 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="text-neutral"
      >
        <path d="M72 5 16 31" />
        <path d="M72 5 128 31" />
        <circle cx="72" cy="5" r="4" fill="currentColor" />
      </svg>
      <span
        className={cn(
          "border-neutral -mt-0.5 flex min-w-36 justify-center rounded-xl border-2 px-4 py-2.5 text-xl font-extrabold tracking-tight whitespace-nowrap shadow-lg",
          signTones[tone],
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}
