const fs = require("node:fs");
const path = require("node:path");

const generatedClient = path.resolve(__dirname, "../src/generated/prisma");
const buildClient = path.resolve(__dirname, "../dist/generated/prisma");

fs.cpSync(generatedClient, buildClient, {
  recursive: true,
  force: true,
  filter: (source) => {
    const extension = path.extname(source);
    if (extension === ".ts") return false;
    if (extension !== ".js") return true;

    const relativePath = path.relative(generatedClient, source);
    const typescriptSource = path.join(
      generatedClient,
      `${relativePath.slice(0, -extension.length)}.ts`,
    );
    return !fs.existsSync(typescriptSource);
  },
});
