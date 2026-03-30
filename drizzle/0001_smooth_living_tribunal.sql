CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`merchant` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`category` enum('food','shopping','transport','entertainment','bills','health','other') NOT NULL,
	`description` text,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('steps','heartRate','calories','distance','activeMinutes','sleepDuration','bloodPressure','bloodOxygen') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`recordedAt` timestamp NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthSyncLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncStatus` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`metricsCount` int DEFAULT 0,
	`errorMessage` text,
	`syncStartedAt` timestamp NOT NULL,
	`syncCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthSyncLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`healthKitEnabled` boolean DEFAULT false,
	`autoSyncEnabled` boolean DEFAULT true,
	`syncIntervalMinutes` int DEFAULT 15,
	`healthKitAuthToken` text,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
