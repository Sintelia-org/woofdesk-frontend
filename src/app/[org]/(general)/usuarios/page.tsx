import { redirect } from "next/navigation";

// Kept so existing links and bookmarks land on the settings tab.
export default async function LegacyUsuariosPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  redirect(`/${encodeURIComponent(org)}/configuracion/usuarios`);
}
