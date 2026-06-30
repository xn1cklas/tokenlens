import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

type LayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: LayoutProps) {
  const options = await baseOptions();
  return (
    <DocsLayout tree={source.pageTree} {...options}>
      {children}
    </DocsLayout>
  );
}
