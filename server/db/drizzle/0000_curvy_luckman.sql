CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`date` text DEFAULT (current_date) NOT NULL,
	`is_verified` integer DEFAULT false,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL
);
