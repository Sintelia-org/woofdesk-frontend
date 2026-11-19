"use client";
import { ErrorState } from "@/components/error";

// Rendered inside the (general) layout, so an unexpected view error keeps the
// navigation available instead of replacing the whole shell.
export default function GeneralError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <ErrorState error={error} retry={reset} />
    </div>
  );
}
