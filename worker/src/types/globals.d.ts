// Global type declarations for Cloudflare Workers environment
/// <reference types="@cloudflare/workers-types" />

declare global {
  // These are provided by Cloudflare Workers runtime
  const console: Console;
  const fetch: typeof globalThis.fetch;
}

export { };

