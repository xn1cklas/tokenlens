import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

const searchLanguage =
  process.env.NEXT_DOCS_SEARCH_LANGUAGE?.trim?.() ||
  process.env.NEXT_PUBLIC_DOCS_LANGUAGE?.trim?.() ||
  "english";

export const { GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: searchLanguage,
});
