SELECT 
        hour,
        total_score 
    FROM 
        user_score_summary_hour
    WHERE 
    user_id = $1
    AND hour >= NOW() -  $2::INTERVAL
    ORDER BY 
        hour ASC, user_id;
