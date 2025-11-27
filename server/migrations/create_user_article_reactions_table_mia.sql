-- Create user_article_reactions table for likes and bookmarks
-- This allows users to like and bookmark articles
-- Note: user_id is stored as INTEGER but without foreign key constraint
-- because user table is in a different database (alia_database)

CREATE TABLE IF NOT EXISTS user_article_reactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  article_id VARCHAR(255) NOT NULL,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'bookmark')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure a user can only have one reaction of each type per article
  CONSTRAINT unique_user_article_reaction UNIQUE (user_id, article_id, reaction_type)
);

-- Index for faster lookups by article_id (to get reaction counts)
CREATE INDEX IF NOT EXISTS idx_user_article_reactions_article
  ON user_article_reactions(article_id, reaction_type);

-- Index for faster lookups by user_id (to get user's reactions)
CREATE INDEX IF NOT EXISTS idx_user_article_reactions_user
  ON user_article_reactions(user_id);

-- Index for faster lookups by user and article (to check if user reacted)
CREATE INDEX IF NOT EXISTS idx_user_article_reactions_user_article
  ON user_article_reactions(user_id, article_id);
