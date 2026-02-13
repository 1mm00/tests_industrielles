-- Script SQL pour vérifier les nouvelles données enrichies
-- À exécuter dans pgAdmin ou psql

-- 1. Voir les dernières mesures avec les nouveaux champs
SELECT 
    id_mesure,
    parametre_mesure,
    valeur_mesuree,
    unite_mesure,
    conforme,
    conditions_mesure,
    incertitude_mesure,
    timestamp_mesure
FROM mesures
ORDER BY timestamp_mesure DESC
LIMIT 10;

-- 2. Vérifier qu'un instrument_id est bien associé
SELECT 
    m.parametre_mesure,
    m.valeur_mesuree,
    i.designation as instrument,
    i.unite_mesure,
    i.precision
FROM mesures m
LEFT JOIN instruments_mesure i ON m.instrument_id = i.id_instrument
ORDER BY m.timestamp_mesure DESC
LIMIT 5;

-- 3. Voir les mesures avec conditions environnementales
SELECT 
    parametre_mesure,
    valeur_mesuree,
    conditions_mesure,
    timestamp_mesure
FROM mesures
WHERE conditions_mesure IS NOT NULL
ORDER BY timestamp_mesure DESC;
