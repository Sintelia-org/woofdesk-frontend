"use client";
import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/features/session/session.client";
import { LoadingScreen } from "@/components/loading";
import { ErrorState } from "@/components/error";
// Guards the view area only: the layout renders the navigation outside it, so
// a failed /me (network, server or schema error) keeps the shell usable.
export function SessionGuard({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const { org } = useParams<{ org: string }>();
  const unauthorized = session.error?.response?.status === 401;
  useEffect(() => {
    if (unauthorized) router.replace("/login");
    else if (session.data && org !== String(session.data.orgId))
      router.replace(`/${session.data.orgId}/dashboard`);
  }, [unauthorized, session.data, org, router]);
  if (session.isPending || unauthorized) return <LoadingScreen />;
  if (session.isError)
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <ErrorState
          error={session.error}
          retry={() => {
            void session.refetch();
          }}
        />
      </div>
    );
  if (!session.data || org !== String(session.data.orgId))
    return <LoadingScreen />;
  return children;
}
