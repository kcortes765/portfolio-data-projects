with ranked as (
 select *,row_number() over(partition by scope,kind,entity_id order by version desc) as rn
 from {{ ref('stg_documents') }}
)
select * from ranked where rn=1
