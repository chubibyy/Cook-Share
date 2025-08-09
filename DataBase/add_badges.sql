-- This script updates the database schema to support a badge collection feature.

-- Step 1: Add a column to the 'challenges' table to store the URL of the badge image.
-- This allows each challenge to have a unique badge reward.
ALTER TABLE public.challenges
ADD COLUMN badge_image_url TEXT;

COMMENT ON COLUMN public.challenges.badge_image_url IS 'URL of the badge image awarded for completing the challenge.';

-- Step 2: Create a new table to track which badges each user has earned.
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    badge_image_url TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- A user can only earn the badge from a specific challenge once.
    CONSTRAINT user_unique_badge_from_challenge UNIQUE (user_id, challenge_id)
);

COMMENT ON TABLE public.user_badges IS 'Tracks the badges earned by users from completing challenges.';

-- Example of how to add a badge to a challenge:
-- UPDATE public.challenges
-- SET badge_image_url = 'https://example.com/path/to/your/badge.png'
-- WHERE id = 'your-challenge-id';
