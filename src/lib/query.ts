import axios from "axios";
import { ZodError } from "zod";
import type { ApiErrorBody } from "./types";
export function getErrorMessage(error: unknown, fallback = "Ocurrió un error") {
  if (!error) return fallback;
  if (error instanceof ZodError)
    return "La respuesta del servidor no tiene el formato esperado.";
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.code === "ERR_NETWORK")
      return "No se pudo conectar con el servidor.";
    if (error.response?.status === 401)
      return "Tu sesión venció. Volvé a iniciar sesión.";
    if (error.response?.status === 403)
      return "No tenés permiso para esta acción o la sesión necesita actualizarse.";
    if (error.response && error.response.status >= 500)
      return "El servidor no pudo completar la solicitud.";
    const body = error.response?.data;
    const fields = body?.errors
      ? Object.values(body.errors).flat().join(" · ")
      : "";
    return fields || body?.detail || body?.message || fallback;
  }
  return fallback;
}
