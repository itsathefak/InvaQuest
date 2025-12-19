-- Create game_sessions table to track user activity
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    game_type text NOT NULL, -- 'quiz', 'puzzle', 'geoguesser', 'identify'
    difficulty text,         -- 'easy', 'medium', 'hard'
    score integer DEFAULT 0,
    max_score integer DEFAULT 0,
    xp_earned integer DEFAULT 0,
    duration_seconds integer,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Game sessions are viewable by everyone."
  ON public.game_sessions FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own game sessions."
  ON public.game_sessions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Index for faster profile lookups
CREATE INDEX IF NOT EXISTS game_sessions_user_id_idx ON public.game_sessions(user_id);
