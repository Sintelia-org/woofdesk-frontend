import type { AxiosError } from "axios";
import type { ReactNode } from "react";
export type WithChildren = { children: ReactNode };
export type WithClassName = { className?: string };
export type ApiErrorBody = {
  message?: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string | string[]>;
  existingClients?: { id: number; name: string; phone: string }[];
};
export type ServerError = AxiosError<ApiErrorBody>;
