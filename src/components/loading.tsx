import { PawPrintIcon } from "lucide-react";
import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

export function LoadingSpinner({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  const isLabelled = Boolean(props["aria-label"]);

  return (
    <svg
      aria-hidden={isLabelled ? undefined : true}
      className={cn("text-primary size-6", className)}
      fill="none"
      role={isLabelled ? "status" : undefined}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <circle cx="12" cy="12" r="9.5" strokeLinecap="round">
          <animate
            attributeName="stroke-dasharray"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
            keyTimes="0;0.475;0.95;1"
            repeatCount="indefinite"
            values="0 150;42 150;42 150;42 150"
          />
          <animate
            attributeName="stroke-dashoffset"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
            keyTimes="0;0.475;0.95;1"
            repeatCount="indefinite"
            values="0;-16;-59;-59"
          />
        </circle>
        <animateTransform
          attributeName="transform"
          dur="2s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        />
      </g>
    </svg>
  );
}

export function RouteProgressBar({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
      role="progressbar"
    >
      <div className="bg-primary animate-route-progress h-full origin-left motion-reduce:animate-none" />
    </div>
  );
}

export function LoadingScreen({
  className,
  label = "Cargando…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-white px-6",
        className,
      )}
      role="status"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3">
          <span className="bg-primary flex size-11 items-center justify-center rounded-xl">
            <PawPrintIcon className="text-primary-content size-6" />
          </span>
          <span className="text-base-content text-2xl font-semibold">
            WoofDesk
          </span>
        </div>
        <LoadingSpinner className="size-9 stroke-[2.5]" />
        <span className="text-base-content/60 text-sm font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}
