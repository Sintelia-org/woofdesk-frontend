"use client";
import Link from "next/link";
import { MotionConfig } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  use,
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import { RouteSkeleton } from "@/components/skeletons";
const NavigationContext = createContext<{
  pending: boolean;
  targetPathname: string | null;
  navigate: (
    href: string,
    options: { replace?: boolean; scroll?: boolean },
  ) => void;
} | null>(null);
export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [targetPathname, setTargetPathname] = useState<string | null>(null);
  function navigate(
    href: string,
    options: { replace?: boolean; scroll?: boolean },
  ) {
    // Lets the viewport show the destination's skeleton while pending.
    setTargetPathname(new URL(href, window.location.href).pathname);
    startTransition(() => {
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
    });
  }
  return (
    <NavigationContext value={{ pending, targetPathname, navigate }}>
      {children}
    </NavigationContext>
  );
}
export function NavigationLink({
  href,
  onClick,
  replace,
  scroll,
  target,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const navigation = use(NavigationContext);
  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={scroll}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (
          !navigation ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (target && target !== "_self") ||
          event.currentTarget.hasAttribute("download")
        )
          return;
        const url = new URL(href, window.location.href);
        if (
          url.origin !== window.location.origin ||
          (url.pathname === window.location.pathname &&
            url.search === window.location.search)
        )
          return;
        event.preventDefault();
        navigation.navigate(url.pathname + url.search + url.hash, {
          replace,
          scroll,
        });
      }}
    />
  );
}
export function NavigationViewport({ children }: { children: ReactNode }) {
  const navigation = use(NavigationContext);
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-full min-h-0"
        aria-busy={navigation?.pending || undefined}
      >
        <div
          className="h-full min-h-0"
          inert={navigation?.pending || undefined}
          style={navigation?.pending ? { visibility: "hidden" } : undefined}
        >
          {children}
        </div>
        {navigation?.pending ? (
          // Same skeleton as the route's loading.tsx, so the hand-off from
          // the pending transition to the loading boundary is not visible.
          <div className="bg-base-200 absolute inset-0 z-30">
            <RouteSkeleton pathname={navigation.targetPathname ?? pathname} />
          </div>
        ) : null}
      </div>
    </MotionConfig>
  );
}
