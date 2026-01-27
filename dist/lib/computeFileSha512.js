"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFileSha512Base64 = computeFileSha512Base64;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
async function computeFileSha512Base64(filePath) {
    return await new Promise((resolve, reject) => {
        const hash = node_crypto_1.default.createHash('sha512');
        const stream = node_fs_1.default.createReadStream(filePath);
        stream.on('error', reject);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('base64')));
    });
}
