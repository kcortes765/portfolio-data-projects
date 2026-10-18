-- The source's apparent plant-month key is NOT unique. Preserve every input
-- observation and aggregate explicitly; never silently deduplicate by plant name.
CREATE TABLE observations AS
SELECT
    row_number() OVER () AS source_row,
    printf('%04d-%02d', CAST(anio AS INTEGER), CAST(mes AS INTEGER)) AS period,
    tecnologia AS technology,
    subsistema AS subsystem,
    clasificacion AS classification,
    codigo_central AS plant_code,
    CAST(replace(generacion_mwh, ',', '.') AS DECIMAL(30,10)) AS mwh,
    CAST(fecha_act AS DATE) AS source_updated
FROM raw;

CREATE TABLE monthly AS
SELECT period, technology, subsystem, classification,
       SUM(mwh) AS mwh, COUNT(*) AS source_rows,
       COUNT(DISTINCT plant_code) AS plant_codes
FROM observations
GROUP BY period, technology, subsystem, classification;
