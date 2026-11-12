import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
} from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/utils/lib";

const TooltipArrow = RadixTooltip.Arrow;

const Tooltip = ({
  children,
  ...props
}: { children: ReactNode } & RadixTooltip.TooltipProps) => (
  <RadixTooltip.Provider>
    <RadixTooltip.Root delayDuration={150} {...props}>
      {children}
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

// const TooltipTrigger = RadixTooltip.Trigger;
const TooltipTrigger = forwardRef<
  React.ElementRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixTooltip.Trigger
    ref={ref}
    className={cn(!!className && className)}
    {...props}
  >
    {children}
  </RadixTooltip.Trigger>
));
TooltipTrigger.displayName = RadixTooltip.Trigger.displayName;

const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ children, ...props }, ref) => {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
        className="z-50 w-auto origin-[--radix-tooltip-content-transform-origin]"
        {...props}
      >
        {children}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
});
TooltipContent.displayName = RadixTooltip.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow };
