-- Create the sessions_with_interactions view
CREATE OR REPLACE VIEW sessions_with_interactions AS
SELECT 
  cs.id,
  cs.user_id,
  cs.club_id,
  cs.title,
  cs.photo_url,
  cs.ingredients,
  cs.duration,
  cs.cuisine_type,
  cs.difficulty,
  cs.tags,
  cs.created_at,
  
  -- User information
  u.username,
  u.avatar_url as user_avatar,
  u.cooking_level,
  
  -- Interaction counts
  COALESCE(like_counts.count, 0) as likesCount,
  COALESCE(comment_counts.count, 0) as commentsCount,
  
  -- User-specific interactions (these will be NULL if no user_id is provided)
  CASE WHEN user_likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END as isLiked,
  CASE WHEN user_saves.user_id IS NOT NULL THEN TRUE ELSE FALSE END as isSaved
  
FROM cooking_sessions cs
LEFT JOIN users u ON cs.user_id = u.id

-- Count likes per session
LEFT JOIN (
  SELECT session_id, COUNT(*) as count
  FROM likes
  GROUP BY session_id
) like_counts ON cs.id = like_counts.session_id

-- Count comments per session
LEFT JOIN (
  SELECT session_id, COUNT(*) as count
  FROM comments
  GROUP BY session_id
) comment_counts ON cs.id = comment_counts.session_id

-- Check if current user liked this session (will be NULL if no user context)
LEFT JOIN likes user_likes ON cs.id = user_likes.session_id

-- Check if current user saved this session (will be NULL if no user context)  
LEFT JOIN saved_sessions user_saves ON cs.id = user_saves.session_id

ORDER BY cs.created_at DESC;