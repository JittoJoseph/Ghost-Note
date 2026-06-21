import bcrypt from "bcryptjs";

bcrypt.setRandomFallback((len: number) => {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)));
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
}
