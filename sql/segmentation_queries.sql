-- ============================================================
-- Segmentation Queries for Zoryn Project
-- MySQL-compatible
-- ============================================================

-- -------------------------------------------------------
-- 1. By device type
-- -------------------------------------------------------
SELECT
    JSON_UNQUOTE(JSON_EXTRACT(properties_json, '$.device_type')) AS device,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers,
    ROUND(
        COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END), 0),
        2
    ) AS conversion_rate
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY device
ORDER BY unique_users DESC;

-- -------------------------------------------------------
-- 2. By user type (new vs returning)
-- -------------------------------------------------------
SELECT
    CASE
        WHEN first_seen.first_event_date = DATE(occurred_at) THEN 'Nouveau'
        ELSE 'Recurrent'
    END AS user_type,
    COUNT(DISTINCT ae.user_id) AS unique_users,
    COUNT(DISTINCT CASE WHEN ae.event_name = 'product_view' THEN ae.user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN ae.event_name = 'add_to_cart' THEN ae.user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN ae.event_name = 'purchase' THEN ae.user_id END) AS purchasers
FROM analytics_events ae
JOIN (
    SELECT user_id, MIN(DATE(occurred_at)) AS first_event_date
    FROM analytics_events
    WHERE user_id IS NOT NULL
    GROUP BY user_id
) first_seen ON ae.user_id = first_seen.user_id
WHERE ae.occurred_at >= :start_date
  AND ae.occurred_at < :end_date
GROUP BY user_type
ORDER BY unique_users DESC;

-- -------------------------------------------------------
-- 3. By category
-- -------------------------------------------------------
SELECT
    JSON_UNQUOTE(JSON_EXTRACT(properties_json, '$.category')) AS category,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY category
ORDER BY unique_users DESC;

-- -------------------------------------------------------
-- 4. By engagement level
-- -------------------------------------------------------
SELECT
    engagement_level,
    COUNT(*) AS user_count,
    ROUND(AVG(cart_adds), 2) AS avg_cart_adds,
    ROUND(AVG(purchases), 2) AS avg_purchases
FROM (
    SELECT
        user_id,
        COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN id END) AS views,
        COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN id END) AS cart_adds,
        COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN id END) AS purchases,
        CASE
            WHEN COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN id END) > 0 THEN 'Acheteur'
            WHEN COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN id END) > 0 THEN 'Panier sans achat'
            WHEN COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN id END) > 1 THEN 'Multi-vues'
            ELSE 'Une seule vue'
        END AS engagement_level
    FROM analytics_events
    WHERE occurred_at >= :start_date
      AND occurred_at < :end_date
      AND user_id IS NOT NULL
    GROUP BY user_id
) sub
GROUP BY engagement_level
ORDER BY user_count DESC;
