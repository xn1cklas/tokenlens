import { fetchModels } from "tokenlens";
import InputDemo from "@/components/chat";

export default async function Home() {
  const allModels = await fetchModels({ provider: "vercel" });
  console.log(allModels);
  return <InputDemo />;
}
