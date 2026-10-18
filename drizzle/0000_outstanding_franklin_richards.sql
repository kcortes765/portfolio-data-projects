CREATE TABLE `of_events` (
	`scope` text NOT NULL,
	`kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`order_id` text NOT NULL,
	`version` integer NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	`event_date` text NOT NULL,
	`body_hash` text NOT NULL,
	`raw_json` text NOT NULL,
	`source_file` text NOT NULL,
	`source_row` integer NOT NULL,
	`batch_hash` text NOT NULL,
	PRIMARY KEY(`scope`, `kind`, `entity_id`, `version`),
	FOREIGN KEY (`scope`) REFERENCES `of_spaces`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "of_events_version" CHECK("of_events"."version">0),
	CONSTRAINT "of_events_amount" CHECK("of_events"."amount_minor">=0),
	CONSTRAINT "of_events_quantity" CHECK("of_events"."quantity">0)
);
--> statement-breakpoint
CREATE INDEX `of_events_order` ON `of_events` (`scope`,`order_id`);--> statement-breakpoint
CREATE TABLE `of_guards` (
	`id` text PRIMARY KEY NOT NULL,
	`valid` integer NOT NULL,
	CONSTRAINT "of_guards_valid" CHECK("of_guards"."valid"=1)
);
--> statement-breakpoint
CREATE TABLE `of_quarantine` (
	`scope` text NOT NULL,
	`source_file` text NOT NULL,
	`source_row` integer NOT NULL,
	`raw_json` text NOT NULL,
	`reason` text NOT NULL,
	PRIMARY KEY(`scope`, `source_file`, `source_row`, `reason`),
	FOREIGN KEY (`scope`) REFERENCES `of_spaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `of_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`scenario` text NOT NULL,
	`status` text NOT NULL,
	`started` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`accepted` integer NOT NULL,
	`duplicates` integer NOT NULL,
	`rejected` integer NOT NULL,
	`revision` integer NOT NULL,
	`message` text NOT NULL,
	`batch_hash` text NOT NULL,
	FOREIGN KEY (`scope`) REFERENCES `of_spaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `of_runs_scope_time` ON `of_runs` (`scope`,`started`);--> statement-breakpoint
CREATE TABLE `of_spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `of_spaces_expiry` ON `of_spaces` (`expires`);