-- Community Sightings Table
-- Separate from feed posts - dedicated to map-based species reporting

CREATE TABLE IF NOT EXISTS public.community_sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  species_name TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  province TEXT,
  country TEXT DEFAULT 'Canada',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.community_sightings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Community sightings are viewable by everyone"
  ON community_sightings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create sightings"
  ON community_sightings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sightings"
  ON community_sightings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sightings"
  ON community_sightings FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_community_sightings_location ON community_sightings (latitude, longitude);
CREATE INDEX idx_community_sightings_user ON community_sightings (user_id);
CREATE INDEX idx_community_sightings_created ON community_sightings (created_at DESC);
