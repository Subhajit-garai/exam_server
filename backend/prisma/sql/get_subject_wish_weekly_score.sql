SELECT
week,
    subject,
    total_right,
    total_wrong
FROM
    subject_score_summary_week
WHERE 
    user_id = $1
AND week >= NOW() -  $2::INTERVAL
ORDER BY
    week ASC,
    user_id;