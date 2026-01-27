"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateElectron = validateElectron;
const semver_1 = __importDefault(require("semver"));
function maxToRange(maxElectron) {
    // "30.x.x" -> "<31.0.0"
    if (maxElectron.includes('x') || maxElectron.includes('*')) {
        const coerced = semver_1.default.coerce(maxElectron.replace(/x|\*/g, '0'));
        if (!coerced) {
            throw new Error(`Invalid maxElectron: ${maxElectron}`);
        }
        const upper = semver_1.default.inc(coerced, 'major');
        if (!upper) {
            throw new Error(`Failed to compute upper bound for maxElectron: ${maxElectron}`);
        }
        return `<${upper}`;
    }
    return `<=${maxElectron}`;
}
function validateElectron(params) {
    const requested = semver_1.default.valid(params.requestedElectron);
    if (!requested) {
        throw new Error(`Invalid --electron version: ${params.requestedElectron}`);
    }
    const manifestOk = semver_1.default.satisfies(requested, params.manifestRange, { includePrerelease: true });
    if (!manifestOk) {
        throw new Error(`Electron version ${requested} does not satisfy manifest range: ${params.manifestRange}`);
    }
    const appRange = `>=${params.minElectron} ${maxToRange(params.maxElectron)}`;
    const appOk = semver_1.default.satisfies(requested, appRange, { includePrerelease: true });
    if (!appOk) {
        throw new Error(`Electron version ${requested} does not satisfy app range: ${appRange}`);
    }
}
