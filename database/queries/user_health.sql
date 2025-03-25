-- Insert user health data
INSERT INTO public.user_health (
    user_id,
    age,
    weight,
    height,
    gender,
    activity_level,
    goal
) VALUES (
    $1, -- user_id
    $2, -- age
    $3, -- weight
    $4, -- height
    $5, -- gender
    $6, -- activity_level
    $7  -- goal
);

-- Get user health data
SELECT *
FROM public.user_health
WHERE user_id = $1;

-- Update user health data
UPDATE public.user_health
SET
    age = $1,
    weight = $2,
    height = $3,
    gender = $4,
    activity_level = $5,
    goal = $6,
    updated_at = timezone('utc'::text, now())
WHERE user_id = $7; 