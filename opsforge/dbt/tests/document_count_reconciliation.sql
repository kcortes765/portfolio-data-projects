select (select count(*) from {{ source('raw','of_events') }}) as source_count,
       (select count(*) from {{ ref('stg_documents') }}) as target_count
where (select count(*) from {{ source('raw','of_events') }})<>(select count(*) from {{ ref('stg_documents') }})
