
        -- Enable TimescaleDB extension
        CREATE EXTENSION IF NOT EXISTS timescaledb;
        -- Creating hyper tabele
        SELECT create_hypertable('timescale_score', by_range('time'));



        -- creating score _summart basd on day ,week ,month

-- hour ---> user_score_summary_day

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_minute'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_minute
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('10 minute', time) AS minute,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY minute, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_minute',
    start_offset => INTERVAL '30 minute',
    end_offset => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
);





-- hour ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_hour'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_hour
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 hour', time) AS hour,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY hour, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_hour',
    start_offset => INTERVAL '3 hour',
    end_offset => INTERVAL '30 minute',
    schedule_interval => INTERVAL '1 hour'
);


-- day ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_day'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_day
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 day', time) AS day,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY day, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_day',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day'
);


-- @@@@@@@@@@@@@@@
        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_week'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_week
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1week', time) AS week,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY week, user_id
        WITH NO DATA;
    END IF;
END $$;


SELECT add_continuous_aggregate_policy(
    'user_score_summary_week',
    start_offset => INTERVAL '3 week',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 week'
 );


 --@@@@@@@@@@@@@@@@@
        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_month'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_month
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 month', time) AS month,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY month, user_id
        WITH NO DATA;
    END IF;
END $$;
                SELECT add_continuous_aggregate_policy(
                    'user_score_summary_month',
                    start_offset => INTERVAL '3 month',
                    end_offset => INTERVAL '1 day',
                    schedule_interval => INTERVAL '1 month'
                 );

 -- creatin subject_score_summary based on day,week , month



DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_minute'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_minute
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('10 minute', time) AS minute,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            minute, user_id, key
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'subject_score_summary_minute',
    start_offset => INTERVAL '30 minute',
    end_offset => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
);




-- hour ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_hour'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_hour
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 hour', time) AS hour,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            hour, user_id, key
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'subject_score_summary_hour',
    start_offset => INTERVAL '3 hour',
    end_offset => INTERVAL '30 minute',
    schedule_interval => INTERVAL '1 hour'
);


        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_day'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_day
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 day', time) AS day,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            day, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
    'subject_score_summary_day',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day'
);


        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_week'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_week
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 week', time) AS week,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right,
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            week, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
                    'subject_score_summary_week',
                    start_offset => INTERVAL '3 weeks',
                    end_offset => INTERVAL '1 hour',
                    schedule_interval => INTERVAL '1 week'
                 );



        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_month'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_month
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 month', time) AS month,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right,
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            month, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
                    'subject_score_summary_month',
                    start_offset => INTERVAL '3 months',
                    end_offset => INTERVAL '1 day',
                    schedule_interval => INTERVAL '1 month'
                 );


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

CREATE TRIGGER events_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION notify_event_change();

CREATE OR REPLACE FUNCTION notify_mock_set_change() RETURNS trigger AS $$
DECLARE
  action TEXT := TG_OP;  -- 'INSERT' or 'UPDATE'
BEGIN
  PERFORM pg_notify(
    'mock_set_channel',
    json_build_object(
      'id', NEW.id,
      'action', action
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mockset_trigger
AFTER INSERT OR UPDATE ON mock_questions_set
FOR EACH ROW EXECUTE FUNCTION notify_mock_set_change();



-- rank tregger

CREATE OR REPLACE FUNCTION update_leaderboard_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update leaderboard with highest score
  INSERT INTO leaderboard (id,user_id, exam_id, score,rank, updated_at)
  VALUES (NEW.leaderboard_id,NEW.user_id, NEW.exam_id, NEW.score,0, now())
  ON CONFLICT (user_id, exam_id) DO UPDATE
  SET score = GREATEST(leaderboard.score, EXCLUDED.score),
      updated_at = now();

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


-- tregger

CREATE OR REPLACE TRIGGER trigger_update_leaderboard_rank
AFTER INSERT OR UPDATE ON score
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_rank();




