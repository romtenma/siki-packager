import path from 'node:path';
import fs from 'fs-extra';
import type { Manifest } from './types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export async function loadManifest(releasesRoot: string): Promise<Manifest> {
  const manifestPath = path.resolve(releasesRoot, 'manifest.json');
  const exists = await fs.pathExists(manifestPath);
  if (!exists) {
    throw new Error(`manifest.json not found: ${manifestPath}`);
  }

  const json: unknown = await fs.readJSON(manifestPath);
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
      throw new Error(
        `Invalid manifest.json format: apps[${index}].asarSha512 must be a non-empty string`
      );
    }
    if (!isStringArray(app.supportedPlatforms)) {
      throw new Error(
        `Invalid manifest.json format: apps[${index}].supportedPlatforms must be string[]`
      );
    }
    if ('asarSize' in app && app.asarSize !== undefined && typeof app.asarSize !== 'number') {
      throw new Error(`Invalid manifest.json format: apps[${index}].asarSize must be a number`);
    }
    if (
      'electronVersion' in app &&
      app.electronVersion !== undefined &&
      typeof app.electronVersion !== 'string'
    ) {
      throw new Error(
        `Invalid manifest.json format: apps[${index}].electronVersion must be a string`
      );
    }
    if ('notes' in app && app.notes !== undefined && typeof app.notes !== 'string') {
      throw new Error(`Invalid manifest.json format: apps[${index}].notes must be a string`);
    }
  }

  if ('latest' in json && json.latest !== undefined) {
    if (!isPlainObject(json.latest)) {
      throw new Error('Invalid manifest.json format: latest must be an object');
    }
    if (
      'stable' in json.latest &&
      json.latest.stable !== undefined &&
      typeof json.latest.stable !== 'string'
    ) {
      throw new Error('Invalid manifest.json format: latest.stable must be a string');
    }
    if (
      'beta' in json.latest &&
      json.latest.beta !== undefined &&
      typeof json.latest.beta !== 'string'
    ) {
      throw new Error('Invalid manifest.json format: latest.beta must be a string');
    }
  }

  return json as Manifest;
}
