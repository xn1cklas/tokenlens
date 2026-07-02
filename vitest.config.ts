import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, defineProject } from "vitest/config";

const sharedTestOptions = {
  environment: "node",
  globals: false,
};

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

const workspaceAliases = {
  "@tokenlens/core": resolve(repoRoot, "packages/core/src/index.ts"),
  "@tokenlens/fetch": resolve(repoRoot, "packages/fetch/src/index.ts"),
  "@tokenlens/helpers": resolve(repoRoot, "packages/helpers/src/index.ts"),
  "@tokenlens/tokenizer": resolve(repoRoot, "packages/tokenizer/src/index.ts"),
  tokenlens: resolve(repoRoot, "packages/tokenlens/src/index.ts"),
};

function project(
  name: string,
  relativeRoot: string,
  include: readonly string[],
  extraTestOptions: Record<string, unknown> = {},
) {
  return defineProject({
    root: resolve(repoRoot, relativeRoot),
    resolve: {
      alias: workspaceAliases,
    },
    test: {
      ...sharedTestOptions,
      ...extraTestOptions,
      name,
      include: [...include],
    },
  });
}

export default defineConfig({
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "**/.next/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "packages/*/src/types.ts",
        "packages/core/src/dto.ts",
        "packages/core/src/usage.ts",
      ],
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 98,
        branches: 98,
        functions: 98,
        lines: 98,
      },
    },
    projects: [
      project("core", "packages/core", ["tests/**/*.test.ts"]),
      project("helpers", "packages/helpers", ["tests/**/*.spec.ts"]),
      project("fetch", "packages/fetch", ["tests/**/*.spec.ts"]),
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
