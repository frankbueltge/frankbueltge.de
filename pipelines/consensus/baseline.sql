-- The Consensus — longitudinal echo baseline (G1 path).
-- Re-implements pipelines/consensus/refresh.py's v2 measurement in SQL over the
-- historical GKG archive. Window is passed as @from / @to (UTC days).
WITH pool AS (
  -- one row per URL, the earliest sighting wins (mirrors the nightly's
  -- first-write-wins dedupe; ORDER BY makes it deterministic, not ANY_VALUE)
  SELECT
    DATE(_PARTITIONTIME) AS day,
    DocumentIdentifier AS url,
    ARRAY_AGG(SourceCommonName ORDER BY DATE LIMIT 1)[OFFSET(0)] AS domain,
    ARRAY_AGG(REGEXP_EXTRACT(Extras, r'<PAGE_TITLE>(.*?)</PAGE_TITLE>') ORDER BY DATE LIMIT 1)[OFFSET(0)] AS title,
    MIN(DATE) AS seen
  FROM `gdelt-bq.gdeltv2.gkg_partitioned`
  WHERE _PARTITIONTIME >= TIMESTAMP(@from) AND _PARTITIONTIME < TIMESTAMP(@to)
    AND (TranslationInfo IS NULL OR TranslationInfo = '')  -- English-monitored stream only
    AND DocumentIdentifier LIKE 'http%'
    AND SourceCommonName IS NOT NULL AND SourceCommonName != ''
  GROUP BY day, url
),
titled AS (
  SELECT day, url, domain, seen,
         -- entities become separators, as html.unescape + [a-z0-9]+ does in Python
         REGEXP_EXTRACT_ALL(LOWER(REGEXP_REPLACE(title, r'&[a-zA-Z]+;|&#[0-9]+;', ' ')), r'[a-z0-9]+') AS ws
  FROM pool
  WHERE title IS NOT NULL AND TRIM(title) != ''
),
grams AS (
  SELECT day, url, domain, seen,
         ARRAY_TO_STRING([ws[OFFSET(i)], ws[OFFSET(i+1)], ws[OFFSET(i+2)],
                          ws[OFFSET(i+3)], ws[OFFSET(i+4)], ws[OFFSET(i+5)]], ' ') AS gram
  FROM titled, UNNEST(GENERATE_ARRAY(0, ARRAY_LENGTH(ws) - 6)) AS i
  WHERE ARRAY_LENGTH(ws) >= 6
),
gram_day AS (
  SELECT day, gram,
         COUNT(DISTINCT domain) AS domain_count,
         COUNT(DISTINCT url) AS article_count,
         ARRAY_AGG(DISTINCT domain) AS domains,
         MIN(seen) AS first_seen,
         MAX(seen) AS last_seen
  FROM grams
  GROUP BY day, gram
),
echo AS (SELECT * FROM gram_day WHERE domain_count >= 3),  -- MIN_DOMAINS = 3
echoed_urls AS (
  SELECT DISTINCT g.day, g.url
  FROM grams g JOIN echo e USING (day, gram)
),
day_totals AS (
  SELECT day,
         COUNT(*) AS articles_titled,
         COUNT(DISTINCT domain) AS domains_scanned
  FROM titled GROUP BY day
),
day_echo AS (SELECT day, COUNT(*) AS echoed FROM echoed_urls GROUP BY day),
-- the day's widest verbatim phrase: most distinct domains, ties to the longer phrase
top AS (
  SELECT * EXCEPT (rn) FROM (
    SELECT e.*, ROW_NUMBER() OVER (
      PARTITION BY day ORDER BY domain_count DESC, LENGTH(gram) DESC, gram ASC) AS rn
    FROM echo e
  ) WHERE rn = 1
),
top_tlds AS (
  SELECT day, gram,
         IFNULL(REGEXP_EXTRACT(d, r'\.([^.]+)$'), d) AS tld
  FROM top, UNNEST(domains) AS d
),
tld_rank AS (
  SELECT day, tld, n, total, distinct_tlds,
         ROW_NUMBER() OVER (PARTITION BY day ORDER BY n DESC, tld ASC) AS rn
  FROM (
    SELECT day, tld, COUNT(*) AS n,
           SUM(COUNT(*)) OVER (PARTITION BY day) AS total,
           COUNT(*) OVER (PARTITION BY day) AS distinct_tlds
    FROM top_tlds GROUP BY day, tld
  )
),
top_class AS (
  SELECT t.day, t.gram, t.domain_count, t.article_count,
         ROUND(TIMESTAMP_DIFF(PARSE_TIMESTAMP('%Y%m%d%H%M%S', CAST(t.last_seen AS STRING)),
                              PARSE_TIMESTAMP('%Y%m%d%H%M%S', CAST(t.first_seen AS STRING)),
                              SECOND) / 3600.0, 1) AS span_hours,
         r.tld AS top_tld,
         ROUND(r.n / r.total, 2) AS tld_share,
         r.distinct_tlds
  FROM top t JOIN tld_rank r ON r.day = t.day AND r.rn = 1
)
SELECT
  FORMAT_DATE('%Y-%m-%d', d.day) AS date,
  d.articles_titled,
  d.domains_scanned,
  IFNULL(e.echoed, 0) AS echoed_articles,
  ROUND(IFNULL(e.echoed, 0) / d.articles_titled, 3) AS echo_index,
  c.gram AS top_phrase,
  c.domain_count AS top_domain_count,
  c.article_count AS top_article_count,
  c.span_hours AS top_span_hours,
  c.top_tld,
  c.tld_share,
  c.distinct_tlds,
  CASE
    WHEN c.gram IS NULL THEN 'unknown'
    WHEN c.tld_share >= 0.8 AND c.span_hours IS NOT NULL AND c.span_hours <= 6 THEN 'wire/chain syndication'
    WHEN c.distinct_tlds >= 3 THEN 'scattered placement'
    ELSE 'mixed'
  END AS syndication_label
FROM day_totals d
LEFT JOIN day_echo e USING (day)
LEFT JOIN top_class c ON c.day = d.day
ORDER BY date
