-- Insert food entry
INSERT INTO public.food_entries (
    user_id,
    food_name,
    food_data,
    consumed_at
) VALUES (
    $1, -- user_id
    $2, -- food_name
    $3, -- food_data (jsonb)
    $4  -- consumed_at
);

-- Get food entries for a specific day
SELECT *
FROM public.food_entries
WHERE user_id = $1
  AND consumed_at >= $2
  AND consumed_at < $3
ORDER BY consumed_at DESC;

-- Get food entries for a date range
SELECT *
FROM public.food_entries
WHERE user_id = $1
  AND consumed_at >= $2
  AND consumed_at <= $3
ORDER BY consumed_at DESC;

-- Update food entry
UPDATE public.food_entries
SET
    food_name = $1,
    food_data = $2,
    consumed_at = $3,
    updated_at = timezone('utc'::text, now())
WHERE id = $4 AND user_id = $5;

-- Delete food entry
DELETE FROM public.food_entries
WHERE id = $1 AND user_id = $2; 