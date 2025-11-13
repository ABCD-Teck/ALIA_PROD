-- Create user_article_tags table for per-article custom tagging
-- This allows users to add custom tags to individual articles
-- Note: user_id is stored as INTEGER but without foreign key constraint
-- because user table is in a different database (alia_database)

CREATE TABLE IF NOT EXISTS user_article_tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  article_id VARCHAR(255) NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure a user can't add the same tag to an article twice
  CONSTRAINT unique_user_article_tag UNIQUE (user_id, article_id, tag_name)
);

-- Index for faster lookups by article_id and user_id
CREATE INDEX IF NOT EXISTS idx_user_article_tags_article_user
  ON user_article_tags(article_id, user_id);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_article_tags_user
  ON user_article_tags(user_id);

-- Index for faster lookups by tag_name and user_id (for user's custom tags listing)
CREATE INDEX IF NOT EXISTS idx_user_article_tags_user_tag
  ON user_article_tags(user_id, tag_name);
