{{ config(materialized='view') }}

select * from {{ source('nyctaxi', 'trips') }}
