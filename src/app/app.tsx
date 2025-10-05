"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";

// note: dynamic import is required for components that use the Frame SDK
const BaseGuardian = dynamic(() => import("~/components/BaseGuardian"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return <BaseGuardian title={title} />;
}
