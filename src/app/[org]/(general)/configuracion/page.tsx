"use client";
import { redirect, useParams } from "next/navigation";
import { useSession } from "@/features/session/session.client";

// SessionGuard renders this only once /me resolved, so the role is known:
// administrators start on their team, everyone else on their own account.
export default function SettingsPage() {
  const session = useSession();
  const { org } = useParams<{ org: string }>();
  const tab = session.data?.role === "ADMIN" ? "personal" : "cuenta";
  redirect(`/${encodeURIComponent(org)}/configuracion/${tab}`);
}
