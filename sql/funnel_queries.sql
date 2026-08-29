-- ============================================================
-- Funnel Analysis Queries for Zoryn Project
-- MySQL-compatible
-- ============================================================

-- -------------------------------------------------------
-- 1. Daily funnel
-- -------------------------------------------------------
SELECT
    DATE(occurred_at) AS event_date,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) AS checkout_starters,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY DATE(occurred_at)
ORDER BY event_date;

-- -------------------------------------------------------
-- 2. Funnel by category (from product_view properties)
-- -------------------------------------------------------
SELECT
    JSON_UNQUOTE(JSON_EXTRACT(properties_json, '$.category')) AS category,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) AS checkout_starters,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY category
ORDER BY viewers DESC;

-- -------------------------------------------------------
-- 3. Funnel by device type
-- -------------------------------------------------------
SELECT
    JSON_UNQUOTE(JSON_EXTRACT(properties_json, '$.device_type')) AS device,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) AS checkout_starters,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY device
ORDER BY viewers DESC;

-- -------------------------------------------------------
-- 4. Users who added to cart but didn't purchase
-- -------------------------------------------------------
SELECT DISTINCT
    ae.user_id,
    ae.anonymous_id,
    MIN(CASE WHEN ae.event_name = 'product_view' THEN ae.occurred_at END) AS first_view,
    MIN(CASE WHEN ae.event_name = 'add_to_cart' THEN ae.occurred_at END) AS first_cart_add
FROM analytics_events ae
WHERE ae.occurred_at >= :start_date
  AND ae.occurred_at < :end_date
  AND ae.user_id IS NOT NULL
  AND ae.user_id IN (
      SELECT user_id FROM analytics_events WHERE event_name = 'add_to_cart'
  )
  AND ae.user_id NOT IN (
      SELECT user_id FROM analytics_events WHERE event_name = 'purchase'
  )
GROUP BY ae.user_id, ae.anonymous_id
ORDER BY first_cart_add DESC;
