-- Alter user_article_tags table to change user_id from INTEGER to VARCHAR
-- This is necessary because the main application database (alia_database)
-- uses UUID for user_id, but we initially created this table with INTEGER

-- First, drop the existing indexes that depend on user_id
DROP INDEX IF EXISTS idx_user_article_tags_article_user;
DROP INDEX IF EXISTS idx_user_article_tags_user;
DROP INDEX IF EXISTS idx_user_article_tags_user_tag;

-- Drop the unique constraint that depends on user_id
ALTER TABLE user_article_tags DROP CONSTRAINT IF EXISTS unique_user_article_tag;

-- Alter the user_id column type
ALTER TABLE user_article_tags
ALTER COLUMN user_id TYPE VARCHAR(255);

-- Recreate the unique constraint
ALTER TABLE user_article_tags
ADD CONSTRAINT unique_user_article_tag UNIQUE (user_id, article_id, tag_name);

-- Recreate the indexes
CREATE INDEX idx_user_article_tags_article_user
  ON user_article_tags(article_id, user_id);

CREATE INDEX idx_user_article_tags_user
  ON user_article_tags(user_id);

CREATE INDEX idx_user_article_tags_user_tag
  ON user_article_tags(user_id, tag_name);
