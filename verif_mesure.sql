-- Requête simple pour voir la dernière mesure avec conditions
SELECT 
    parametre_mesure,
    valeur_mesuree,
    unite_mesure,
    conforme,
    conditions_mesure,
    TO_CHAR(timestamp_mesure, 'YYYY-MM-DD HH24:MI:SS') as date_mesure
FROM mesures
WHERE test_id = (SELECT id_test FROM tests_industriels WHERE numero_test = 'TEST-2026-001')
ORDER BY timestamp_mesure DESC
LIMIT 1;
