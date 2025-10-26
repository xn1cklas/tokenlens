import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const options = baseOptions();
  return (
    <DocsLayout tree={source.pageTree} {...options}>
      {children}
    </DocsLayout>
  );
}
