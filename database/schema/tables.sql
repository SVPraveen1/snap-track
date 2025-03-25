-- User Profiles Table
CREATE TABLE public.user_profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    display_name text,
    email text,
    birthday date,
    phone_number text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Health Table
CREATE TABLE public.user_health (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    age integer NOT NULL,
    weight numeric NOT NULL, -- in kg
    height numeric NOT NULL, -- in cm
    gender varchar(10) NOT NULL CHECK (gender IN ('male', 'female')),
    activity_level varchar(20) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal varchar(10) NOT NULL CHECK (goal IN ('maintain', 'lose', 'gain')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Weekly Plans Table
CREATE TABLE public.weekly_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    plan jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Food Entries Table
CREATE TABLE public.food_entries (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    food_name text NOT NULL,
    food_data jsonb,
    entry_type text NOT NULL CHECK (entry_type IN ('manual', 'image')),
    meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    image_url text,
    consumed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
); 