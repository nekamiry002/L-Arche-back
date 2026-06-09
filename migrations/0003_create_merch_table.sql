-- ============================================================
-- Migration 0003 - Phase 6.5 : Table Merchandising
-- ============================================================

-- Table principale pour les produits merchandising
create table merch (
  id uuid primary key default gen_random_uuid(),

  -- Informations générales
  nom text not null,
  description text,
  slug text unique not null,

  -- Prix
  prix numeric(8,2) not null,
  prix_solde numeric(8,2),

  -- Stock
  stock int not null default 0,

  -- Catégorie (t-shirt, hoodie, casquette, accessoire, etc.)
  categorie text not null,

  -- Tailles disponibles (ex: ['S','M','L','XL']) — null si non applicable
  tailles text[],

  -- Couleurs disponibles (ex: ['noir','blanc','bleu'])
  couleurs text[],

  -- Images
  image_principale_url text,
  images_supplementaires text[],

  -- Visibilité
  actif boolean not null default true,
  en_vedette boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Contraintes
  constraint chk_merch_prix check (prix >= 0),
  constraint chk_merch_prix_solde check (prix_solde is null or prix_solde >= 0),
  constraint chk_merch_stock check (stock >= 0),
  constraint chk_merch_categorie check (
    categorie in ('t-shirt', 'hoodie', 'casquette', 'sweat', 'accessoire', 'peluche', 'autre')
  )
);

-- Index pour les recherches courantes
create index idx_merch_categorie on merch(categorie);
create index idx_merch_actif on merch(actif);
create index idx_merch_en_vedette on merch(en_vedette);
create index idx_merch_slug on merch(slug);

-- Trigger pour mettre à jour updated_at automatiquement
create or replace function update_merch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_merch_updated_at
  before update on merch
  for each row execute function update_merch_updated_at();
