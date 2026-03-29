SELECT
day,
    subject,
    total_right,
    total_wrong
FROM
    subject_score_summary_day
WHERE
    user_id = $1
AND day >= NOW() -  $2::INTERVAL
ORDER BY
    day ASC,
    user_id;