-- Create user_article_tags table for per-article custom tagging
-- This allows users to add custom tags to individual articles

CREATE TABLE IF NOT EXISTS user_article_tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  article_id VARCHAR(255) NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure a user can't add the same tag to an article twice
  CONSTRAINT unique_user_article_tag UNIQUE (user_id, article_id, tag_name),

  -- Foreign key to user table (note: "user" is quoted because it's a reserved word)
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Index for faster lookups by article_id and user_id
CREATE INDEX IF NOT EXISTS idx_user_article_tags_article_user
  ON user_article_tags(article_id, user_id);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_article_tags_user
  ON user_article_tags(user_id);
