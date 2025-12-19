-- Add location columns to posts table
ALTER TABLE posts 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add index for potential geospatial queries later
CREATE INDEX idx_posts_location ON posts (latitude, longitude);
