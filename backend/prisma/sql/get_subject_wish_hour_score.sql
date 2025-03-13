SELECT
hour,
    subject,
    total_right,
    total_wrong
FROM
    subject_score_summary_hour
WHERE
    user_id = $1
AND hour >= NOW() -  $2::INTERVAL
ORDER BY
    hour ASC,
    user_id;