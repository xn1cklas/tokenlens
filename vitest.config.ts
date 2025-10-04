import { defineConfig, defineProject } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const sharedTestOptions = {
  environment: "node",
  globals: false,
};

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

function project(
  name: string,
  relativeRoot: string,
  include: readonly string[],
  extraTestOptions: Record<string, unknown> = {},
) {
  return defineProject({
    root: resolve(repoRoot, relativeRoot),
    test: {
      ...sharedTestOptions,
      ...extraTestOptions,
      name,
      include: [...include],
    },
  });
}

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/"],
    },
    projects: [
      project("core", "packages/core", ["tests/**/*.test.ts"]),
      project("helpers", "packages/helpers", ["tests/**/*.spec.ts"]),
      project("fetch", "packages/fetch", ["tests/**/*.spec.ts"]),
      project("models", "packages/models", ["tests/**/*.spec.ts"]),
      project("tokenizer", "packages/tokenizer", ["tests/**/*.spec.ts"], {
        globals: true,
      }),
      project("tokenlens", "packages/tokenlens", [
        "tests/**/*.spec.ts",
        "tests/**/*.test.ts",
      ]),
      project("vercel", "packages/vercel", ["src/**/*.test.ts"]),
      project(
        "provider-tests",
        "packages/provider-tests",
        ["tests/**/*.spec.ts", "tests/**/*.test.ts"],
        { globals: true },
      ),
    ],
  },
});
