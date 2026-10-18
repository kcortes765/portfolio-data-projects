select * from {{ ref('mart_reconciliation') }}
where status='matched' and (amount_delta<>0 or quantity_delta<>0 or currency_mismatch>0 or unit_mismatch>0 or invoice_count=0 or delivery_count=0)
