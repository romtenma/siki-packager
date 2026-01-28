#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const node_path_1 = __importDefault(require("node:path"));
const semver_1 = __importDefault(require("semver"));
const loadManifest_1 = require("./lib/loadManifest");
const prepareWorkdir_1 = require("./lib/prepareWorkdir");
const runPackager_1 = require("./lib/runPackager");
const node_process_1 = require("node:process");
const resolveReleasesRoot_1 = require("./lib/resolveReleasesRoot");
const computeFileSha512_1 = require("./lib/computeFileSha512");
const downloadReleaseAsset_1 = require("./lib/downloadReleaseAsset");
function computeLatestFromApps(manifest, kind) {
    const candidates = manifest.apps
        .map((a) => semver_1.default.valid(a.version))
        .filter((v) => !!v)
        .filter((v) => (kind === 'beta' ? semver_1.default.prerelease(v) !== null : semver_1.default.prerelease(v) === null));
    if (candidates.length === 0)
        return undefined;
    return candidates.sort(semver_1.default.rcompare)[0];
}
function resolveRequestedAppVersion(requested, manifest) {
    const normalized = requested.trim();
    const alias = normalized.toLowerCase();
    const want = alias === 'latest' || alias === 'latest-stable'
        ? 'stable'
        : alias === 'beta' || alias === 'latest-beta'
            ? 'beta'
            : undefined;
    if (!want)
        return normalized;
    const fromManifest = manifest.latest?.[want];
    const resolved = fromManifest ?? computeLatestFromApps(manifest, want);
    if (!resolved) {
        throw new Error(`No ${want} app versions found in manifest`);
    }
    return resolved;
}
function resolveStableForBeta(manifest, betaVersion) {
    const parsed = semver_1.default.parse(betaVersion);
    if (!parsed)
        return undefined;
    const stableVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
    return manifest.apps.some((a) => a.version === stableVersion) ? stableVersion : undefined;
}
function resolveDefaultPlatform() {
    const p = process.platform;
    if (p === 'win32' || p === 'linux' || p === 'darwin')
        return p;
    throw new Error(`Unsupported current platform: ${p}. Please specify --platform explicitly (win32|linux|darwin).`);
}
function resolveDefaultArch() {
    const a = process.arch;
    if (a === 'x64' || a === 'ia32' || a === 'arm64')
        return a;
    throw new Error(`Unsupported current arch: ${a}. Please specify --arch explicitly (x64|ia32|arm64).`);
}
function formatAppList(manifest) {
    const versions = manifest.apps.map((a) => a.version);
    const stable = manifest.latest?.stable;
    const beta = manifest.latest?.beta;
    const rows = versions.map((version) => {
        const tags = [];
        if (stable === version)
            tags.push('latest-stable');
        if (beta === version)
            tags.push('latest-beta');
        const suffix = tags.length > 0 ? ` (${tags.join(', ')})` : '';
        return `- ${version}${suffix}`;
    });
    if (rows.length === 0) {
        return 'No app versions found in manifest.';
    }
    return ['Available Siki versions:', ...rows].join('\n');
}
async function main() {
    const program = new commander_1.Command();
    program
        .name('siki-packager')
        .description('Build Siki Electron package from siki-asar-releases')
        .option('--app <version>', 'App version (default: latest) e.g. 1.1.0, 0.39.4-beta.1, latest, latest-stable, latest-beta', 'latest')
        .option('--name <name>', 'Application name (default: Siki)', 'Siki')
        .option('--electron <version>', 'Electron version (default: manifest.json electronVersion)')
        .option('--platform <platform>', 'Target platform (default: current) win32|linux|darwin')
        .option('--arch <arch>', 'Target arch (default: current) x64|ia32|arm64')
        .option('--no-asar', 'Disable output asar packaging (default: enabled)')
        .option('--releases <path>', 'Path or URL to siki-asar-releases (default: https://github.com/romtenma/siki-asar-releases)', 'https://github.com/romtenma/siki-asar-releases')
        .option('--out <path>', 'Output directory (default: ./out)', node_path_1.default.resolve(process.cwd(), 'out'))
        .option('--list-apps', 'List available app versions in manifest and exit')
        .parse(process.argv);
    const opts = program.opts();
    const platform = opts.platform ?? resolveDefaultPlatform();
    const arch = opts.arch ?? resolveDefaultArch();
    const outDir = node_path_1.default.resolve(process.cwd(), opts.out);
    const requestedApp = opts.app ?? 'latest';
    const releasesResolution = await (0, resolveReleasesRoot_1.resolveReleasesRoot)(opts.releases);
    try {
        const manifest = await (0, loadManifest_1.loadManifest)(releasesResolution.releasesRoot);
        if (opts.listApps) {
            console.log(formatAppList(manifest));
            return;
        }
        const requestedAlias = requestedApp.trim().toLowerCase();
        const allowBetaFallback = requestedAlias === 'beta' || requestedAlias === 'latest-beta';
        let resolvedAppVersion = resolveRequestedAppVersion(requestedApp, manifest);
        if (allowBetaFallback && semver_1.default.prerelease(resolvedAppVersion)) {
            const stableVersion = resolveStableForBeta(manifest, resolvedAppVersion);
            if (stableVersion) {
                console.log(`Requested beta version ${resolvedAppVersion} has a stable release ${stableVersion}. Building stable instead.`);
                resolvedAppVersion = stableVersion;
            }
        }
        const entry = manifest.apps.find((a) => a.version === resolvedAppVersion);
        if (!entry) {
            throw new Error(`App version not found in manifest: ${resolvedAppVersion}`);
        }
        const electronVersion = opts.electron ?? entry.electronVersion;
        if (!electronVersion) {
            throw new Error('Electron version is required: specify --electron, or set manifest.json app "electronVersion".');
        }
        const validatedElectron = semver_1.default.valid(electronVersion);
        if (!validatedElectron) {
            throw new Error(`Invalid Electron version: ${electronVersion}`);
        }
        console.log('Packaging with options:');
        console.log(`- Siki version: ${resolvedAppVersion}`);
        console.log(`- Electron version: ${validatedElectron}`);
        console.log(`- Platform: ${platform}`);
        console.log(`- Arch: ${arch}`);
        console.log(`- Output directory: ${outDir}`);
        console.log(`- ASAR output: ${opts.asar ? 'enabled' : 'disabled'}`);
        const asarInputPath = releasesResolution.source === 'github' && releasesResolution.github
            ? await (0, downloadReleaseAsset_1.downloadReleaseAsset)({
                owner: releasesResolution.github.owner,
                repo: releasesResolution.github.repo,
                tag: entry.tag,
                asset: entry.asset,
                outDir: node_path_1.default.resolve(releasesResolution.releasesRoot, '__assets')
            })
            : node_path_1.default.resolve(releasesResolution.releasesRoot, entry.asset);
        const expectedSha512 = entry.asarSha512.trim();
        const actualSha512 = (await (0, computeFileSha512_1.computeFileSha512Base64)(asarInputPath)).trim();
        if (actualSha512 !== expectedSha512) {
            throw new Error(`asar sha512 mismatch: expected ${expectedSha512}, got ${actualSha512} (${asarInputPath})`);
        }
        const workdir = await (0, prepareWorkdir_1.prepareWorkdir)({
            appVersion: resolvedAppVersion,
            electronVersion: validatedElectron,
            platform,
            arch,
            asarInputPath
        });
        await (0, runPackager_1.runPackager)({
            dir: workdir,
            out: outDir,
            name: opts.name,
            appVersion: resolvedAppVersion,
            electronVersion: validatedElectron,
            platform,
            arch,
            asar: opts.asar
        });
    }
    finally {
        await releasesResolution.cleanup?.();
    }
    console.log(`Done. Output: ${outDir}`);
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    (0, node_process_1.exit)(1);
});
