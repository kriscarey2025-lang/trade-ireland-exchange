-- Create a function to auto-complete swap when both users have reviewed
CREATE OR REPLACE FUNCTION public.auto_complete_swap_on_review()
RETURNS TRIGGER AS $$
DECLARE
  _conversation RECORD;
  _other_review_exists BOOLEAN;
  _service_id UUID;
BEGIN
  -- Get conversation details
  SELECT c.*, c.service_id INTO _conversation
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Skip if already completed or closed
  IF _conversation.swap_status IN ('completed', 'closed') THEN
    RETURN NEW;
  END IF;
  
  -- Check if the other participant has also reviewed
  SELECT EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.conversation_id = NEW.conversation_id
    AND r.reviewer_id != NEW.reviewer_id
  ) INTO _other_review_exists;
  
  -- If both have reviewed, auto-complete the swap
  IF _other_review_exists THEN
    -- Update conversation status to completed
    UPDATE conversations
    SET swap_status = 'completed',
        completed_by_1 = true,
        completed_by_2 = true
    WHERE id = NEW.conversation_id;
    
    -- Increment completed swaps count on the service
    IF _conversation.service_id IS NOT NULL THEN
      UPDATE services
      SET completed_swaps_count = COALESCE(completed_swaps_count, 0) + 1
      WHERE id = _conversation.service_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_complete_swap ON reviews;

-- Create trigger that fires after review insert
CREATE TRIGGER trigger_auto_complete_swap
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION auto_complete_swap_on_review();