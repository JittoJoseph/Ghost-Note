export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    FRONTEND_URL?: string;
    INTERNAL_SERVICE_SECRET: string;
    MESSAGE_ENCRYPTION_KEY: string;
    BOT: Fetcher;
  };
  Variables: {
    user: {
      sub: string;
      provider: string;
    };
  };
};
