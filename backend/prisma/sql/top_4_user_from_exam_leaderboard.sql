WITH top_3 AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
    WHERE l.exam_id = $1  -- exam_id
    ORDER BY l.rank ASC
    LIMIT 3
),
my_rank AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
    WHERE l.exam_id = $1
    AND l.user_id = $2  -- user_id
),
extra_user AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
    WHERE l.exam_id = $1
    AND l.rank > (SELECT MAX(rank) FROM top_3)
    ORDER BY l.rank ASC
    LIMIT 1
)
SELECT * FROM top_3
UNION ALL
SELECT * FROM my_rank WHERE user_id NOT IN (SELECT user_id FROM top_3)
UNION ALL
SELECT * FROM extra_user WHERE $2 IN (SELECT user_id FROM top_3);
