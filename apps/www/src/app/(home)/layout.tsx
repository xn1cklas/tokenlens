import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children }: LayoutProps<"/">) {
  const options = await baseOptions();
  return <HomeLayout {...options}>{children}</HomeLayout>;
}
