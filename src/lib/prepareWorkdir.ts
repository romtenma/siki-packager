import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { extractAsar } from './extractAsar';
import { resolveAsarInput } from './resolveAsarInput';

export async function prepareWorkdir(params: {
  appVersion: string;
  electronVersion: string;
  platform: string;
  arch: string;
  asarInputPath: string;
}): Promise<string> {
  const base = path.resolve(os.tmpdir(), 'siki-builder');
  const workdir = path.resolve(
    base,
    `${params.appVersion}__electron-${params.electronVersion}__${params.platform}-${params.arch}`
  );

  await fs.remove(workdir);
  await fs.ensureDir(workdir);

  const asarPath = await resolveAsarInput({ inputPath: params.asarInputPath, workdir });
  await extractAsar({ asarPath, outDir: workdir });

  const pkgJson = path.resolve(workdir, 'package.json');
  const mainJs = path.resolve(workdir, 'assets', 'main.js');
  const preloadJs = path.resolve(workdir, 'assets', 'main_preload.js');

  if (!(await fs.pathExists(pkgJson))) {
    throw new Error(`Invalid app asar: missing package.json after extract: ${pkgJson}`);
  }
  if (!(await fs.pathExists(mainJs))) {
    throw new Error(`Invalid app asar: missing main.js after extract: ${mainJs}`);
  }
  if (!(await fs.pathExists(preloadJs))) {
    throw new Error(`Invalid app asar: missing main_preload.js after extract: ${preloadJs}`);
  }

  return workdir;
}
