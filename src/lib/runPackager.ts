import path from 'node:path';
import fs from 'fs-extra';
import packager from 'electron-packager';
const setLanguages = require('electron-packager-languages');

export async function runPackager(params: {
  dir: string;
  out: string;
  appVersion: string;
  electronVersion: string;
  platform: string;
  arch: string;
  asar: boolean;
}) {
  await fs.ensureDir(params.out);

  const appName = `Siki`;
  const out = path.resolve(params.out);
  await packager({
    dir: params.dir,
    out,
    name: appName,
    platform: params.platform as any,
    arch: params.arch as any,
    overwrite: true,
    icon: path.join(params.dir, 'assets', params.platform === 'darwin' ? 'app.icns' : 'icon.ico'),
    electronVersion: params.electronVersion,
    prune: false,
    asar: params.asar,
    afterCopy: [setLanguages(['ja', 'ja-JP'])]
  });
}
