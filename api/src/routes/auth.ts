import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { users } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/password';
import { Env } from '../env';

const authRouter = new Hono<Env>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db = drizzle(c.env.DB);

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json({ error: 'Email already exists' }, 409);
  }

  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();

  try {
    await db.insert(users).values({
      id: userId,
      provider: 'web',
      email,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    if (!c.env.JWT_SECRET) {
      return c.json({ error: 'Internal Server Error' }, 500);
    }

    const payload = {
      sub: userId,
      provider: 'web',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 week
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    return c.json({ token, message: 'User registered successfully' }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  if (!c.env.JWT_SECRET) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  const payload = {
    sub: user.id,
    provider: user.provider,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 week
  };

  const token = await sign(payload, c.env.JWT_SECRET);

  return c.json({ token });
});

export default authRouter;
