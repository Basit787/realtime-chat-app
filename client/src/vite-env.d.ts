/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  // Base URL of the terms, privacy and cookie pages
  readonly VITE_LEGAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
