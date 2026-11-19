import { PawPrintIcon } from "lucide-react";
import { cn } from "@/lib/cn";

// Decorative grooming details shared by the application shell and the login.
// Callers position the box and set the color; everything stays out of the
// accessibility tree and pointer events.
const pawSteps = [
  "bottom-0 left-0 rotate-12",
  "bottom-10 left-11 rotate-[32deg]",
  "bottom-22 left-6 rotate-12",
  "bottom-32 left-17 rotate-[32deg]",
  "bottom-44 left-12 rotate-12",
  "bottom-54 left-23 rotate-[32deg]",
];

const bubbles = [
  "top-6 right-4 size-24",
  "top-0 right-32 size-10",
  "top-30 right-26 size-6",
  "top-34 right-0 size-9",
  "top-18 right-46 size-4",
];

export function PawTrail({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none h-64 w-32", className)}
    >
      <div className="relative size-full">
        {pawSteps.map((step) => (
          <PawPrintIcon
            key={step}
            fill="currentColor"
            strokeWidth={1}
            className={cn("absolute size-8", step)}
          />
        ))}
      </div>
    </div>
  );
}

export function BubbleCluster({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none h-44 w-56", className)}
    >
      <div className="relative size-full">
        {bubbles.map((bubble) => (
          <span key={bubble} className={cn("bubble absolute", bubble)} />
        ))}
      </div>
    </div>
  );
}
