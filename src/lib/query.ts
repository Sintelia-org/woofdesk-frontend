import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Ocurrió un error") {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.code === "ERR_NETWORK")
      return "No se pudo conectar con el servidor";
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
