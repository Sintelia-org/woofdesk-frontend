"use client";
import { usePathname } from "next/navigation";
import { RouteSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <RouteSkeleton pathname={usePathname()} />;
}
