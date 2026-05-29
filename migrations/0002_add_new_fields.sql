-- 1. Table: animaux
-- Ajouter les colonnes sexe et infos_veterinaire
ALTER TABLE animaux 
ADD COLUMN sexe text,
ADD COLUMN infos_veterinaire text;

-- 2. Table: utilisateurs
-- Ajouter les colonnes description, tarif, type_de_garde, images_logement
ALTER TABLE utilisateurs
ADD COLUMN description text,
ADD COLUMN tarif numeric(6,2),
ADD COLUMN type_de_garde text[],
ADD COLUMN images_logement text[];

-- 3. Table: especes_infos
-- Ajouter les colonnes a_savoir, race, espece_parente
ALTER TABLE especes_infos
ADD COLUMN a_savoir text,
ADD COLUMN race boolean NOT NULL DEFAULT false,
ADD COLUMN espece_parente uuid REFERENCES especes_infos(id) ON DELETE SET NULL;

-- Contrainte : si race = true alors espece_parente ne peut pas être nulle, et inversement
ALTER TABLE especes_infos
ADD CONSTRAINT chk_especes_infos_race CHECK (
  (NOT race AND espece_parente IS NULL) OR 
  (race AND espece_parente IS NOT NULL)
);
