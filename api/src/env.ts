export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    user: {
      sub: string;
      provider: string;
    };
  };
};
