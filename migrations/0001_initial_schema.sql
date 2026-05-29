-- Activer pgcrypto pour gen_random_uuid()
create extension if not exists "pgcrypto";

-- Supabase Auth gère l'authentification dans auth.users.
-- La table utilisateurs contient le profil associé à auth.users(id).
create table utilisateurs (
  id uuid primary key references auth.users(id),
  nom text not null,
  prenom text,
  ville text,
  telephone text,
  avatar_url text,
  identite_verifiee boolean not null default false,
  charte_acceptee boolean not null default false,
  role text not null default 'utilisateur',
  est_gardien boolean not null default false,
  description_gardien text,
  experience_animaux text,
  type_logement text,
  jardin boolean,
  animaux_acceptes text[],
  latitude float8,
  longitude float8,
  note_moyenne numeric(3,2),
  nb_avis int not null default 0,
  profil_gardien_verifie boolean not null default false,
  created_at timestamptz not null default now(),
  constraint chk_role check (role in ('utilisateur', 'admin'))
);

create table animaux (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null references utilisateurs(id) on delete cascade,
  nom text not null,
  espece text not null,
  race text,
  age int,
  poids numeric(5,2),
  caractere text,
  besoins_specifiques text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table carnets_sante (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animaux(id) on delete cascade,
  type_document text,
  document_url text,
  date_document date,
  notes text,
  created_at timestamptz not null default now()
);

create table disponibilites (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references utilisateurs(id) on delete cascade,
  date_debut date not null,
  date_fin date not null,
  disponible boolean not null default true,
  constraint chk_disponibilite_dates check (date_fin >= date_debut)
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null references utilisateurs(id) on delete cascade,
  gardien_id uuid not null references utilisateurs(id) on delete cascade,
  animal_id uuid not null references animaux(id) on delete cascade,
  date_debut date not null,
  date_fin date not null,
  statut text not null default 'en_attente',
  assurance boolean not null default false,
  instructions text,
  created_at timestamptz not null default now(),
  constraint chk_reservation_dates check (date_fin >= date_debut),
  constraint chk_reservation_statut check (statut in ('en_attente', 'confirmee', 'terminee', 'annulee')),
  constraint chk_reservation_acteurs check (proprietaire_id != gardien_id)
);

create table journaux_garde (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  auteur_id uuid not null references utilisateurs(id) on delete cascade,
  type_entree text not null,
  contenu text,
  media_url text,
  created_at timestamptz not null default now(),
  constraint chk_journal_type check (type_entree in ('photo', 'message', 'statut', 'alerte'))
);

create table avis (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  auteur_id uuid not null references utilisateurs(id) on delete cascade,
  cible_id uuid not null references utilisateurs(id) on delete cascade,
  note int not null,
  commentaire text,
  recommande boolean,
  created_at timestamptz not null default now(),
  constraint chk_avis_note check (note between 1 and 5)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  expediteur_id uuid not null references utilisateurs(id) on delete cascade,
  destinataire_id uuid not null references utilisateurs(id) on delete cascade,
  reservation_id uuid references reservations(id) on delete cascade,
  contenu text,
  media_url text,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

create table signalements (
  id uuid primary key default gen_random_uuid(),
  signaleur_id uuid not null references utilisateurs(id) on delete cascade,
  signale_id uuid not null references utilisateurs(id) on delete cascade,
  raison text not null,
  description text,
  preuve_url text,
  statut text not null default 'ouvert',
  created_at timestamptz not null default now(),
  constraint chk_signalement_statut check (statut in ('ouvert', 'traite', 'ferme'))
);

create table especes_infos (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text,
  description text,
  besoins text,
  conseils text,
  image_url text
);

create table assurances (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references reservations(id) on delete cascade,
  numero_police text,
  type_couverture text,
  montant numeric(8,2),
  statut text,
  created_at timestamptz not null default now()
);
