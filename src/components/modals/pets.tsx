"use client";
import { FormDatePicker } from "@/components/date";
import { FormSelect } from "@/components/select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { RecordSelect } from "@/components/record-select";
import { ErrorAlert } from "@/components/forms";
import { FormActions } from "./form-actions";
import {
  petInputSchema,
  petSchema,
  speciesLabels,
  genderLabels,
  sizeLabels,
  furLabels,
  type Pet,
  type PetInput,
} from "@/features/pets/schemas";
import { getPet } from "@/features/pets/requests";
import { LoadingSpinner } from "@/components/loading";
import { getClients } from "@/features/clients/requests";
import { getBreeds } from "@/features/breeds/requests";
import { localDate } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
async function loadClients(search: string, page: number) {
  const result = await getClients({ search, page, size: 20, active: true });
  return {
    options: result.content.map((client) => ({
      id: client.id,
      label: `${client.name} · ${client.phone}`,
    })),
    total: result.totalElements,
  };
}
export function PetModal({
  pet,
  isOpen,
  onClose,
}: {
  pet?: Pet;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const breedsQuery = useQuery<
    Awaited<ReturnType<typeof getBreeds>>,
    ServerError
  >({
    queryKey: ["breeds", session.data?.orgId, "all"],
    queryFn: () => getBreeds(),
    retry: false,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PetInput>({
    resolver: zodResolver(petInputSchema),
    defaultValues: {
      clientId: pet?.clientId ?? 0,
      species: pet?.species ?? "DOG",
      breedId: pet?.breedId ?? null,
      name: pet?.name ?? "",
      gender: pet?.gender ?? null,
      size: pet?.size ?? null,
      fur: pet?.fur ?? null,
      birthdate: pet?.birthdate ?? "",
      weight: pet?.weight ?? null,
      allergy: pet?.allergy ?? false,
      info: pet?.info ?? "",
    },
  });
  const species = watch("species");
  const availableBreeds =
    breedsQuery.data?.filter((breed) => breed.species === species) ?? [];
  const mutation = useMutation<Pet, ServerError, PetInput>({
    mutationFn: async (data) => {
      const response = await apiClient.request({
        method: pet ? "PUT" : "POST",
        url: pet ? `/api/pets/${pet.id}` : "/api/pets",
        data: { ...data, birthdate: data.birthdate || null },
      });
      return petSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["pets", session.data?.orgId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["appointments", session.data?.orgId],
      });
      toast.success("Mascota guardada");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={pet ? "Editar mascota" : "Agregar mascota"}
      footer={
        <FormActions
          form="pet-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="pet-form"
        className="modal-form grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="pet-name"
          label="Nombre"
          required
          error={errors.name?.message}
        >
          <Input id="pet-name" {...register("name")} />
        </Field>
        <RecordSelect
          id="pet-client"
          label="Responsable"
          required
          entityName="clientes"
          queryKey={["clients", session.data?.orgId, "picker"]}
          loadOptions={loadClients}
          value={watch("clientId") || null}
          selectedLabel={pet?.clientName}
          onChange={(id) =>
            setValue("clientId", id ?? 0, { shouldValidate: true })
          }
          error={errors.clientId?.message}
        />
        <Field htmlFor="pet-species" label="Especie" required>
          <FormSelect
            id="pet-species"
            control={control}
            name="species"
            options={Object.entries(speciesLabels).map(([value, label]) => ({
              value,
              label,
            }))}
            onValueChange={() => setValue("breedId", null)}
          />
        </Field>
        <Field htmlFor="pet-breed" label="Raza" error={errors.breedId?.message}>
          <FormSelect
            id="pet-breed"
            entityName="razas"
            control={control}
            name="breedId"
            loading={breedsQuery.isPending}
            parseValue={(value) => (value ? Number(value) : null)}
            placeholder="Mestizo / Sin informar"
            options={
              availableBreeds.length
                ? [
                    { value: "", label: "Mestizo / Sin informar" },
                    ...availableBreeds.map((breed) => ({
                      value: String(breed.id),
                      label: breed.name,
                    })),
                  ]
                : []
            }
          />
        </Field>
        <Field htmlFor="pet-gender" label="Sexo">
          <FormSelect
            id="pet-gender"
            control={control}
            name="gender"
            parseValue={(value) => value || null}
            options={[
              { value: "", label: "Sin informar" },
              ...Object.entries(genderLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </Field>
        <Field htmlFor="pet-size" label="Tamaño">
          <FormSelect
            id="pet-size"
            control={control}
            name="size"
            parseValue={(value) => value || null}
            options={[
              { value: "", label: "Sin informar" },
              ...Object.entries(sizeLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </Field>
        <Field htmlFor="pet-fur" label="Manto">
          <FormSelect
            id="pet-fur"
            control={control}
            name="fur"
            parseValue={(value) => value || null}
            options={[
              { value: "", label: "Sin informar" },
              ...Object.entries(furLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </Field>
        <Field
          htmlFor="pet-birthdate"
          label="Fecha de nacimiento"
          error={errors.birthdate?.message}
        >
          <FormDatePicker
            id="pet-birthdate"
            control={control}
            name="birthdate"
            max={localDate()}
          />
        </Field>
        <Field
          htmlFor="pet-weight"
          label="Peso aproximado (kg)"
          error={errors.weight?.message}
        >
          <Input
            id="pet-weight"
            type="number"
            step="0.01"
            min="0.01"
            max="999.99"
            {...register("weight", {
              setValueAs: (value) =>
                value === "" || value === null ? null : Number(value),
            })}
          />
        </Field>
        <Field htmlFor="pet-allergy" label="Salud">
          <label className="flex h-10 items-center gap-3 text-sm">
            <input
              id="pet-allergy"
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              {...register("allergy")}
            />
            Tiene alergias
          </label>
        </Field>
        <Field
          className="col-span-full"
          htmlFor="pet-info"
          label="Cuidados e información adicional"
          error={errors.info?.message}
        >
          <Textarea id="pet-info" {...register("info")} />
        </Field>
        {breedsQuery.isError ? (
          <ErrorAlert message={getErrorMessage(breedsQuery.error)} />
        ) : null}
      </form>
    </Modal>
  );
}
export function TogglePetModal({
  pet,
  isOpen,
  onClose,
}: {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const mutation = useMutation<unknown, ServerError, number>({
    mutationFn: async (id) =>
      (
        await apiClient.post(
          `/api/pets/${id}/${pet.active ? "deactivate" : "activate"}`,
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["pets", session.data?.orgId],
      });
      toast.success("Estado de la mascota actualizado");
      onClose();
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={pet.id}
      title={pet.active ? "Desactivar mascota" : "Reactivar mascota"}
      description="Cambiar el estado de la mascota"
      buttonText={pet.active ? "Desactivar" : "Reactivar"}
      type={pet.active ? "warning" : "success"}
    >
      ¿Querés {pet.active ? "desactivar" : "reactivar"} a{" "}
      <strong>{pet.name}</strong>? Su historial se conserva.
    </AlertWithMutationModal>
  );
}

export function PetDetailsModal({
  id,
  isOpen,
  onClose,
}: {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const session = useSession();
  const petQuery = useQuery<Awaited<ReturnType<typeof getPet>>, ServerError>({
    queryKey: ["pets", session.data?.orgId, "detail", id],
    queryFn: () => getPet(id),
    retry: false,
  });
  const pet = petQuery.data;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pet ? pet.name : "Ficha de la mascota"}
    >
      {petQuery.isPending ? (
        <LoadingSpinner aria-label="Cargando ficha" />
      ) : petQuery.isError ? (
        <ErrorAlert message={getErrorMessage(petQuery.error)} />
      ) : pet ? (
        <div className="flex flex-col gap-4">
          <p className="text-base-content/65 text-sm">
            Responsable: {pet.clientName}
          </p>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
            <dt>Especie</dt>
            <dd>{speciesLabels[pet.species]}</dd>
            <dt>Raza</dt>
            <dd>{pet.breedName || "Mestizo / Sin informar"}</dd>
            <dt>Sexo</dt>
            <dd>{pet.gender ? genderLabels[pet.gender] : "Sin informar"}</dd>
            <dt>Tamaño</dt>
            <dd>{pet.size ? sizeLabels[pet.size] : "Sin informar"}</dd>
            <dt>Manto</dt>
            <dd>{pet.fur ? furLabels[pet.fur] : "Sin informar"}</dd>
            <dt>Nacimiento</dt>
            <dd>
              {pet.birthdate
                ? new Date(pet.birthdate + "T12:00:00").toLocaleDateString(
                    "es-AR",
                  )
                : "Sin informar"}
            </dd>
            <dt>Peso</dt>
            <dd>{pet.weight !== null ? `${pet.weight} kg` : "Sin informar"}</dd>
            <dt>Alergias</dt>
            <dd className={pet.allergy ? "text-warning font-semibold" : ""}>
              {pet.allergy ? "Sí" : "No"}
            </dd>
            <dt>Estado</dt>
            <dd>{pet.active ? "Activo" : "Inactivo"}</dd>
          </dl>
          <div className="bg-secondary/10 rounded-xl p-4">
            <h3 className="mb-2 text-sm font-semibold">
              Cuidados e información
            </h3>
            <p className="text-base-content/70 text-sm whitespace-pre-wrap">
              {pet.info || "Sin información adicional."}
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
