export type Manifest = {
  latest?: {
    stable?: string;
    beta?: string;
  };
  apps: Array<{
    version: string;
    tag: string;
    asset: string;
    asarSha512: string;
    asarSize?: number;
    electronVersion?: string;
    supportedPlatforms: string[];
    notes?: string;
  }>;
};
