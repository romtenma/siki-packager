"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPackager = runPackager;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_packager_1 = __importDefault(require("electron-packager"));
const setLanguages = require('electron-packager-languages');
async function runPackager(params) {
    await fs_extra_1.default.ensureDir(params.out);
    const appName = `Siki`;
    const out = node_path_1.default.resolve(params.out);
    await (0, electron_packager_1.default)({
        dir: params.dir,
        out,
        name: appName,
        platform: params.platform,
        arch: params.arch,
        overwrite: true,
        icon: node_path_1.default.join(params.dir, 'assets', params.platform === 'darwin' ? 'icon.icns' : 'icon.ico'),
        electronVersion: params.electronVersion,
        prune: false,
        asar: params.asar,
        afterCopy: [setLanguages(['ja', 'ja-JP'])]
    });
}
