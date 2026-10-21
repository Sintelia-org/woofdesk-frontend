import { WithChildren } from "@/utils/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Inicia sesión",
};

export default function LoginLayout({ children }: WithChildren) {
  return children;
}
