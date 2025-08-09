-- RPC function to toggle likes
CREATE OR REPLACE FUNCTION toggle_like(p_session_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM likes 
    WHERE session_id = p_session_id AND user_id = p_user_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM likes 
    WHERE session_id = p_session_id AND user_id = p_user_id;
    RETURN FALSE; -- unliked
  ELSE
    -- Add like
    INSERT INTO likes (session_id, user_id) 
    VALUES (p_session_id, p_user_id);
    RETURN TRUE; -- liked
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC function to toggle saves
CREATE OR REPLACE FUNCTION toggle_save(p_session_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  save_exists BOOLEAN;
BEGIN
  -- Check if save already exists
  SELECT EXISTS(
    SELECT 1 FROM saved_sessions 
    WHERE session_id = p_session_id AND user_id = p_user_id
  ) INTO save_exists;
  
  IF save_exists THEN
    -- Remove save
    DELETE FROM saved_sessions 
    WHERE session_id = p_session_id AND user_id = p_user_id;
    RETURN FALSE; -- unsaved
  ELSE
    -- Add save
    INSERT INTO saved_sessions (session_id, user_id) 
    VALUES (p_session_id, p_user_id);
    RETURN TRUE; -- saved
  END IF;
END;
$$ LANGUAGE plpgsql;