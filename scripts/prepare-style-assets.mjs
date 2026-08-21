import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const srcStylesDir = path.join(cwd, 'src/styles');
const distStylesDir = path.join(cwd, 'dist/styles');

await mkdir(distStylesDir, { recursive: true });

for (const entry of await readdir(srcStylesDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.css')) {
    continue;
  }

  // Keep relative imports inside the published styles resolvable.
  await cp(path.join(srcStylesDir, entry.name), path.join(distStylesDir, entry.name));
}
