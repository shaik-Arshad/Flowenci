-- SQL Migration Script for Supabase
-- Run this in your Supabase SQL Editor to create the necessary tables.

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    target_companies TEXT,
    interview_timeline TEXT,
    experience_level TEXT DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    category TEXT,
    difficulty TEXT DEFAULT 'medium',
    use_star BOOLEAN DEFAULT FALSE,
    guidance TEXT,
    target_duration_min INTEGER DEFAULT 60,
    target_duration_max INTEGER DEFAULT 120,
    tags TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    s3_key TEXT NOT NULL,
    duration_seconds FLOAT,
    attempt_number INTEGER DEFAULT 1,
    transcript TEXT,
    transcription_status TEXT DEFAULT 'pending', -- pending | done | failed
    analysis_status TEXT DEFAULT 'pending', -- pending | processing | done | failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID UNIQUE REFERENCES public.recordings(id) ON DELETE CASCADE,
    filler_word_count INTEGER DEFAULT 0,
    filler_words_detail JSONB,
    words_per_minute FLOAT,
    total_word_count INTEGER,
    pause_count INTEGER,
    star_score FLOAT,
    star_breakdown JSONB,
    pronunciation_issues JSONB,
    confidence_score FLOAT,
    confidence_flags JSONB,
    readiness_score FLOAT,
    coaching_tips JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Interview Sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT DEFAULT 'generic',
    interview_type TEXT DEFAULT 'behavioral',
    role TEXT,
    status TEXT DEFAULT 'active', -- active | completed | abandoned
    conversation_history JSONB DEFAULT '[]',
    session_feedback JSONB,
    overall_score FLOAT,
    total_turns INTEGER DEFAULT 0,
    duration_seconds FLOAT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Optional but recommended for production)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ... add policies ...
