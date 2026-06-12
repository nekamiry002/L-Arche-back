-- Migration 0005 : Table produits (boutique merch)
-- Remplace la table `merch` (0003) qui n'a jamais été connectée au frontend.
-- Structure alignée sur l'interface TypeScript Produit du frontend.

CREATE TABLE IF NOT EXISTS produits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prix        NUMERIC(8,2) NOT NULL DEFAULT 0,
  categorie   TEXT NOT NULL DEFAULT 'accessoires'
                CHECK (categorie IN ('vetements', 'maison', 'animal', 'accessoires')),
  stock       INTEGER NOT NULL DEFAULT 0,
  photo       TEXT,
  variants    TEXT[],
  ordre       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS produits_ordre_idx ON produits (ordre ASC);

-- RLS : lecture publique, écriture admin uniquement
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produits_select_public" ON produits
  FOR SELECT USING (true);

CREATE POLICY "produits_all_admin" ON produits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM utilisateurs
      WHERE utilisateurs.id = auth.uid()
        AND utilisateurs.role = 'admin'
    )
  );

-- Données initiales
INSERT INTO produits (nom, description, prix, categorie, stock, photo, variants, ordre) VALUES
  ('Tote bag L''Arche',           'Tote bag en coton bio sérigraphié avec le logo L''Arche. Résistant et éco-responsable.',       15,  'maison',      42,  NULL, ARRAY['Naturel', 'Vert forêt'],          0),
  ('T-shirt "Pour les animaux"',  'T-shirt unisexe 100% coton bio. Sérigraphie haute qualité. Lavage 30°.',                       25,  'vetements',   28,  NULL, ARRAY['XS','S','M','L','XL'],            1),
  ('Mug L''Arche',                'Mug en céramique 33cl avec l''illustration L''Arche. Passe au lave-vaisselle.',                12,  'maison',      56,  NULL, NULL,                                    2),
  ('Gourde inox L''Arche',        'Gourde isotherme 500ml en inox. Garde chaud 12h et froid 24h. Sérigraphiée.',                  22,  'maison',      19,  NULL, ARRAY['Vert forêt', 'Blanc'],            3),
  ('Porte-clé émaillé',           'Porte-clé en métal émaillé avec une illustration d''animal L''Arche. Disponible en 5 modèles.',8,   'accessoires', 84,  NULL, ARRAY['Chien','Chat','Lapin','Oiseau','Tortue'], 4),
  ('Gamelle personnalisée',        'Gamelle en inox avec le nom de votre animal gravé. Anti-dérapante. Taille M et L disponibles.',22,  'animal',      15,  NULL, ARRAY['M (500ml)','L (900ml)'],          5),
  ('Collier brodé L''Arche',       'Collier en nylon résistant avec broderie L''Arche. 3 tailles : S, M, L.',                     14,  'animal',      31,  NULL, ARRAY['S','M','L'],                      6),
  ('Pack stickers',               'Pack de 6 stickers illustrés par notre artiste partenaire. Waterproof.',                       6,   'accessoires', 120, NULL, NULL,                                    7)
ON CONFLICT DO NOTHING;
