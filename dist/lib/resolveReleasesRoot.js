"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveReleasesRoot = resolveReleasesRoot;
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function isHttpUrl(value) {
    return value.startsWith('https://') || value.startsWith('http://');
}
function parseGitHubRepoUrl(repoUrl) {
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
async function downloadToFile(url, filePath) {
    const res = await fetch(url);
    if (!res.ok)
        return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs_extra_1.default.writeFile(filePath, buf);
    return true;
}
function resolveRawManifestUrl(params) {
    const { owner, repo } = params;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/manifest.json`;
}
async function resolveReleasesRoot(input) {
    const normalized = input.trim();
    if (!isHttpUrl(normalized)) {
        return {
            releasesRoot: node_path_1.default.resolve(process.cwd(), normalized),
            source: 'local'
        };
    }
    const { owner, repo } = parseGitHubRepoUrl(normalized);
    const baseDir = node_path_1.default.resolve(node_os_1.default.tmpdir(), 'siki-builder-releases', `${owner}-${repo}`, node_crypto_1.default.randomUUID());
    await fs_extra_1.default.ensureDir(baseDir);
    const manifestUrl = resolveRawManifestUrl({ owner, repo });
    const manifestPath = node_path_1.default.resolve(baseDir, 'manifest.json');
    const ok = await downloadToFile(manifestUrl, manifestPath);
    if (!ok) {
        throw new Error(`Failed to download manifest.json: ${manifestUrl}`);
    }
    const releasesRoot = baseDir;
    return {
        releasesRoot,
        cleanup: async () => {
            await fs_extra_1.default.remove(baseDir);
        },
        source: 'github',
        github: { owner, repo }
    };
}
