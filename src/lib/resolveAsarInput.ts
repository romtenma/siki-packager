import path from 'node:path';
import fs from 'fs-extra';

export async function resolveAsarInput(params: {
  inputPath: string;
  workdir: string;
}): Promise<string> {
  const inputPath = params.inputPath;
  const exists = await fs.pathExists(inputPath);
  if (!exists) {
    throw new Error(`asar input not found: ${inputPath}`);
  }

  const lower = inputPath.toLowerCase();
  if (lower.endsWith('.asar')) {
    return inputPath;
  }

  throw new Error(`Unsupported asar input type (expected .asar): ${inputPath}`);
}
