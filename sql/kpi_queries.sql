-- ============================================================
-- KPI Queries for Zoryn Project E-Commerce App
-- MySQL-compatible
-- ============================================================

-- -------------------------------------------------------
-- 1. Total product views, add to cart, checkouts, purchases per period
-- -------------------------------------------------------

-- Daily KPIs
SELECT
    DATE(occurred_at) AS event_date,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN id END) AS total_views,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN id END) AS total_add_to_cart,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN id END) AS total_checkouts,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN id END) AS total_purchases
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY DATE(occurred_at)
ORDER BY event_date;

-- Weekly KPIs
SELECT
    YEARWEEK(occurred_at) AS event_week,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN id END) AS total_views,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN id END) AS total_add_to_cart,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN id END) AS total_checkouts,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN id END) AS total_purchases
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY YEARWEEK(occurred_at)
ORDER BY event_week;

-- Monthly KPIs
SELECT
    DATE_FORMAT(occurred_at, '%Y-%m') AS event_month,
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN id END) AS total_views,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN id END) AS total_add_to_cart,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN id END) AS total_checkouts,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN id END) AS total_purchases
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date
GROUP BY DATE_FORMAT(occurred_at, '%Y-%m')
ORDER BY event_month;

-- -------------------------------------------------------
-- 2. Conversion rates
-- -------------------------------------------------------
SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) AS checkout_starters,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) AS purchasers,
    ROUND(
        COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN user_id END), 0),
        2
    ) AS view_to_cart_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_id END), 0),
        2
    ) AS cart_to_checkout_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END), 0),
        2
    ) AS checkout_to_purchase_rate
FROM analytics_events
WHERE occurred_at >= :start_date
  AND occurred_at < :end_date;

-- -------------------------------------------------------
-- 3. Revenue and average cart
-- -------------------------------------------------------
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS average_cart,
    ROUND(AVG(items_count), 1) AS average_items_per_order
FROM (
    SELECT
        o.id,
        o.total_amount,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS items_count
    FROM orders o
    WHERE o.status IN ('PAID', 'DEMO_CONFIRMED', 'SHIPPED', 'DELIVERED')
      AND o.created_at >= :start_date
      AND o.created_at < :end_date
) sub;

-- -------------------------------------------------------
-- 4. Revenue by day
-- -------------------------------------------------------
SELECT
    DATE(created_at) AS order_date,
    COUNT(*) AS orders,
    SUM(total_amount) AS revenue,
    ROUND(AVG(total_amount), 2) AS average_cart
FROM orders
WHERE status IN ('PAID', 'DEMO_CONFIRMED', 'SHIPPED', 'DELIVERED')
  AND created_at >= :start_date
  AND created_at < :end_date
GROUP BY DATE(created_at)
ORDER BY order_date;
