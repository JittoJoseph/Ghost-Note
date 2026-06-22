export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    FRONTEND_URL?: string;
    INTERNAL_SERVICE_SECRET: string;
    TELEGRAM_BOT_URL: string;
  };
  Variables: {
    user: {
      sub: string;
      provider: string;
    };
  };
};
