import {
  DEFAULT_CATALOG_LIMIT,
  isCatalogSource,
  loadCatalogView,
} from "@/lib/model-catalog";

export const dynamic = "force-dynamic";

function parseInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const source = params.get("source") ?? "openrouter";

  if (!isCatalogSource(source)) {
    return Response.json(
      { error: "Unknown catalog source." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const catalog = await loadCatalogView(source, {
    search: params.get("search") ?? undefined,
    provider: params.get("provider") ?? undefined,
    offset: parseInteger(params.get("offset"), 0),
    limit: parseInteger(params.get("limit"), DEFAULT_CATALOG_LIMIT),
  });
  const cacheControl =
    catalog.status === "ready"
      ? "public, s-maxage=86400, stale-while-revalidate=3600"
      : "no-store";

  return Response.json(catalog, {
    status: catalog.status === "error" ? 503 : 200,
    headers: {
      "Cache-Control": cacheControl,
    },
  });
}
