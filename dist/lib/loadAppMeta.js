"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAppMeta = loadAppMeta;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function isStringArray(value) {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}
async function loadAppMeta(appRoot) {
    const metaPath = node_path_1.default.resolve(appRoot, 'app.json');
    const exists = await fs_extra_1.default.pathExists(metaPath);
    if (!exists) {
        throw new Error(`app.json not found: ${metaPath}`);
    }
    const json = await fs_extra_1.default.readJSON(metaPath);
    if (!isPlainObject(json)) {
        throw new Error('Invalid app.json format: must be an object');
    }
    if (typeof json.version !== 'string' || json.version.length === 0) {
        throw new Error('Invalid app.json format: version must be a non-empty string');
    }
    if ('electronVersion' in json && json.electronVersion !== undefined && typeof json.electronVersion !== 'string') {
        throw new Error('Invalid app.json format: electronVersion must be a string');
    }
    if (!isStringArray(json.supportedPlatforms)) {
        throw new Error('Invalid app.json format: supportedPlatforms must be string[]');
    }
    if (typeof json.asarFile !== 'string' || json.asarFile.length === 0) {
        throw new Error('Invalid app.json format: asarFile must be a non-empty string');
    }
    if (typeof json.asarSha512 !== 'string' || json.asarSha512.length === 0) {
        throw new Error('Invalid app.json format: asarSha512 must be a non-empty string');
    }
    if ('asarSize' in json && json.asarSize !== undefined && typeof json.asarSize !== 'number') {
        throw new Error('Invalid app.json format: asarSize must be a number');
    }
    return json;
}
