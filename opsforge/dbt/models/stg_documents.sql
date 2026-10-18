{{ config(materialized='incremental', unique_key=['scope','kind','entity_id','version'], incremental_strategy='delete+insert') }}
select * from {{ source('raw','of_events') }}
-- Bounded demonstration dataset: scan all source revisions to include late arrivals.
-- A production partition watermark must use ingestion time, not only event_date.
