import fs from 'fs-extra';

export async function extractAsar(params: { asarPath: string; outDir: string }): Promise<void> {
  const exists = await fs.pathExists(params.asarPath);
  if (!exists) {
    throw new Error(`asar not found: ${params.asarPath}`);
  }

  // Avoid relying on TS types shipped by the dependency.
  const asar = (await import('@electron/asar')) as unknown as {
    extractAll: (src: string, dest: string) => void;
  };

  asar.extractAll(params.asarPath, params.outDir);
}
