import path from 'node:path';
import fs from 'fs-extra';

export async function downloadReleaseAsset(params: {
  owner: string;
  repo: string;
  tag: string;
  asset: string;
  outDir: string;
}): Promise<string> {
  const url = `https://github.com/${params.owner}/${params.repo}/releases/download/${params.tag}/${params.asset}`;
  await fs.ensureDir(params.outDir);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download release asset: ${url} (${res.status})`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const dest = path.resolve(params.outDir, params.asset);
  await fs.writeFile(dest, buf);
  return dest;
}
