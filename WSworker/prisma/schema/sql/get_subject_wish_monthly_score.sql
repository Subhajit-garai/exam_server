SELECT
    month,
    subject,
    total_right,
    total_wrong
FROM
    subject_score_summary_month
WHERE 
    user_id = $1
AND month >= NOW() -  $2::INTERVAL
ORDER BY
    month ASC,
    user_id;