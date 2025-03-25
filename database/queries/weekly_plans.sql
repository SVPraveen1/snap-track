-- Insert weekly plan
INSERT INTO public.weekly_plans (
    user_id,
    plan
) VALUES (
    $1, -- user_id
    $2  -- plan (jsonb)
);

-- Get latest weekly plan
SELECT *
FROM public.weekly_plans
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- Get all weekly plans for a user
SELECT *
FROM public.weekly_plans
WHERE user_id = $1
ORDER BY created_at DESC;

-- Update weekly plan
UPDATE public.weekly_plans
SET
    plan = $1,
    updated_at = timezone('utc'::text, now())
WHERE id = $2 AND user_id = $3; 