-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for executi
CREATE TABLE public.challenge_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid,
  user_id uuid,
  status character varying,
  session_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT challenge_participants_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT challenge_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cooking_sessions(id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying,
  challenge_img text,
  description text,
  constraint_text character varying,
  start_date date,
  end_date date,
  reward_xp integer DEFAULT 100,
  created_by uuid,
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.club_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  club_id uuid,
  challenge_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT club_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT club_challenges_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.club_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  club_id uuid,
  user_id uuid,
  role character varying,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT club_members_pkey PRIMARY KEY (id),
  CONSTRAINT club_members_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.clubs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  description text,
  avatar_url text,
  is_private boolean DEFAULT false,
  created_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT clubs_pkey PRIMARY KEY (id),
  CONSTRAINT clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  content text,
  parent_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id),
  CONSTRAINT comments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cooking_sessions(id)
);
CREATE TABLE public.cooking_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  club_id uuid,
  title character varying,
  photo_url text,
  ingredients ARRAY,
  duration integer,
  cuisine_type character varying,
  difficulty integer,
  tags ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT cooking_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT cooking_sessions_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT cooking_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid,
  followed_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT followers_pkey PRIMARY KEY (id),
  CONSTRAINT followers_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id),
  CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id)
);
CREATE TABLE public.friend_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  status character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT friend_requests_pkey PRIMARY KEY (id),
  CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cooking_sessions(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type character varying,
  source_user_id uuid,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_source_user_id_fkey FOREIGN KEY (source_user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.saved_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT saved_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT saved_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT saved_sessions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cooking_sessions(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  username character varying UNIQUE,
  bio text,
  avatar_url text,
  cook_frequency character varying,
  cook_constraints ARRAY,
  xp integer DEFAULT 0,
  is_private boolean,
  created_at timestamp without time zone DEFAULT now(),
  last_seen timestamp without time zone DEFAULT now(),
  cooking_level text,
  cooking_for ARRAY,
  onboarding_completed boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Club messages (chat/forum)
CREATE TABLE IF NOT EXISTS public.club_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp without time zone DEFAULT now()
);

-- Mapping sessions ↔ clubs (partage multi-clubs)
CREATE TABLE IF NOT EXISTS public.club_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.cooking_sessions(id) ON DELETE CASCADE,
  created_at timestamp without time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS club_sessions_unique
  ON public.club_sessions (club_id, session_id);