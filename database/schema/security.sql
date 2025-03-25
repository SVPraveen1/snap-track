-- Enable Row Level Security
ALTER TABLE public.user_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;

-- User Health Policies
CREATE POLICY "Users can view their own health data"
    ON public.user_health FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data"
    ON public.user_health FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health data"
    ON public.user_health FOR UPDATE
    USING (auth.uid() = user_id);

-- Weekly Plans Policies
CREATE POLICY "Users can view their own plans"
    ON public.weekly_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
    ON public.weekly_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
    ON public.weekly_plans FOR UPDATE
    USING (auth.uid() = user_id);

-- Food Entries Policies
CREATE POLICY "Users can view their own food entries"
    ON public.food_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food entries"
    ON public.food_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries"
    ON public.food_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries"
    ON public.food_entries FOR DELETE
    USING (auth.uid() = user_id); 