"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type Ref,
} from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WithChildren, WithClassName } from "@/lib/types";

export type DialogTypes = keyof typeof borderColor;
const borderColor = {
  default: "border-secondary/40",
  danger: "border-error",
  info: "border-info",
  success: "border-success",
  warning: "border-warning",
};

const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;

const DialogCloseButton = RadixDialog.Close;

type DialogContentProps = ComponentPropsWithoutRef<
  typeof RadixDialog.Content
> & {
  contentClassName?: string;
  locked?: boolean;
  ref?: Ref<ElementRef<typeof RadixDialog.Content>>;
  showXButton?: boolean;
  type?: DialogTypes;
};

function DialogContent({
  children,
  className,
  contentClassName,
  locked = false,
  ref,
  showXButton = false,
  type = "default",
  ...props
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] focus-visible:outline-none" />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 top-1/2 z-50 mx-auto flex w-full max-w-2xl -translate-y-1/2 justify-center px-4 tracking-wide focus:outline-none focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        <div
          data-slot="dialog-panel"
          className={cn(
            borderColor[type],
            "bg-base-100 relative flex max-h-[calc(100dvh-2rem)] min-h-0 w-full flex-col overflow-hidden rounded-2xl border shadow-2xl",
            contentClassName,
          )}
        >
          {children}

          {showXButton && !locked ? (
            <RadixDialog.Close className="text-base-content/55 hover:bg-base-200 hover:text-base-content absolute top-4 right-4 flex size-9 cursor-pointer items-center justify-center rounded-sm">
              <XIcon className="size-5" />
              <span className="sr-only">Cerrar</span>
            </RadixDialog.Close>
          ) : null}
        </div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

const DialogHeader = ({
  children,
  className,
}: WithChildren & WithClassName) => {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "border-secondary/25 flex shrink-0 flex-col gap-2 px-6 py-5 text-center sm:px-7 sm:text-left",
        className,
      )}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className }: WithChildren & WithClassName) => {
  return (
    <RadixDialog.Title
      className={cn("text-base-content pr-8 text-2xl font-bold", className)}
    >
      {children}
    </RadixDialog.Title>
  );
};

const DialogDescription = ({
  children,
  className,
}: WithChildren & WithClassName) => {
  return (
    <RadixDialog.Description
      className={cn("text-base-content/65 text-sm", className)}
    >
      {children}
    </RadixDialog.Description>
  );
};

const DialogBody = ({ children, className }: WithChildren & WithClassName) => (
  <div
    data-slot="dialog-body"
    className={cn(
      "min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7",
      className,
    )}
  >
    {children}
  </div>
);

const DialogFooter = ({
  children,
  className,
}: WithChildren & WithClassName) => {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "border-secondary/25 w-full shrink-0 border-t px-6 py-4 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
};
