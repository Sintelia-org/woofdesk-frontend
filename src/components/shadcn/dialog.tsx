import { cn } from "@/utils/lib";
import * as RadixDialog from "@radix-ui/react-dialog";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import { XIcon } from "lucide-react";
import { WithClassName, type WithChildren } from "@/utils/types";

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

const DialogContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
    showXButton: boolean;
    type?: "default" | "danger" | "info" | "success" | "warning";
  }
>(({ children, showXButton, type = "default", className, ...props }, ref) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-30 bg-black/60 focus-visible:outline-none" />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          !!className && className,
          "fixed top-1/2 right-0 left-0 z-30 mx-auto flex w-full max-w-2xl translate-y-[-50%] justify-center px-4 tracking-wide focus:outline-none focus-visible:outline-none",
        )}
        {...props}
      >
        <div
          className={cn(
            borderColor[type],
            "bg-base-300 relative container flex flex-col rounded-md border-[1px] p-6 shadow-lg",
          )}
        >
          {children}

          <RadixDialog.Close
            className={cn(
              showXButton
                ? "scale-100 opacity-70 transition-all"
                : "pointer-events-none scale-150 opacity-0",
              "text-primary absolute top-4 right-4 cursor-pointer rounded-sm hover:opacity-100",
            )}
          >
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </RadixDialog.Close>
        </div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
DialogContent.displayName = RadixDialog.Content.displayName;

const DialogHeader = ({
  children,
  className,
}: WithChildren & WithClassName) => {
  return (
    <div
      className={cn(
        !!className && className,
        "mb-4 flex flex-col gap-2 text-center sm:text-left",
      )}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className }: WithChildren & WithClassName) => {
  return (
    <RadixDialog.Title
      className={cn(!!className && className, "text-2xl font-bold")}
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
      className={cn(!!className && className, "text-base-content/70 text-base")}
    >
      {children}
    </RadixDialog.Description>
  );
};

const DialogFooter = ({
  children,
  className,
}: WithChildren & WithClassName) => {
  return (
    <div
      className={cn(
        !!className && className,
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
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
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
};
