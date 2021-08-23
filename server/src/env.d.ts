declare namespace NodeJS {
  export interface ProcessEnv {
    HOST: string;
    DATABASE: string;
    USERNAME: string;
    PASSWORD: string;
    PORT: string;
    SESSION_SECRET: string;
    CORS_ORIGIN: string;
    MIGRATION: string;
    USE_DB: string;
    DATABASE_URL: string;
  }
}
