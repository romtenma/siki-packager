"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReleaseAsset = downloadReleaseAsset;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
async function downloadReleaseAsset(params) {
    const url = `https://github.com/${params.owner}/${params.repo}/releases/download/${params.tag}/${params.asset}`;
    await fs_extra_1.default.ensureDir(params.outDir);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to download release asset: ${url} (${res.status})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = node_path_1.default.resolve(params.outDir, params.asset);
    await fs_extra_1.default.writeFile(dest, buf);
    return dest;
}
