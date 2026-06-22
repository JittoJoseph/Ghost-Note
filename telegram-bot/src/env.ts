import type { KVNamespace } from "@cloudflare/workers-types";

export type Env = {
  Bindings: {
    API: Fetcher;
    TELEGRAM_BOT_TOKEN: string;
    INTERNAL_SERVICE_SECRET: string;
    BOT_STATE_KV: KVNamespace;
  };
};
