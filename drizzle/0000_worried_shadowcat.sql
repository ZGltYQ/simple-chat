CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`sender` text NOT NULL,
	`topic_id` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_topic_id_unique` ON `messages` (`topic_id`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL
);
