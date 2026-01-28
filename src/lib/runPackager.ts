import path from 'node:path';
import fs from 'fs-extra';
import packager from 'electron-packager'

export async function runPackager(params: {
  dir: string;
  out: string;
  appVersion: string;
  electronVersion: string;
  platform: string;
  arch: string;
  asar: boolean;
  name?: string;
}) {
  await fs.ensureDir(params.out);

  const name = (params.name || 'Siki');
  const out = path.resolve(params.out);
  await packager({
    dir: params.dir,
    out,
    name: params.platform === 'linux' && name === 'Siki' ? 'siki' : name,
    platform: params.platform as any,
    arch: params.arch as any,
    overwrite: true,
    icon: path.join(params.dir, 'assets', params.platform === 'darwin' ? 'app.icns' : 'icon.ico'),
    electronVersion: params.electronVersion,
    prune: false,
    asar: params.asar,
    afterExtract: [(buildPath, electronVersion, platform, arch, callback) => {
      removeLanguageFiles(buildPath).then(() => callback()).catch(callback);
    }]
  });
}

const removeLanguageFiles = async (buildPath: string) => {
  const localesPath = path.join(buildPath, "locales");
  if (!fs.existsSync(localesPath)) return;

  const keep = new Set([
    "ja.pak",
    "en-US.pak"
  ]);

  for (const file of fs.readdirSync(localesPath)) {
    if (file.endsWith(".pak") && !keep.has(file)) {
      fs.rmSync(path.join(localesPath, file), { force: true });
    }
  }
}
