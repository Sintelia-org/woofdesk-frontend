export { cn } from "@/lib/cn";

export function nullToUndefined<T>(value: T | null | undefined) {
  return value === null ? undefined : value;
}

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
