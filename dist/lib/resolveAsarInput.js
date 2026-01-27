"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAsarInput = resolveAsarInput;
const fs_extra_1 = __importDefault(require("fs-extra"));
async function resolveAsarInput(params) {
    const inputPath = params.inputPath;
    const exists = await fs_extra_1.default.pathExists(inputPath);
    if (!exists) {
        throw new Error(`asar input not found: ${inputPath}`);
    }
    const lower = inputPath.toLowerCase();
    if (lower.endsWith('.asar')) {
        return inputPath;
    }
    throw new Error(`Unsupported asar input type (expected .asar): ${inputPath}`);
}
