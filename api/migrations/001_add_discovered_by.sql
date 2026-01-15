-- Migration: Ajout de la colonne discoveredBy à la table pollutions
-- Date: 2026-01-15

-- Ajouter la colonne discoveredBy
ALTER TABLE pollutions 
ADD COLUMN IF NOT EXISTS "discoveredBy" VARCHAR(100) NOT NULL DEFAULT 'Inconnu';

-- Mettre à jour la contrainte pour permettre les valeurs futures sans défaut
ALTER TABLE pollutions 
ALTER COLUMN "discoveredBy" DROP DEFAULT;

-- Vérification
-- SELECT * FROM pollutions LIMIT 1;
