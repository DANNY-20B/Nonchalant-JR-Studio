-- ============================================================================
-- NONCHALANT JR STUDIO — PRIVATE PERSONAL eFOOTBALL GAMING ARCHIVE
-- Migration: 20261014_init_nonchalant_studio.sql
-- Description: Strictly private database schema for a single user's gaming history.
-- No multiplayer, no tournaments, no public profiles, no shared rooms.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Strictly Private to Owner)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    gamer_tag TEXT NOT NULL DEFAULT 'NONCHALANT JR',
    email TEXT,
    division TEXT DEFAULT 'Division 1 (Top 100)',
    platform TEXT DEFAULT 'PlayStation 5 & Mobile',
    efootball_id TEXT DEFAULT 'NJR-904-8821',
    favorite_club TEXT DEFAULT 'Real Madrid / Brazil XI',
    avatar_url TEXT DEFAULT 'assets/bg.jpg',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile upon Supabase user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, gamer_tag, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'nonchalant_jr'),
        COALESCE(NEW.raw_user_meta_data->>'gamer_tag', 'NONCHALANT JR'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'assets/bg.jpg')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. PERSONAL MATCH RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_date DATE DEFAULT CURRENT_DATE,
    match_time TIME DEFAULT CURRENT_TIME,
    opponent TEXT NOT NULL,
    my_team TEXT DEFAULT 'NONCHALANT JR XI',
    opp_team TEXT DEFAULT 'Opponent Team',
    my_score INT NOT NULL DEFAULT 0 CHECK (my_score >= 0),
    opp_score INT NOT NULL DEFAULT 0 CHECK (opp_score >= 0),
    result VARCHAR(2) NOT NULL CHECK (result IN ('W', 'D', 'L')),
    competition TEXT DEFAULT 'Division 1 Online',
    match_type TEXT DEFAULT 'Ranked Match',
    formation_used TEXT DEFAULT '4-2-1-3',
    manager_used TEXT DEFAULT 'Pep Guardiola',
    goalscorers TEXT,
    rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
    notes TEXT,
    screenshot_url TEXT,
    video_url TEXT,
    media_storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_matches_date ON public.personal_matches(user_id, match_date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_matches_result ON public.personal_matches(user_id, result);
CREATE INDEX IF NOT EXISTS idx_personal_matches_opp ON public.personal_matches(user_id, opponent);

-- ----------------------------------------------------------------------------
-- 3. GAMEPLAY RECORDINGS & HIGHLIGHTS LIBRARY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gameplay_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.personal_matches(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    video_url TEXT NOT NULL,
    storage_path TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT DEFAULT 'video/mp4',
    thumbnail_url TEXT DEFAULT 'assets/bg.jpg',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_user ON public.gameplay_recordings(user_id, date DESC);

-- ----------------------------------------------------------------------------
-- 4. TROPHY ROOM & CUP HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date_won DATE DEFAULT CURRENT_DATE,
    season TEXT DEFAULT 'eFootball Season 2026',
    category TEXT DEFAULT 'Championship' CHECK (category IN ('Championship', 'Cup Final', 'Division Milestone', 'Achievement')),
    placement TEXT DEFAULT 'champion' CHECK (placement IN ('champion', 'runner_up', 'bronze', 'achievement')),
    final_opponent TEXT,
    final_score TEXT,
    image_url TEXT DEFAULT 'assets/bg.jpg',
    linked_match_id UUID REFERENCES public.personal_matches(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trophies_user ON public.trophies(user_id, date_won DESC);

-- ----------------------------------------------------------------------------
-- 5. GAME PLANS & TACTICAL LAB
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    formation TEXT NOT NULL DEFAULT '4-2-1-3',
    manager TEXT DEFAULT 'Pep Guardiola',
    playstyle TEXT NOT NULL DEFAULT 'Quick Counter',
    description TEXT,
    when_to_use TEXT,
    offensive_instructions JSONB DEFAULT '{"attacking1": "None", "attacking2": "None"}'::JSONB,
    defensive_instructions JSONB DEFAULT '{"defensive1": "None", "defensive2": "None"}'::JSONB,
    player_roles JSONB DEFAULT '{"captain": "Lionel Messi", "penalty": "Cristiano Ronaldo", "shortFK": "Lionel Messi", "longFK": "Roberto Carlos"}'::JSONB,
    nodes JSONB DEFAULT '[]'::JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_plans_user ON public.game_plans(user_id);

-- ----------------------------------------------------------------------------
-- 6. STARTING ELEVEN & SQUADS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.squad_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    squad_name TEXT NOT NULL DEFAULT 'Primary Starting XI',
    manager JSONB DEFAULT '{"name": "Pep Guardiola", "playstyle": "Quick Counter", "boost": "+1 Acceleration"}'::JSONB,
    roles JSONB DEFAULT '{"captain": "Lionel Messi", "penalty": "Cristiano Ronaldo", "shortFK": "Lionel Messi", "longFK": "Roberto Carlos"}'::JSONB,
    starting_xi JSONB DEFAULT '[]'::JSONB,
    subs JSONB DEFAULT '[]'::JSONB,
    formation TEXT DEFAULT '4-2-1-3',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_setups_user ON public.squad_setups(user_id);

-- ============================================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- Only the authenticated account can read, create, update, or delete personal data.
-- No other user can access or view any records.
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameplay_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_setups ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Owner can view own profile" ON public.profiles;
CREATE POLICY "Owner can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owner can update own profile" ON public.profiles;
CREATE POLICY "Owner can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Matches Policies
DROP POLICY IF EXISTS "Owner can manage own matches" ON public.personal_matches;
CREATE POLICY "Owner can manage own matches"
    ON public.personal_matches FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Recordings Policies
DROP POLICY IF EXISTS "Owner can manage own recordings" ON public.gameplay_recordings;
CREATE POLICY "Owner can manage own recordings"
    ON public.gameplay_recordings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trophies Policies
DROP POLICY IF EXISTS "Owner can manage own trophies" ON public.trophies;
CREATE POLICY "Owner can manage own trophies"
    ON public.trophies FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Game Plans Policies
DROP POLICY IF EXISTS "Owner can manage own game plans" ON public.game_plans;
CREATE POLICY "Owner can manage own game plans"
    ON public.game_plans FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Squads Policies
DROP POLICY IF EXISTS "Owner can manage own squads" ON public.squad_setups;
CREATE POLICY "Owner can manage own squads"
    ON public.squad_setups FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
