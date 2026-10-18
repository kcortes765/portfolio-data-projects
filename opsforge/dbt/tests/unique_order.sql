select scope,order_id,count(*) as n from {{ ref('mart_reconciliation') }}
group by scope,order_id having count(*)>1
