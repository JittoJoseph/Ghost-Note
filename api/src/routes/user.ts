import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { Env } from '../env';

const userRouter = new Hono<Env>();

userRouter.use('/*', authMiddleware);

userRouter.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const sessionUser = c.get('user');

  const user = await db.select({
    id: users.id,
    email: users.email,
    provider: users.provider,
    telegramUsername: users.telegramUsername,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, sessionUser.sub)).get();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

export default userRouter;
