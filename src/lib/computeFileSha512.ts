import crypto from 'node:crypto';
import fs from 'node:fs';

export async function computeFileSha512Base64(filePath: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha512');
    const stream = fs.createReadStream(filePath);

    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('base64')));
  });
}
