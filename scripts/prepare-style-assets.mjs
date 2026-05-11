import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const srcStylesDir = path.join(cwd, 'src/styles');
const distDir = path.join(cwd, 'dist');

await mkdir(distDir, { recursive: true });

for (const entry of await readdir(srcStylesDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.css')) {
    continue;
  }

  await cp(path.join(srcStylesDir, entry.name), path.join(distDir, entry.name));
}
