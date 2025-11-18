SELECT 
        minute,
        total_score 
    FROM 
        user_score_summary_minute
    WHERE 
    user_id = $1
    AND minute >= NOW() -  $2::INTERVAL
    ORDER BY 
        minute ASC, user_id;
