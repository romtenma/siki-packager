"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareWorkdir = prepareWorkdir;
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const extractAsar_1 = require("./extractAsar");
const resolveAsarInput_1 = require("./resolveAsarInput");
async function prepareWorkdir(params) {
    const base = node_path_1.default.resolve(node_os_1.default.tmpdir(), 'siki-builder');
    const workdir = node_path_1.default.resolve(base, `${params.appVersion}__electron-${params.electronVersion}__${params.platform}-${params.arch}`);
    await fs_extra_1.default.remove(workdir);
    await fs_extra_1.default.ensureDir(workdir);
    const asarPath = await (0, resolveAsarInput_1.resolveAsarInput)({ inputPath: params.asarInputPath, workdir });
    await (0, extractAsar_1.extractAsar)({ asarPath, outDir: workdir });
    const pkgJson = node_path_1.default.resolve(workdir, 'package.json');
    const mainJs = node_path_1.default.resolve(workdir, 'assets', 'main.js');
    const preloadJs = node_path_1.default.resolve(workdir, 'assets', 'main_preload.js');
    if (!(await fs_extra_1.default.pathExists(pkgJson))) {
        throw new Error(`Invalid app asar: missing package.json after extract: ${pkgJson}`);
    }
    if (!(await fs_extra_1.default.pathExists(mainJs))) {
        throw new Error(`Invalid app asar: missing main.js after extract: ${mainJs}`);
    }
    if (!(await fs_extra_1.default.pathExists(preloadJs))) {
        throw new Error(`Invalid app asar: missing main_preload.js after extract: ${preloadJs}`);
    }
    return workdir;
}
