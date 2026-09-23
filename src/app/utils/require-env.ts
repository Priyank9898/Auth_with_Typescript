export function requireEnv(name: string): string {
  const constant = process.env[name];
  if (!constant) {
    throw new Error(`Missing required environment:${constant}`);
  }
  return constant;
}
