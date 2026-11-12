"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLProps,
  type InputHTMLAttributes,
  type MouseEventHandler,
} from "react";
import {
  useController,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";

import { LoadingSpinner } from "@/components/loading";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { cn } from "@/lib/cn";
import type { WithChildren, WithClassName } from "@/lib/types";

export function MandatoryMark({ className }: WithClassName) {
  return (
    <span aria-hidden="true" className={cn("text-error", className)}>
      *
    </span>
  );
}

const attentionStyles = {
  error: "text-error",
  info: "text-info",
  pending: "text-base-content/60",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
} as const;

type AttentionType = keyof typeof attentionStyles;

export function AttentionLabel({
  className,
  iconClassName,
  message,
  showIcon = false,
  type = "error",
}: {
  className?: string;
  iconClassName?: string;
  message?: string;
  showIcon?: boolean;
  type?: AttentionType;
}) {
  if (!message) return null;

  const Icon =
    type === "success"
      ? CheckCircle2Icon
      : type === "pending"
        ? LoaderCircleIcon
        : AlertCircleIcon;

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 text-sm",
        attentionStyles[type],
        className,
      )}
    >
      {showIcon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "mt-0.5 size-4 min-w-4",
            type === "pending" && "animate-spin",
            iconClassName,
          )}
        />
      ) : null}
      <span>{message}</span>
    </div>
  );
}

type ErrorLabelColor = "error" | "primary" | "secondary" | "warn";

export function ErrorLabel({
  className,
  color = "error",
  message,
  showIcon = false,
}: WithClassName & {
  color?: ErrorLabelColor;
  message?: string;
  showIcon?: boolean;
}) {
  return (
    <AttentionLabel
      className={className}
      message={message}
      showIcon={showIcon}
      type={color === "warn" ? "warning" : color}
    />
  );
}

