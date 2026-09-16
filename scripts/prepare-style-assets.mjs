import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const srcStylesDir = path.join(cwd, 'src/styles');
const distDir = path.join(cwd, 'dist');
const distStylesDir = path.join(cwd, 'dist/styles');

await mkdir(distStylesDir, { recursive: true });

for (const entry of await readdir(srcStylesDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.css')) {
    continue;
  }

  // Keep relative imports inside the published styles resolvable.
  await cp(path.join(srcStylesDir, entry.name), path.join(distStylesDir, entry.name));
}

// `src/styles/index.css` uses sibling imports. Its published counterpart lives
// in `dist/styles`, so the public root style entry must first cross into that
// directory rather than retaining its source-relative import paths.
await writeFile(path.join(distDir, 'style.css'), '@import "./styles/index.css";\n');
