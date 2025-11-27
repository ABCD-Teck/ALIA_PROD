-- Alter user_article_reactions table to use UUID for user_id instead of INTEGER
-- This matches the actual user ID type in the system

ALTER TABLE user_article_reactions
ALTER COLUMN user_id TYPE VARCHAR(255);
