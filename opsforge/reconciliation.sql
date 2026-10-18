WITH ranked AS (
 SELECT *, ROW_NUMBER() OVER(PARTITION BY scope,kind,entity_id ORDER BY version DESC) AS rn
 FROM of_events WHERE scope = :scope
), current_events AS (SELECT * FROM ranked WHERE rn=1), orders AS (
 SELECT * FROM current_events WHERE kind='order'
), invoices AS (
 SELECT o.entity_id,COUNT(i.entity_id) AS invoice_count,
 COALESCE(SUM(CASE WHEN i.currency=o.currency THEN i.amount_minor ELSE 0 END),0) AS invoiced_minor,
 COALESCE(SUM(CASE WHEN i.currency<>o.currency THEN 1 ELSE 0 END),0) AS currency_mismatch
 FROM orders o LEFT JOIN current_events i ON i.order_id=o.order_id AND i.kind='invoice'
 GROUP BY o.entity_id
), deliveries AS (
 SELECT o.entity_id,COUNT(d.entity_id) AS delivery_count,
 COALESCE(SUM(CASE WHEN d.unit=o.unit THEN d.quantity ELSE 0 END),0) AS delivered_qty,
 COALESCE(SUM(CASE WHEN d.unit<>o.unit THEN 1 ELSE 0 END),0) AS unit_mismatch
 FROM orders o LEFT JOIN current_events d ON d.order_id=o.order_id AND d.kind='delivery'
 GROUP BY o.entity_id
), joined AS (
 SELECT o.order_id,o.currency,o.unit,o.event_date,o.amount_minor AS ordered_minor,o.quantity AS ordered_qty,
 i.invoice_count,i.invoiced_minor,i.currency_mismatch,d.delivery_count,d.delivered_qty,d.unit_mismatch,
 i.invoiced_minor-o.amount_minor AS amount_delta,d.delivered_qty-o.quantity AS quantity_delta
 FROM orders o JOIN invoices i ON o.entity_id=i.entity_id JOIN deliveries d ON o.entity_id=d.entity_id
)
SELECT *, CASE WHEN currency_mismatch>0 THEN 'currency' WHEN unit_mismatch>0 THEN 'unit'
 WHEN invoice_count=0 THEN 'missing_invoice' WHEN delivery_count=0 THEN 'missing_delivery'
 WHEN amount_delta<>0 THEN 'amount' WHEN quantity_delta<>0 THEN 'quantity' ELSE 'matched' END AS status
FROM joined ORDER BY order_id
