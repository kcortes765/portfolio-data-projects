with orders as (select * from {{ ref('stg_current') }} where kind='order'),
invoices as (
 select o.scope,o.entity_id,count(i.entity_id) as invoice_count,
 coalesce(sum(case when i.currency=o.currency then i.amount_minor else 0 end),0) as invoiced_minor,
 coalesce(sum(case when i.currency<>o.currency then 1 else 0 end),0) as currency_mismatch
 from orders o left join {{ ref('stg_current') }} i on i.scope=o.scope and i.order_id=o.order_id and i.kind='invoice'
 group by o.scope,o.entity_id
), deliveries as (
 select o.scope,o.entity_id,count(d.entity_id) as delivery_count,
 coalesce(sum(case when d.unit=o.unit then d.quantity else 0 end),0) as delivered_qty,
 coalesce(sum(case when d.unit<>o.unit then 1 else 0 end),0) as unit_mismatch
 from orders o left join {{ ref('stg_current') }} d on d.scope=o.scope and d.order_id=o.order_id and d.kind='delivery'
 group by o.scope,o.entity_id
), joined as (
 select o.scope,o.order_id,o.currency,o.unit,o.event_date,o.amount_minor as ordered_minor,o.quantity as ordered_qty,
 i.invoice_count,i.invoiced_minor,i.currency_mismatch,d.delivery_count,d.delivered_qty,d.unit_mismatch,
 i.invoiced_minor-o.amount_minor as amount_delta,d.delivered_qty-o.quantity as quantity_delta
 from orders o join invoices i on o.scope=i.scope and o.entity_id=i.entity_id join deliveries d on o.scope=d.scope and o.entity_id=d.entity_id
)
select *,case when currency_mismatch>0 then 'currency' when unit_mismatch>0 then 'unit'
when invoice_count=0 then 'missing_invoice' when delivery_count=0 then 'missing_delivery'
when amount_delta<>0 then 'amount' when quantity_delta<>0 then 'quantity' else 'matched' end as status
from joined
