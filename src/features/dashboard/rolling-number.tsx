"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Odometer-style value: every digit is a 0–9 column that rolls to its place.
// Assistive tech reads the formatted value once; MotionConfig skips the
// transform when the user prefers reduced motion.
export function RollingNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const characters = Array.from(value);
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {characters.map((character, index) => {
          // Keyed from the right so units keep their column when the value
          // gains digits, and a changed value rolls from the previous digit.
          const key = characters.length - index;
          if (!/\d/.test(character))
            return (
              <span key={key} className="whitespace-pre">
                {character}
              </span>
            );
          return (
            <span key={key} className="inline-block h-[1.15em] overflow-hidden">
              <motion.span
                className="flex flex-col"
                initial={{ y: "0em" }}
                animate={{ y: `${-Number(character) * 1.15}em` }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.04,
                }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit} className="block h-[1.15em] leading-[1.15]">
                    {digit}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
