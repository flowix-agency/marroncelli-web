import { cpSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const source = join(root, 'demo');
const output = join(root, 'dist-demo');
mkdirSync(output, { recursive: true });
for (const name of readdirSync(source)) {
  if (['.html', '.css', '.js'].includes(extname(name))) copyFileSync(join(source, name), join(output, name));
}
cpSync(join(source, 'assets'), join(output, 'assets'), { recursive: true });
