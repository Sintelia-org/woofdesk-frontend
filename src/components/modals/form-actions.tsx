import { ErrorAlert, LoadableButton } from "@/components/forms";
import { getErrorMessage } from "@/lib/query";
export function FormActions({
  pending,
  error,
  onClose,
  label = "Guardar",
  form,
}: {
  pending: boolean;
  error: unknown;
  onClose: () => void;
  label?: string;
  form?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert message={error ? getErrorMessage(error) : undefined} />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          className="btn btn-outline btn-sm"
          onClick={onClose}
        >
          Cancelar
        </button>
        <LoadableButton
          type="submit"
          form={form}
          className="btn-primary btn-sm min-w-28"
          isPending={pending}
        >
          {label}
        </LoadableButton>
      </div>
    </div>
  );
}
