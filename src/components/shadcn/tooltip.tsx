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
        className="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-auto origin-[--radix-tooltip-content-transform-origin]"
        {...props}
      >
        {children}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
});
TooltipContent.displayName = RadixTooltip.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow };
