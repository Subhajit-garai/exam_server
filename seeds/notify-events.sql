

-- notify

CREATE OR REPLACE FUNCTION notify_event_change() RETURNS trigger AS $$
DECLARE
  action TEXT := TG_OP;  -- 'INSERT' or 'UPDATE'
BEGIN
  PERFORM pg_notify(
    'event_channel',
    json_build_object(
      'id', NEW.id,
      'action', action
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE  TRIGGER events_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION notify_event_change();



-- rank trigger

CREATE OR REPLACE FUNCTION update_leaderboard_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update leaderboard with highest score
  INSERT INTO leaderboard (id,user_id,exam_id,score,rank,time)
  VALUES (NEW.leaderboard_id,NEW.user_id, NEW.exam_id, NEW.score,0, now())
  ON CONFLICT (user_id, exam_id,time) DO UPDATE
  SET score = GREATEST(leaderboard.score, EXCLUDED.score),
      time = now();

  -- Update rank only if score has changed
  WITH ranked AS (
    SELECT user_id, exam_id, score,
           RANK() OVER (PARTITION BY exam_id ORDER BY score DESC) AS new_rank
    FROM leaderboard
  )
  UPDATE leaderboard l
  SET rank = r.new_rank
  FROM ranked r
  WHERE l.user_id = r.user_id 
    AND l.exam_id = r.exam_id 
    AND l.rank IS DISTINCT FROM r.new_rank;  -- Avoid unnecessary updates

	-- part 2
	INSERT INTO timescale_score (id,user_id, exam_id, score,not_attempt,topic_wise_result,result,time)
  VALUES (NEW.id,NEW.user_id, NEW.exam_id, NEW.score,NEW.not_attempt,NEW.topic_wise_result,NEW.result, NEW.time)
  ON CONFLICT (id, time) DO UPDATE
	  SET score = EXCLUDED.score, 
	      not_attempt = EXCLUDED.not_attempt,
	      topic_wise_result = EXCLUDED.topic_wise_result,
	      result = EXCLUDED.result;
	

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- trigger

CREATE OR REPLACE TRIGGER trigger_update_leaderboard_rank
AFTER INSERT OR UPDATE ON score
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_rank();




