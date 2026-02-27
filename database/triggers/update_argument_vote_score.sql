-- Trigger to automatically update argument vote_score when votes change
-- This is more performant than calculating SUM on every query

-- 1. Create the Function
CREATE OR REPLACE FUNCTION update_argument_vote_score()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE arguments 
        SET vote_score = (SELECT COALESCE(SUM(vote), 0) FROM votes WHERE argument_id = NEW.argument_id)
        WHERE id = NEW.argument_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE arguments 
        SET vote_score = (SELECT COALESCE(SUM(vote), 0) FROM votes WHERE argument_id = OLD.argument_id)
        WHERE id = OLD.argument_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS trg_update_argument_vote_score ON votes;
CREATE TRIGGER trg_update_argument_vote_score
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_argument_vote_score();

-- 3. Initialize vote_score for existing arguments
UPDATE arguments 
SET vote_score = (
    SELECT COALESCE(SUM(vote), 0) 
    FROM votes 
    WHERE votes.argument_id = arguments.id
);
