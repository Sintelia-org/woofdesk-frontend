import { cn } from "@/utils/lib";
import { WithChildren, WithClassName } from "@/utils/types";
import {
  AlertCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
} from "lucide-react";
import {
  Control,
  FieldPathByValue,
  FieldValues,
  useController,
} from "react-hook-form";
import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { cva, VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "./shadcn/tooltip";
import { LoadingSpinner } from "./loading";

type Color = keyof typeof colours;
const colours = {
  error: "text-error",
  secondary: "text-secondary",
  primary: "text-primary",
  warn: "text-warning",
};

export function MandatoryMark({ className }: WithClassName) {
  return <span className={cn(className, "text-error")}>*</span>;
}

export const ErrorLabel = ({
  message,
  color = "error",
  className,
  showIcon = false,
}: WithClassName & {
  message?: string;
  color?: Color;
  showIcon?: boolean;
}) => {
  if (!message) return null;

  return (
    <div className={cn(className, colours[color], "flex items-start gap-1.5")}>
      {showIcon && <AlertCircleIcon className="mt-0.5 size-4 min-w-4" />}
      {message}
    </div>
  );
};

export const ErrorAlert = ({
  message,
  onClick,
  className,
}: {
  message?: string;
  onClick?: () => void;
} & WithClassName) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        className,
        "alert alert-error flex h-12 max-w-full justify-between gap-4 shadow-lg",
      )}
    >
      <div className="flex w-full max-w-full flex-row items-center gap-2">
        <AlertCircleIcon className="size-5 min-w-5" />
        <span className="max-w-full text-sm sm:text-base">
          {message || "Error desconocido!"}
        </span>
      </div>
      {onClick && (
        <button type="button" onClick={onClick}>
          <XIcon className="size-5 min-w-5" />
        </button>
      )}
    </div>
  );
};

export const SuccessAlert = ({
  message,
  showRedirect,
  showCheck,
  onClick,
  className,
}: {
  message: string;
  showRedirect?: boolean;
  showCheck?: boolean;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div className={cn(className ?? "", "alert alert-success")}>
      {showCheck && <CheckIcon className="h-5 w-5" strokeWidth={2} />}
      <p>{message}</p>
      {!!onClick && (
        <XIcon className="h-5 w-5 hover:cursor-pointer" onClick={onClick} />
      )}
      {!!showRedirect && (
        <div className="flex flex-row items-center justify-between gap-3">
          <p>Redirigiendo...</p>
          <LoadingSpinner className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

interface ViewablePasswordControllerProps<
  T extends FieldValues,
  TName extends FieldPathByValue<T, string> = FieldPathByValue<T, string>,
> {
  control: Control<T>;
  name: TName;
  id?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ViewablePasswordInput<T extends FieldValues>(
  props: ViewablePasswordControllerProps<T>,
) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    field: { value, onChange },
  } = useController(props);

  return (
    <div className="relative">
      <input
        id={props.id}
        value={value}
        onChange={(v) => onChange(v)}
        type={showPassword ? "text" : "password"}
        className={props.className}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="absolute top-1/2 right-4 bottom-1/2 flex cursor-pointer flex-row items-center justify-center"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeIcon className="text-secondary size-5" />
          ) : (
            <EyeOffIcon className="text-secondary size-5" />
          )}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={10}
          className="bg-base-100 border-secondary/80 text-primary/80 rounded-sm border px-2.5 py-1 text-xs"
        >
          <TooltipArrow className="fill-secondary/80" />
          Mostrar contraseña
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// -------------- Loadable Button (copied) -------------- //
export function LoadingSpinner2({ className }: { className?: string }) {
  return (
    <div
      className={cn(!!className && className, "custom-loader h-4 w-4")}
    ></div>
  );
}

export const buttonStyles = cva(
  "rounded-md text-white btn btn-sm min-w-24", // base class
  {
    variants: {
      variant: {
        default:
          "hover:bg-slate-100/40 bg-white transition-all border-[.1rem] text-slate-600 border-slate-400 font-medium",
        tableAdd:
          "bg-warning hover:bg-warning/80 disabled:bg-warning/60 transition-all",
        confirm: "bg-success disabled:bg-accent/60 transition-all",
        danger:
          "bg-error hover:bg-error/90 disabled:bg-error/60 transition-all",
      },
      size: {
        xs: "h-6 text-xs p-1 flex justify-center items-center",
        sm: "h-9 px-2 text-xs",
        lg: "h-9 px-12 text-xs",
      },
      defaultVariants: {
        variant: "default",
        size: "sm",
      },
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={cn(buttonStyles({ variant, size, className }))}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner2 />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

type Animation = keyof typeof animations;
const animations = {
  spinner: "loading-spinner",
  dots: "loading-dots",
  ring: "loading-ring",
  ball: "loading-ball",
  bars: "loading-bars",
  infinity: "loading-infinity",
};

export const LoadableButton = ({
  type,
  isPending,
  className,
  disabled,
  children,
  animation = "spinner",
  onClick,
}: {
  type?: "button" | "reset" | "submit";
  isPending: boolean;
  className?: string;
  disabled?: boolean;
  animation?: Animation;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & WithChildren) => {
  return (
    <button
      onClick={(e) => {
        if (isPending || !onClick) return;
        onClick(e);
      }}
      type={isPending ? "button" : type}
      className={cn(
        "btn",
        !!className && className,
        isPending && "no-animation cursor-default",
      )}
      disabled={disabled}
    >
      {isPending ? (
        <>
          <span
            className={cn(
              "loading size-5",
              !!animation && animations[animation],
            )}
          />
        </>
      ) : (
        children
      )}
    </button>
  );
};

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
        isDisabled
          ? "border-error/50 bg-error/5"
          : "border-secondary/10 bg-secondary/5",
        "flex h-12 w-full flex-col justify-center gap-2 rounded-md border px-3",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span>Deshabilitado</span>
          <input
            type="checkbox"
            className={cn(
              isDisabled && "toggle-error",
              "toggle rounded-md before:rounded-sm",
            )}
            checked={isDisabled}
            readOnly
            onChange={() => field.onChange(!isDisabled)}
          />
        </div>
      </div>
    </div>
  );
}

export function DebouncedInput({
  value: initial,
  debounceTime = 300,
  condition,
  onChange,
  ...props
}: {
  value: string;
  debounceTime?: number;
  condition?: RegExp;
  onChange: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const [value, setValue] = useState(initial);

  const isUserChange = useRef(false);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const isFirst = useRef(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }

      onChange(value);
      isUserChange.current = false;
    }, debounceTime);

    return () => clearTimeout(timeout);
  }, [value, debounceTime, onChange]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const temp = e.target.value;

        if (!condition || condition.test(temp)) {
          isUserChange.current = true;
          setValue(temp);
        }
      }}
      {...props}
    />
  );
}
