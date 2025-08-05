CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "email" varchar UNIQUE NOT NULL,
  "password" varchar,
  "username" varchar UNIQUE,
  "bio" text,
  "avatar_url" text,
  "cook_frequency" varchar,
  "cook_constraints" text[],
  "xp" int DEFAULT 0,
  "is_private" boolean,
  "created_at" timestamp DEFAULT 'now',
  "last_seen" timestamp DEFAULT 'now'
);

CREATE TABLE "cooking_sessions" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "user_id" uuid,
  "club_id" uuid,
  "title" varchar,
  "photo_url" text,
  "ingredients" text[],
  "duration" int,
  "cuisine_type" varchar,
  "difficulty" int,
  "tags" text[],
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "challenges" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "title" varchar,
  "challenge_img" text,
  "description" text,
  "constraint_text" varchar,
  "start_date" date,
  "end_date" date,
  "reward_xp" int DEFAULT 100,
  "created_by" uuid
);

CREATE TABLE "challenge_participants" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "challenge_id" uuid,
  "user_id" uuid,
  "status" varchar,
  "session_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "followers" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "follower_id" uuid,
  "followed_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "friend_requests" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "sender_id" uuid,
  "receiver_id" uuid,
  "status" varchar,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "likes" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "user_id" uuid,
  "session_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "comments" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "user_id" uuid,
  "session_id" uuid,
  "content" text,
  "parent_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "user_id" uuid,
  "type" varchar,
  "source_user_id" uuid,
  "message" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "saved_sessions" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "user_id" uuid,
  "session_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "sender_id" uuid,
  "receiver_id" uuid,
  "content" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "clubs" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "name" varchar,
  "description" text,
  "avatar_url" text,
  "is_private" boolean DEFAULT false,
  "created_by" uuid,
  "created_at" timestamp DEFAULT 'now'
);

CREATE TABLE "club_members" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "club_id" uuid,
  "user_id" uuid,
  "role" varchar,
  "joined_at" timestamp DEFAULT 'now'
);

CREATE TABLE "club_challenges" (
  "id" uuid PRIMARY KEY DEFAULT 'uuid',
  "club_id" uuid,
  "challenge_id" uuid,
  "created_at" timestamp DEFAULT 'now'
);

ALTER TABLE "cooking_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "cooking_sessions" ADD FOREIGN KEY ("club_id") REFERENCES "clubs" ("id");

ALTER TABLE "challenges" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id");

ALTER TABLE "challenge_participants" ADD FOREIGN KEY ("challenge_id") REFERENCES "challenges" ("id");

ALTER TABLE "challenge_participants" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "challenge_participants" ADD FOREIGN KEY ("session_id") REFERENCES "cooking_sessions" ("id");

ALTER TABLE "followers" ADD FOREIGN KEY ("follower_id") REFERENCES "users" ("id");

ALTER TABLE "followers" ADD FOREIGN KEY ("followed_id") REFERENCES "users" ("id");

ALTER TABLE "friend_requests" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id");

ALTER TABLE "friend_requests" ADD FOREIGN KEY ("receiver_id") REFERENCES "users" ("id");

ALTER TABLE "likes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "likes" ADD FOREIGN KEY ("session_id") REFERENCES "cooking_sessions" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("session_id") REFERENCES "cooking_sessions" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("parent_id") REFERENCES "comments" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("source_user_id") REFERENCES "users" ("id");

ALTER TABLE "saved_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "saved_sessions" ADD FOREIGN KEY ("session_id") REFERENCES "cooking_sessions" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("receiver_id") REFERENCES "users" ("id");

ALTER TABLE "clubs" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id");

ALTER TABLE "club_members" ADD FOREIGN KEY ("club_id") REFERENCES "clubs" ("id");

ALTER TABLE "club_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "club_challenges" ADD FOREIGN KEY ("club_id") REFERENCES "clubs" ("id");

ALTER TABLE "club_challenges" ADD FOREIGN KEY ("challenge_id") REFERENCES "challenges" ("id");
