SELECT 
        month,
        total_score 
    FROM 
        user_score_summary_month
    WHERE 
    user_id = $1
    AND month >= NOW() -  $2::INTERVAL
    ORDER BY 
        month ASC, user_id;