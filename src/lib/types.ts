import type { AxiosError } from "axios";
import type { ReactNode } from "react";

export type WithChildren = { children: ReactNode };
export type WithClassName = { className?: string };

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type ServerError = AxiosError<ApiErrorBody>;
