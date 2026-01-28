"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPackager = runPackager;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_packager_1 = __importDefault(require("electron-packager"));
async function runPackager(params) {
    await fs_extra_1.default.ensureDir(params.out);
    const name = (params.name || 'Siki');
    const out = node_path_1.default.resolve(params.out);
    await (0, electron_packager_1.default)({
        dir: params.dir,
        out,
        name: params.platform === 'linux' && name === 'Siki' ? 'siki' : name,
        platform: params.platform,
        arch: params.arch,
        overwrite: true,
        icon: node_path_1.default.join(params.dir, 'assets', params.platform === 'darwin' ? 'app.icns' : 'icon.ico'),
        electronVersion: params.electronVersion,
        prune: false,
        asar: params.asar,
        afterExtract: [(buildPath, electronVersion, platform, arch, callback) => {
                removeLanguageFiles(buildPath).then(() => callback()).catch(callback);
            }]
    });
}
const removeLanguageFiles = async (buildPath) => {
    const localesPath = node_path_1.default.join(buildPath, "locales");
    if (!fs_extra_1.default.existsSync(localesPath))
        return;
    const keep = new Set([
        "ja.pak",
        "en-US.pak"
    ]);
    for (const file of fs_extra_1.default.readdirSync(localesPath)) {
        if (file.endsWith(".pak") && !keep.has(file)) {
            fs_extra_1.default.rmSync(node_path_1.default.join(localesPath, file), { force: true });
        }
    }
};
