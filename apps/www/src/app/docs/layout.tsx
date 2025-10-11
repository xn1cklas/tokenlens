import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({ children }: LayoutProps<"/docs">) {
  const options = await baseOptions();
  return (
    <DocsLayout tree={source.pageTree} {...options}>
      {children}
    </DocsLayout>
  );
}
