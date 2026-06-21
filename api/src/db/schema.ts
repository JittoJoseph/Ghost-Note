import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'web' or 'telegram'
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  telegramChatId: text('telegram_chat_id').unique(),
  telegramUsername: text('telegram_username'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  visitCount: integer('visit_count').notNull().default(0),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  openedAt: integer('opened_at', { mode: 'timestamp' }),
}, (table) => {
  return {
    userIdIdx: index('user_id_idx').on(table.userId),
  };
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => {
  return {
    linkIdIdx: index('link_id_idx').on(table.linkId),
  };
});
