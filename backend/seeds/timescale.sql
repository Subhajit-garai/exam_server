
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




