import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'fs-extra';

export type ReleasesResolution = {
  releasesRoot: string;
  cleanup?: () => Promise<void>;
  source: 'local' | 'github';
  github?: {
    owner: string;
    repo: string;
  };
};

function isHttpUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

function parseGitHubRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const url = new URL(repoUrl);
  if (url.hostname !== 'github.com') {
    throw new Error(`Unsupported releases URL host: ${url.hostname}`);
  }

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub repo URL: ${repoUrl}`);
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, '');
  return { owner, repo };
}

async function downloadToFile(url: string, filePath: string): Promise<boolean> {
  const res = await fetch(url);
  if (!res.ok) return false;

  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filePath, buf);
  return true;
}

function resolveRawManifestUrl(params: { owner: string; repo: string }): string {
  const { owner, repo } = params;
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/manifest.json`;
}

export async function resolveReleasesRoot(input: string): Promise<ReleasesResolution> {
  const normalized = input.trim();

  if (!isHttpUrl(normalized)) {
    return {
      releasesRoot: path.resolve(process.cwd(), normalized),
      source: 'local'
    };
  }

  const { owner, repo } = parseGitHubRepoUrl(normalized);
  const baseDir = path.resolve(
    os.tmpdir(),
    'siki-builder-releases',
    `${owner}-${repo}`,
    crypto.randomUUID()
  );
  await fs.ensureDir(baseDir);

  const manifestUrl = resolveRawManifestUrl({ owner, repo });
  const manifestPath = path.resolve(baseDir, 'manifest.json');
  const ok = await downloadToFile(manifestUrl, manifestPath);
  if (!ok) {
    throw new Error(`Failed to download manifest.json: ${manifestUrl}`);
  }

  const releasesRoot = baseDir;

  return {
    releasesRoot,
    cleanup: async () => {
      await fs.remove(baseDir);
    },
    source: 'github',
    github: { owner, repo }
  };
}
