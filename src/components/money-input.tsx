"use client";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/cn";

// The backend accepts up to 9.999.999.999,99.
const MAX_INTEGER_DIGITS = 10;
const groupedInteger = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

/** Formats a stored amount for display: "1.234", "1.234,50", "0,42". */
export function formatMoneyInput(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Reads what the person typed with Argentine conventions: digits and one
// comma for decimals. Dots are thousands separators and get regenerated, and
// a minus sign is simply dropped, so the amount is never negative.
function parseTyped(raw: string) {
  const commaIndex = raw.indexOf(",");
  const integer = (commaIndex === -1 ? raw : raw.slice(0, commaIndex))
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_INTEGER_DIGITS);
  const decimals =
    commaIndex === -1
      ? null
      : raw
          .slice(commaIndex + 1)
          .replace(/\D/g, "")
          .slice(0, 2);
  const text =
    decimals === null
      ? integer && groupedInteger.format(Number(integer))
      : `${integer ? groupedInteger.format(Number(integer)) : "0"},${decimals}`;
  const value =
    integer === "" && decimals === null
      ? Number.NaN
      : Number(`${integer || "0"}.${decimals || "0"}`);
  return { text, value };
}

// Index in `text` right after the n-th digit or comma, so the caret keeps
// its place when separators are added or removed around it.
function caretAfter(text: string, significant: number) {
  if (significant <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (/[\d,]/.test(text[index])) seen += 1;
    if (seen === significant) return index + 1;
  }
  return text.length;
}

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onBlur" | "type" | "ref"
> & {
  value: number;
  onChange: (value: number) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Money field in es-AR format. Reports a number (NaN while empty) and keeps
 * the typed text, so "0,4" is not rewritten to "0,40" until the field blurs.
 */
export function MoneyInput({
  value,
  onChange,
  onBlur,
  ref,
  className,
  ...props
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const [draft, setDraft] = useState(() => ({
    text: formatMoneyInput(value),
    value,
  }));
  // A form reset or an external update replaces what was typed.
  if (!Object.is(draft.value, value))
    setDraft({ text: formatMoneyInput(value), value });

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current === null || !input) return;
    if (document.activeElement === input)
      input.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    // Numeric keypads often offer "." for decimals: when it was just typed
    // and there is no comma yet, it means the decimal separator.
    if (
      raw.length > draft.text.length &&
      raw[caret - 1] === "." &&
      !raw.includes(",")
    )
      raw = `${raw.slice(0, caret - 1)},${raw.slice(caret)}`;
    const parsed = parseTyped(raw);
    let significant = raw.slice(0, caret).replace(/[^\d,]/g, "").length;
    // ",42" becomes "0,42": the added zero shifts the caret one place.
    if (parsed.text.startsWith("0,") && !/\d/.test(raw.split(",")[0]))
      significant += 1;
    pendingCaret.current = caretAfter(parsed.text, significant);
    setDraft(parsed);
    onChange(parsed.value);
  }

  return (
    <label className={cn("input input-bordered w-full", className)}>
      <span aria-hidden="true" className="text-base-content/60">
        $
      </span>
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={props.placeholder ?? "0,00"}
        value={draft.text}
        onChange={handleChange}
        onBlur={(event) => {
          setDraft({ text: formatMoneyInput(draft.value), value: draft.value });
          onBlur?.(event);
        }}
        className="tabular-nums"
      />
    </label>
  );
}

type FormMoneyInputProps<T extends FieldValues> = Omit<
  MoneyInputProps,
  "value" | "onChange" | "onBlur" | "name" | "ref"
> & {
  control: Control<T>;
  name: FieldPath<T>;
};

/** MoneyInput bound to React Hook Form, like FormSelect. */
export function FormMoneyInput<T extends FieldValues>({
  control,
  name,
  ...props
}: FormMoneyInputProps<T>) {
  const { field } = useController({ control, name });
  return (
    <MoneyInput
      {...props}
      ref={field.ref}
      name={field.name}
      value={typeof field.value === "number" ? field.value : Number.NaN}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
