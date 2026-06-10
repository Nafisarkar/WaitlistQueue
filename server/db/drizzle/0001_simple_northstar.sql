CREATE TABLE `otp_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`otp` text NOT NULL,
	`expiry_time` text NOT NULL
);
