import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultRequire = createRequire(import.meta.url);
const externalPackageResolvers = new Map([
  [
    "@types/node",
    createRequire(join(repoRoot, "packages/tokenlens/package.json")),
  ],
  ["ai", createRequire(join(repoRoot, "packages/vercel/package.json"))],
]);
const workspacePackages = [
  ["@tokenlens/core", "core", "packages/core"],
  ["@tokenlens/helpers", "helpers", "packages/helpers"],
  ["@tokenlens/fetch", "fetch", "packages/fetch"],
  ["@tokenlens/tokenizer", "tokenizer", "packages/tokenizer"],
  ["tokenlens", "tokenlens", "packages/tokenlens"],
  ["@tokenlens/vercel", "vercel", "packages/vercel"],
  ["@tokenlens/codemod", "codemod", "packages/codemod"],
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, CI: "1", ...options.env },
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status}`,
    );
  }

  return result.stdout?.trim() ?? "";
}

function tarEntries(tarball) {
  return run("tar", ["-tzf", tarball], { capture: true })
    .split(/\r?\n/)
    .filter(Boolean);
}

function assertTarballContains(tarball, expectedPath) {
  const entries = tarEntries(tarball);
  if (!entries.includes(`package/${expectedPath}`)) {
    throw new Error(`${basename(tarball)} is missing ${expectedPath}`);
  }
}

async function packPackages(packDir) {
  const tarballs = new Map();

  for (const [packageName, key, packageDir] of workspacePackages) {
    const before = new Set(await readdir(packDir));
    run("pnpm", ["pack", "--pack-destination", packDir], {
      cwd: join(repoRoot, packageDir),
    });
    const after = await readdir(packDir);
    const created = after.filter(
      (file) => file.endsWith(".tgz") && !before.has(file),
    );
    if (created.length !== 1) {
      throw new Error(
        `Expected one tarball for ${packageName}, got ${created}`,
      );
    }
    tarballs.set(key, join(packDir, created[0]));
  }

  return tarballs;
}

async function writeConsumerProject(
  dir,
  packageJson,
  source,
  compilerOptions = {},
) {
  await writeFile(
    join(dir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  await writeFile(
    join(dir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: false,
          noEmit: true,
          ...compilerOptions,
        },
        include: ["index.ts"],
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(join(dir, "index.ts"), source);
}

function packagePath(nodeModules, packageName) {
  return join(nodeModules, ...packageName.split("/"));
}

async function extractPackedPackage(nodeModules, packageName, tarball) {
  const destination = packagePath(nodeModules, packageName);
  await mkdir(destination, { recursive: true });
  run("tar", ["-xzf", tarball, "-C", destination, "--strip-components=1"]);
}

async function linkPackageBins(nodeModules, packageName) {
  const packageDir = packagePath(nodeModules, packageName);
  const packageJson = JSON.parse(
    await readFile(join(packageDir, "package.json"), "utf8"),
  );
  const bin = packageJson.bin;
  if (!bin) return;

  const entries =
    typeof bin === "string"
      ? [[packageJson.name.split("/").at(-1), bin]]
      : Object.entries(bin);
  const binDir = join(nodeModules, ".bin");
  await mkdir(binDir, { recursive: true });

  for (const [name, target] of entries) {
    await symlink(join(packageDir, target), join(binDir, name), "file");
  }
}

async function linkExternalPackage(nodeModules, packageName) {
  const resolver = externalPackageResolvers.get(packageName) ?? defaultRequire;
  const source = dirname(resolver.resolve(`${packageName}/package.json`));
  const destination = packagePath(nodeModules, packageName);
  await mkdir(resolve(destination, ".."), { recursive: true });
  await symlink(source, destination, "junction");
}

async function prepareNodeModules(dir, packages, externalPackages = []) {
  const nodeModules = join(dir, "node_modules");
  await mkdir(nodeModules, { recursive: true });

  for (const [packageName, tarball] of packages) {
    await extractPackedPackage(nodeModules, packageName, tarball);
    await linkPackageBins(nodeModules, packageName);
  }

  for (const packageName of externalPackages) {
    await linkExternalPackage(nodeModules, packageName);
  }
}

async function checkProject(dir, runtimeImports) {
  run("pnpm", ["--dir", repoRoot, "exec", "tsc", "-p", dir]);
  for (const specifier of runtimeImports) {
    run(
      "node",
      [
        "--input-type=module",
        "--eval",
        `import(${JSON.stringify(specifier)});`,
      ],
      { cwd: dir },
    );
  }
}

async function main() {
  const tempRoot = await mkdtemp(join(tmpdir(), "tokenlens-export-smoke-"));
  const packDir = join(tempRoot, "packs");
  await mkdir(packDir);

  try {
    const tarballs = await packPackages(packDir);
    const core = tarballs.get("core");
    const helpers = tarballs.get("helpers");
    const fetch = tarballs.get("fetch");
    const tokenlens = tarballs.get("tokenlens");
    const tokenizer = tarballs.get("tokenizer");
    const vercel = tarballs.get("vercel");
    const codemod = tarballs.get("codemod");

    for (const tarball of tarballs.values()) {
      assertTarballContains(tarball, "LICENSE");
    }
    if (tarEntries(tokenlens).some((entry) => entry.includes("test-utils"))) {
      throw new Error("tokenlens tarball must not include test-utils");
    }

    const noTokenizerDir = join(tempRoot, "without-tokenizer");
    await mkdir(noTokenizerDir);
    await prepareNodeModules(noTokenizerDir, [
      ["@tokenlens/core", core],
      ["@tokenlens/helpers", helpers],
      ["@tokenlens/fetch", fetch],
      ["tokenlens", tokenlens],
    ]);
    await writeConsumerProject(
      noTokenizerDir,
      {
        name: "tokenlens-export-smoke-without-tokenizer",
        private: true,
        type: "module",
        dependencies: {},
      },
      `
        import { Tokenlens, createTokenlens } from "tokenlens";
        import { listModels, listProviders, tryGetModelData } from "tokenlens";
        import { computeTokenCostsForModel } from "tokenlens/helpers";
        import { fetchModelsDev } from "tokenlens/fetch";
        import type { SourceProvider, SourceProviders } from "tokenlens/core";
        import type { Usage } from "@tokenlens/core/usage";
        import type { CacheAdapter, CacheEntry, CatalogOverrides, TokenlensSourceOptions } from "tokenlens";

        const catalog: SourceProviders = {
          openai: {
            id: "openai",
            models: {
              "openai/gpt-4o-mini": {
                id: "openai/gpt-4o-mini",
                canonical_id: "openai/gpt-4o-mini",
                name: "GPT-4o mini",
                cost: { input: 1, output: 2 },
              },
            },
          },
        };
        const overrides: CatalogOverrides = {
          openai: {
            models: {
              "openai/gpt-4o-mini": { cost: { input: 3 } },
            },
          },
        };
        const sourceOptions: TokenlensSourceOptions = {
          vercel: { includeEndpointDetails: true, endpointConcurrency: 1 },
        };
        const cacheEntry: CacheEntry = {
          value: catalog,
          expiresAt: Date.now() + 1_000,
        };
        const cache: CacheAdapter = {
          get: () => cacheEntry,
          set: () => {},
        };
        const usage: Usage = { inputTokens: 10, outputTokens: 2 };
        const client = new Tokenlens({ catalog, overrides, sourceOptions, cache: false });
        const providers: SourceProvider[] = await listProviders({ catalog });
        await listModels({ catalog, provider: "openai", search: "mini" });
        await tryGetModelData({ catalog, modelId: "missing" });
        createTokenlens({ catalog, overrides, sourceOptions, cache: false });
        computeTokenCostsForModel({ model: catalog.openai.models["openai/gpt-4o-mini"], usage });
        void client;
        void providers;
        void fetchModelsDev;
        void cache;
      `,
    );
    await checkProject(noTokenizerDir, [
      "tokenlens",
      "tokenlens/helpers",
      "tokenlens/fetch",
      "tokenlens/core",
      "@tokenlens/core/usage",
    ]);

    const tokenizerDir = join(tempRoot, "with-tokenizer-and-vercel");
    await mkdir(tokenizerDir);
    await prepareNodeModules(
      tokenizerDir,
      [
        ["@tokenlens/core", core],
        ["@tokenlens/helpers", helpers],
        ["@tokenlens/fetch", fetch],
        ["@tokenlens/tokenizer", tokenizer],
        ["@tokenlens/vercel", vercel],
        ["tokenlens", tokenlens],
      ],
      ["ai", "@types/node"],
    );
    await writeConsumerProject(
      tokenizerDir,
      {
        name: "tokenlens-export-smoke-with-tokenizer-and-vercel",
        private: true,
        type: "module",
        dependencies: {},
      },
      `
        import { countTokens, type TokenizerModelId } from "tokenlens/tokenizer";
        import { withTokenlens } from "@tokenlens/vercel";
        import { createTokenlens } from "tokenlens";

        const modelId: TokenizerModelId = "gpt-4o";
        const tokenlens = createTokenlens({ catalog: {} });
        void modelId;
        void countTokens;
        void withTokenlens;
        void tokenlens;
      `,
      {
        exactOptionalPropertyTypes: false,
        skipLibCheck: true,
        types: ["node"],
      },
    );
    await checkProject(tokenizerDir, [
      "tokenlens/tokenizer",
      "@tokenlens/tokenizer",
      "@tokenlens/vercel",
    ]);

    const codemodDir = join(tempRoot, "codemod-cli");
    await mkdir(codemodDir);
    await prepareNodeModules(
      codemodDir,
      [["@tokenlens/codemod", codemod]],
      ["typescript"],
    );
    await writeFile(
      join(codemodDir, "index.ts"),
      'import { fetchModels, type ModelId } from "tokenlens";\nvoid fetchModels;\nconst id: ModelId = "openai/gpt-4o";\nvoid id;\n',
    );
    run(
      "node",
      [
        join(codemodDir, "node_modules", ".bin", "tokenlens-codemod"),
        "v2",
        "index.ts",
      ],
      { cwd: codemodDir },
    );

    console.log(
      `Export smoke tests passed using packed tarballs in ${basename(tempRoot)}`,
    );
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

await main();