export function ErrorAlert({
  className,
  message,
  onClick,
}: {
  className?: string;
  message?: string;
  onClick?: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "border-error/25 bg-error/10 text-error flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2",
        className,
      )}
      role="alert"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AlertCircleIcon aria-hidden="true" className="size-5 min-w-5" />
        <span className="text-sm">{message}</span>
      </div>
      {onClick ? (
        <button
          aria-label="Cerrar mensaje de error"
          className="hover:bg-error/10 cursor-pointer rounded-sm p-1"
          onClick={onClick}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export function SuccessAlert({
  className,
  message,
  onClick,
  showCheck = false,
  showRedirect = false,
}: {
  className?: string;
  message: string;
  onClick?: () => void;
  showCheck?: boolean;
  showRedirect?: boolean;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-4", className)}
      role="status"
    >
      {showCheck ? (
        <CheckCircle2Icon className="text-success size-20 min-w-20" />
      ) : null}
      <div className="text-success flex items-center justify-center gap-2.5 text-center text-balance">
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {showRedirect ? (
          <>
            <span className="hidden text-xs sm:inline">Redirigiendo…</span>
            <LoadingSpinner className="size-4" />
          </>
        ) : null}
        {onClick ? (
          <button
            aria-label="Cerrar mensaje"
            className="hover:bg-success/10 cursor-pointer rounded-sm p-1"
            onClick={onClick}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

type Animation = keyof typeof animations;
const animations = {
  ball: "loading-ball",
  bars: "loading-bars",
  dots: "loading-dots",
  infinity: "loading-infinity",
  ring: "loading-ring",
  spinner: "loading-spinner",
};

export function LoadableButton({
  animation = "spinner",
  children,
  className,
  disabled,
  isPending,
  onClick,
  type = "button",
  ...props
}: {
  animation?: Animation;
  isPending: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & WithChildren &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      {...props}
      aria-busy={isPending}
      className={cn("btn", isPending && "cursor-wait", className)}
      disabled={disabled || isPending}
      onClick={onClick}
      type={isPending ? "button" : type}
    >
      {isPending ? (
        <span className={cn("loading size-5", animations[animation])} />
      ) : (
        children
      )}
    </button>
  );
}

export function CopyButton({
  className,
  onCopy,
  Svg = ClipboardIcon,
  textToCopy,
  tooltipText = "Copiar",
}: {
  onCopy?: () => void;
  Svg?: LucideIcon;
  textToCopy: string;
  tooltipText?: string;
} & WithClassName) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!hasCopied) return;

    const timeout = window.setTimeout(() => setHasCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [hasCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      onCopy?.();
    } catch {
      setHasCopied(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={hasCopied ? "Copiado" : tooltipText}
        className={className}
        disabled={hasCopied}
        onClick={copy}
        type="button"
      >
        {hasCopied ? <CheckIcon /> : <Svg />}
      </TooltipTrigger>
      <TooltipContent
        className="bg-base-100 border-secondary/50 text-base-content z-50 rounded-md border px-2.5 py-1 text-xs shadow-sm"
        side="top"
        sideOffset={5}
      >
        <TooltipArrow className="fill-secondary/50" />
        {hasCopied ? "Copiado" : tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

export function IndeterminateCheckbox({
  className,
  indeterminate,
  ...props
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !props.checked);
    }
  }, [indeterminate, props.checked]);

  return (
    <input
      {...props}
      className={cn("checkbox checkbox-sm", className)}
      ref={ref}
      type="checkbox"
    />
  );
}

export function FormInputSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-2">
      <div className="bg-secondary/20 h-4 w-28 rounded-full" />
      <div className="bg-secondary/20 h-11 w-full rounded-lg" />
    </div>
  );
}

interface ViewablePasswordControllerProps<
  T extends FieldValues,
  TName extends FieldPathByValue<T, string> = FieldPathByValue<T, string>,
> {
  className?: string;
  control: Control<T>;
  disabled?: boolean;
  id?: string;
  name: TName;
  placeholder?: string;
}

export function ViewablePasswordInput<T extends FieldValues>(
  props: ViewablePasswordControllerProps<T>,
) {
  const [showPassword, setShowPassword] = useState(false);
  const { field } = useController(props);

  return (
    <div className="relative w-full">
      <input
        aria-label={props.placeholder ?? "Contraseña"}
        className={cn("input w-full pr-12", props.className)}
        disabled={props.disabled}
        id={props.id}
        onBlur={field.onBlur}
        onChange={field.onChange}
        placeholder={props.placeholder}
        ref={field.ref}
        type={showPassword ? "text" : "password"}
        value={field.value}
      />
      <Tooltip>
        <TooltipTrigger
          aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          className="text-base-content/55 hover:text-base-content absolute inset-y-0 right-3 flex cursor-pointer items-center"
          onClick={() => setShowPassword((visible) => !visible)}
          type="button"
        >
          {showPassword ? (
            <EyeIcon className="size-5" />
          ) : (
            <EyeOffIcon className="size-5" />
          )}
        </TooltipTrigger>
        <TooltipContent
          className="bg-base-100 border-secondary/50 text-base-content rounded-md border px-2.5 py-1 text-xs shadow-sm"
          side="top"
          sideOffset={8}
        >
          <TooltipArrow className="fill-secondary/50" />
          {showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const passwordChecks = [
  { name: "8 caracteres", regex: /^.{8,}$/ },
  { name: "Al menos 1 minúscula", regex: /[a-z]/ },
  { name: "Al menos 1 mayúscula", regex: /[A-Z]/ },
  { name: "Al menos 1 número", regex: /[0-9]/ },
] as const;

export function PasswordChecker({
  className,
  onValidationChange,
  password,
}: {
  className?: string;
  onValidationChange: (isValid: boolean) => void;
  password: string;
}) {
  const isValid = passwordChecks.every((check) => check.regex.test(password));

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {passwordChecks.map((check) => {
        const passes = check.regex.test(password);

        return (
          <div
            className={cn(
              "text-base-content/55 flex items-center gap-1.5 text-xs",
              passes && "text-success",
            )}
            key={check.name}
          >
            {passes ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
            <span>{check.name}</span>
          </div>
        );
      })}
    </div>
  );
}

interface SwitchInputControllerProps<
  T extends FieldValues,
  TName extends FieldPathByValue<T, boolean> = FieldPathByValue<T, boolean>,
> {
  control: Control<T>;
  name: TName;
}

export function SwitchInput<T extends FieldValues>(
  props: SwitchInputControllerProps<T>,
) {
  const { field } = useController(props);
  const isDisabled = field.value;

  return (
    <div
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-lg border px-3",
        isDisabled
          ? "border-error/40 bg-error/5"
          : "border-secondary/20 bg-secondary/5",
      )}
    >
      <span>Deshabilitado</span>
      <input
        checked={isDisabled}
        className={cn("toggle rounded-md", isDisabled && "toggle-error")}
        onChange={() => field.onChange(!isDisabled)}
        type="checkbox"
      />
    </div>
  );
}

export function DebouncedInput({
  condition,
  debounceTime = 300,
  onChange,
  value: initialValue,
  ...props
}: {
  condition?: RegExp;
  debounceTime?: number;
  onChange: (value: string) => void;
  value: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const [draft, setDraft] = useState({
    sourceValue: initialValue,
    value: initialValue,
  });
  const value = draft.sourceValue === initialValue ? draft.value : initialValue;

  useEffect(() => {
    if (value === initialValue) return;

    const timeout = window.setTimeout(() => onChange(value), debounceTime);
    return () => window.clearTimeout(timeout);
  }, [debounceTime, initialValue, onChange, value]);

  return (
    <input
      {...props}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (!condition || condition.test(nextValue)) {
          setDraft({ sourceValue: initialValue, value: nextValue });
        }
      }}
      type={props.type ?? "text"}
      value={value}
    />
  );
}
