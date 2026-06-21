CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`password_hash` text NOT NULL,
	`visit_count` integer DEFAULT 0 NOT NULL,
	`is_used` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`opened_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_slug_unique` ON `links` (`slug`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `links` (`user_id`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `link_id_idx` ON `submissions` (`link_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`email` text,
	`password_hash` text,
	`telegram_chat_id` text,
	`telegram_username` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_chat_id_unique` ON `users` (`telegram_chat_id`);