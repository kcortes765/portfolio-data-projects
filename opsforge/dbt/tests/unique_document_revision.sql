select scope,kind,entity_id,version,count(*) as n from {{ ref('stg_documents') }}
group by scope,kind,entity_id,version having count(*)>1
