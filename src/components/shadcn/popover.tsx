import * as RadixPopover from "@radix-ui/react-popover";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import { cn } from "@/utils/lib";

const Popover = RadixPopover.Root;
const PopoverAnchor = RadixPopover.Anchor;
const PopoverCloseButton = RadixPopover.Close;

const PopoverTrigger = forwardRef<
  ElementRef<typeof RadixPopover.Trigger>,
  ComponentPropsWithoutRef<typeof RadixPopover.Trigger>
>(({ children, ...props }, ref) => {
  return (
    <RadixPopover.Trigger
      ref={ref}
      className={cn(!!props.className ? props.className : "w-fit")}
      {...props}
    >
      {children}
    </RadixPopover.Trigger>
  );
});
PopoverTrigger.displayName = RadixPopover.Trigger.displayName;

const PopoverContent = forwardRef<
  ElementRef<typeof RadixPopover.Content>,
  ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ children, className, ...props }, ref) => {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        className={cn(
          // "z-50 w-screen max-w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]",
          "z-50 min-w-[var(--radix-popover-trigger-width)]",
          !!className && className,
        )}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
});
PopoverContent.displayName = RadixPopover.Content.displayName;

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
};
