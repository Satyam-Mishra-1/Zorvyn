/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Render (or other) API origin, e.g. https://your-app.onrender.com — no trailing slash */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
