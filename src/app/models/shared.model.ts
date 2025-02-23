export interface SavedTokens {
  [key: string]: { name: string; token: string | null };
}

export interface Host {
  [key: string]: { name: string; token: string | null };
}

export interface Cache {
  currentHost: string | null;
  proxyUrl: string | null;
}
