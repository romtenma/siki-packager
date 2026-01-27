"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadManifest = loadManifest;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function isStringArray(value) {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}
async function loadManifest(releasesRoot) {
    const manifestPath = node_path_1.default.resolve(releasesRoot, 'manifest.json');
    const exists = await fs_extra_1.default.pathExists(manifestPath);
    if (!exists) {
        throw new Error(`manifest.json not found: ${manifestPath}`);
    }
    const json = await fs_extra_1.default.readJSON(manifestPath);
    if (!isPlainObject(json) || !Array.isArray(json.apps)) {
        throw new Error('Invalid manifest.json format: missing apps[]');
    }
    for (const [index, app] of json.apps.entries()) {
        if (!isPlainObject(app) || typeof app.version !== 'string') {
            throw new Error(`Invalid manifest.json format: apps[${index}] must have version`);
        }
        if (typeof app.tag !== 'string' || app.tag.length === 0) {
            throw new Error(`Invalid manifest.json format: apps[${index}].tag must be a non-empty string`);
        }
        if (typeof app.asset !== 'string' || app.asset.length === 0) {
            throw new Error(`Invalid manifest.json format: apps[${index}].asset must be a non-empty string`);
        }
        if (typeof app.asarSha512 !== 'string' || app.asarSha512.length === 0) {
            throw new Error(`Invalid manifest.json format: apps[${index}].asarSha512 must be a non-empty string`);
        }
        if (!isStringArray(app.supportedPlatforms)) {
            throw new Error(`Invalid manifest.json format: apps[${index}].supportedPlatforms must be string[]`);
        }
        if ('asarSize' in app && app.asarSize !== undefined && typeof app.asarSize !== 'number') {
            throw new Error(`Invalid manifest.json format: apps[${index}].asarSize must be a number`);
        }
        if ('electronVersion' in app &&
            app.electronVersion !== undefined &&
            typeof app.electronVersion !== 'string') {
            throw new Error(`Invalid manifest.json format: apps[${index}].electronVersion must be a string`);
        }
        if ('notes' in app && app.notes !== undefined && typeof app.notes !== 'string') {
            throw new Error(`Invalid manifest.json format: apps[${index}].notes must be a string`);
        }
    }
    if ('latest' in json && json.latest !== undefined) {
        if (!isPlainObject(json.latest)) {
            throw new Error('Invalid manifest.json format: latest must be an object');
        }
        if ('stable' in json.latest &&
            json.latest.stable !== undefined &&
            typeof json.latest.stable !== 'string') {
            throw new Error('Invalid manifest.json format: latest.stable must be a string');
        }
        if ('beta' in json.latest &&
            json.latest.beta !== undefined &&
            typeof json.latest.beta !== 'string') {
            throw new Error('Invalid manifest.json format: latest.beta must be a string');
        }
    }
    return json;
}
