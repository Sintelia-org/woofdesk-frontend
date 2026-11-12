"use client";

import type { ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

import { ErrorAlert, LoadableButton } from "@/components/forms";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  type DialogTypes,
} from "@/components/shadcn/dialog";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

export type ModalProps = {
  children: ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  contentClassName?: string;
  description?: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  locked?: boolean;
  onClose?: () => void;
  title: ReactNode;
  type?: DialogTypes;
};

export function Modal({
  children,
  className,
  closeOnOutsideClick = true,
  contentClassName,
  description,
  footer,
  isOpen,
  locked = false,
  onClose,
  title,
  type,
}: ModalProps) {
  return (
    <Dialog
      modal
      onOpenChange={(open) => {
        if (!open && !locked) onClose?.();
      }}
      open={isOpen}
    >
      <DialogContent
        className={className}
        contentClassName={contentClassName}
        locked={locked}
        onEscapeKeyDown={(event) => {
          if (locked) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (locked || !closeOnOutsideClick) event.preventDefault();
        }}
        showXButton={Boolean(onClose)}
        type={type}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({
  contentClassName,
  type = "danger",
  ...props
}: ModalProps) {
  return (
    <Modal
      {...props}
      contentClassName={cn("text-center", contentClassName)}
      type={type}
    />
  );
}

const buttonClasses = {
  danger: "btn-error text-error-content",
  default: "btn-primary",
  info: "btn-info text-info-content",
  success: "btn-success text-success-content",
  warning: "btn-warning text-warning-content",
} satisfies Record<DialogTypes, string>;

type AlertWithMutationModalProps<T> = {
  buttonText: string;
  children?: ReactNode;
  className?: string;
  data: T;
  description: ReactNode;
  disabled?: boolean;
  isOpen: boolean;
  mutation: UseMutationResult<unknown, ServerError, T, unknown>;
  onClose: () => void;
  title: string;
  type?: DialogTypes;
};

export function AlertWithMutationModal<T>({
  buttonText,
  children,
  className,
  data,
  description,
  disabled,
  isOpen,
  mutation,
  onClose,
  title,
  type = "danger",
}: AlertWithMutationModalProps<T>) {
  function handleClose() {
    mutation.reset();
    onClose();
  }

  return (
    <DeleteModal
      className={className}
      description={description}
      isOpen={isOpen}
      locked={mutation.isPending}
      onClose={handleClose}
      title={title}
      type={type}
      footer={
        <div className="mx-auto grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            className="btn btn-outline btn-sm"
            disabled={mutation.isPending}
            onClick={handleClose}
            type="button"
          >
            Cancelar
          </button>

          <LoadableButton
            className={cn("btn-sm", buttonClasses[type])}
            disabled={disabled}
            isPending={mutation.isPending}
            onClick={() => mutation.mutate(data)}
            type="button"
          >
            {buttonText}
          </LoadableButton>
        </div>
      }
    >
      {children ? (
        <div className="text-base-content/70 -mt-2 mb-3 w-full text-center text-sm">
          {children}
        </div>
      ) : null}

      <ErrorAlert
        className="mb-3 text-left"
        message={
          mutation.isError
            ? getErrorMessage(mutation.error, "No se pudo completar la acción.")
            : undefined
        }
        onClick={mutation.reset}
      />
    </DeleteModal>
  );
}
