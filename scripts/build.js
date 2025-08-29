import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function copyDir(srcDir, destDir, { excludeDirs = [] } = {}) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) continue;
      await copyDir(srcPath, destPath, { excludeDirs });
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

try {
  // Build TypeScript files
  execSync('tsc -p components/popup/tsconfig.app.json', { stdio: 'inherit' });
  execSync('tsc -p components/popup/tsconfig.node.json', { stdio: 'inherit' });
  execSync('tsc -p components/content/tsconfig.app.json', { stdio: 'inherit' });
  execSync('tsc -p components/content/tsconfig.node.json', { stdio: 'inherit' });
  execSync('tsc -p components/pages/tsconfig.app.json', { stdio: 'inherit' });
  execSync('tsc -p components/pages/tsconfig.node.json', { stdio: 'inherit' });
  execSync('tsc -p public/extension/tsconfig.json', { stdio: 'inherit' });

  // Build Vite
  execSync('vite build components/popup', { stdio: 'inherit' });
  execSync('vite build components/content', { stdio: 'inherit' });
  execSync('vite build components/pages', { stdio: 'inherit' });
  execSync('vite build public/extension', { stdio: 'inherit' });

  // Copy public directory (exclude TS source project under public/extension)
  await copyDir(path.resolve('public'), path.resolve('dist'), { excludeDirs: ['extension'] });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
