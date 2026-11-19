"use client";

import { redirect } from "next/navigation";
import { ErrorState } from "@/components/error";
import { LoadingScreen } from "@/components/loading";
import { useSession } from "@/features/session/session.client";

// Entry point: waits for /me before choosing a destination, so a signed-in
// person never sees the login form on the way to their dashboard.
export default function Home() {
  const session = useSession();
  if (session.data)
    redirect(`/${encodeURIComponent(String(session.data.orgId))}/dashboard`);
  if (session.error?.response?.status === 401) redirect("/login");
  if (session.isError)
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center p-6">
        <ErrorState
          className="w-full max-w-2xl"
          error={session.error}
          retry={() => {
            void session.refetch();
          }}
        />
      </div>
    );
  return <LoadingScreen />;
}
