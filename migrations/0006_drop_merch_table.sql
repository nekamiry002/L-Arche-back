-- Migration 0006 : suppression de la table merch (jamais utilisée)
-- Remplacée par la table produits (0005) alignée sur le frontend.

DROP TRIGGER IF EXISTS trigger_merch_updated_at ON merch;
DROP FUNCTION IF EXISTS update_merch_updated_at();
DROP TABLE IF EXISTS merch;
