-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_updated_at_user_health
    BEFORE UPDATE ON public.user_health
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at_weekly_plans
    BEFORE UPDATE ON public.weekly_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at_food_entries
    BEFORE UPDATE ON public.food_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 