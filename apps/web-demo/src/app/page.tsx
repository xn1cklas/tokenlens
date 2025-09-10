import InputDemo from "@/components/chat";
import { fetchModels } from "tokenlens";

export default async function Home() {
  const allModels = await fetchModels({ provider: "openai" });
  console.log(allModels);
  return <InputDemo />;
}
