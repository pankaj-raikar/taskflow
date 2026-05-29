type DatabaseEnv = {
  DATABASE_URL?: string;
  VERCEL?: string;
};

export function getDatabaseUrl(env: DatabaseEnv = process.env as DatabaseEnv) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.VERCEL) return "/tmp/taskflow.db";
  return "./dev.db";
}
