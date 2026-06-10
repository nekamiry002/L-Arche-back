-- ================================================================
-- SEED — L'Arche — données de test
-- À exécuter dans l'éditeur SQL de Supabase (pas une migration)
-- Mot de passe de tous les comptes : Test1234!
--
-- ORDRE D'EXÉCUTION :
--   1. Exécuter d'abord 0004_fix_role_constraint.sql si pas fait
--   2. Exécuter ce fichier en entier
-- ================================================================

-- UUIDs fixes (pour pouvoir les référencer entre tables) :
--   admin        : a0000000-0000-0000-0000-000000000001
--   gardien 1-4  : a0000000-0000-0000-0000-00000000000{2..5}
--   proprio 1-3  : a0000000-0000-0000-0000-00000000000{6..8}

-- ----------------------------------------------------------------
-- 1. COMPTES AUTH (auth.users + auth.identities)
-- ----------------------------------------------------------------

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'admin@larche.fr',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated',
    'marie.dupont@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated',
    'jean.martin@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated',
    'sarah.bernard@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000005',
    'authenticated', 'authenticated',
    'thomas.petit@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000006',
    'authenticated', 'authenticated',
    'alice.moreau@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000007',
    'authenticated', 'authenticated',
    'lucas.simon@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000008',
    'authenticated', 'authenticated',
    'emma.lambert@example.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    NOW(), NOW()
  );

-- Identités (nécessaire pour que Supabase Auth reconnaisse les comptes)
-- provider_id = email pour le provider "email" (obligatoire depuis Supabase 2.x)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@larche.fr"}',          'email', 'admin@larche.fr',          NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', '{"sub":"a0000000-0000-0000-0000-000000000002","email":"marie.dupont@example.com"}',  'email', 'marie.dupont@example.com',  NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003', '{"sub":"a0000000-0000-0000-0000-000000000003","email":"jean.martin@example.com"}',   'email', 'jean.martin@example.com',   NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004', '{"sub":"a0000000-0000-0000-0000-000000000004","email":"sarah.bernard@example.com"}', 'email', 'sarah.bernard@example.com', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005', '{"sub":"a0000000-0000-0000-0000-000000000005","email":"thomas.petit@example.com"}',  'email', 'thomas.petit@example.com',  NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006', '{"sub":"a0000000-0000-0000-0000-000000000006","email":"alice.moreau@example.com"}',  'email', 'alice.moreau@example.com',  NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007', '{"sub":"a0000000-0000-0000-0000-000000000007","email":"lucas.simon@example.com"}',   'email', 'lucas.simon@example.com',   NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', '{"sub":"a0000000-0000-0000-0000-000000000008","email":"emma.lambert@example.com"}',  'email', 'emma.lambert@example.com',  NOW(), NOW(), NOW());

-- ----------------------------------------------------------------
-- 2. PROFILS UTILISATEURS (public.utilisateurs)
-- ----------------------------------------------------------------

INSERT INTO utilisateurs (
  id, nom, prenom, ville, telephone,
  role, est_gardien, charte_acceptee, identite_verifiee,
  description_gardien, experience_animaux, type_logement, jardin,
  animaux_acceptes, latitude, longitude,
  note_moyenne, nb_avis, profil_gardien_verifie
) VALUES
  -- Admin
  (
    'a0000000-0000-0000-0000-000000000001',
    'Admin', 'L''Arche', 'Paris', NULL,
    'admin', false, true, true,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    NULL, 0, false
  ),
  -- Gardien 1 — Marie Dupont, Paris, chiens + chats
  (
    'a0000000-0000-0000-0000-000000000002',
    'Dupont', 'Marie', 'Paris', '0601020304',
    'utilisateur', true, true, true,
    'Passionnée par les animaux depuis toujours, je prends soin de vos compagnons comme des membres de ma famille.',
    '5 ans d''expérience avec chiens et chats. Ancienne assistante vétérinaire.',
    'appartement', false,
    ARRAY['chien', 'chat'],
    48.8566, 2.3522,
    4.8, 12, true
  ),
  -- Gardien 2 — Jean Martin, Lyon, tous animaux
  (
    'a0000000-0000-0000-0000-000000000003',
    'Martin', 'Jean', 'Lyon', '0607080910',
    'utilisateur', true, true, true,
    'Grande maison avec jardin à Lyon, idéale pour les animaux qui ont besoin d''espace.',
    '8 ans d''expérience. J''ai eu des chiens, chats, lapins et NAC.',
    'maison', true,
    ARRAY['chien', 'chat', 'lapin', 'rongeur'],
    45.7640, 4.8357,
    4.5, 7, true
  ),
  -- Gardien 3 — Sarah Bernard, Marseille, chats uniquement
  (
    'a0000000-0000-0000-0000-000000000004',
    'Bernard', 'Sarah', 'Marseille', '0611121314',
    'utilisateur', true, true, false,
    'Spécialisée dans la garde de chats. Appartement calme et ensoleillé.',
    '3 ans. Propriétaire de 2 chats, je connais leurs besoins sur le bout des doigts.',
    'appartement', false,
    ARRAY['chat'],
    43.2965, 5.3698,
    4.2, 4, false
  ),
  -- Gardien 4 — Thomas Petit, Bordeaux
  (
    'a0000000-0000-0000-0000-000000000005',
    'Petit', 'Thomas', 'Bordeaux', '0615161718',
    'utilisateur', true, true, true,
    'Éducateur canin certifié, je prends en charge tous types de chiens avec patience et méthodes positives.',
    'Éducateur canin depuis 6 ans. Formation CCPDT.',
    'maison', true,
    ARRAY['chien'],
    44.8378, -0.5792,
    4.9, 21, true
  ),
  -- Propriétaire 1 — Alice Moreau, Paris
  (
    'a0000000-0000-0000-0000-000000000006',
    'Moreau', 'Alice', 'Paris', '0621222324',
    'utilisateur', false, true, false,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    NULL, 0, false
  ),
  -- Propriétaire 2 — Lucas Simon, Lyon
  (
    'a0000000-0000-0000-0000-000000000007',
    'Simon', 'Lucas', 'Lyon', '0625262728',
    'utilisateur', false, true, false,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    NULL, 0, false
  ),
  -- Propriétaire 3 — Emma Lambert, Marseille
  (
    'a0000000-0000-0000-0000-000000000008',
    'Lambert', 'Emma', 'Marseille', '0629303132',
    'utilisateur', false, true, false,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    NULL, 0, false
  );

-- ----------------------------------------------------------------
-- 3. ANIMAUX
-- ----------------------------------------------------------------

INSERT INTO animaux (id, proprietaire_id, nom, espece, race, age, poids, sexe, caractere, besoins_specifiques)
VALUES
  -- Alice (proprio 1) : un chien + un chat
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000006',
    'Rocky', 'chien', 'Labrador', 3, 28.5, 'male',
    'Joueur et sociable, adore les balades.',
    'Sortir 2 fois par jour minimum.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000006',
    'Luna', 'chat', 'Siamois', 5, 3.8, 'femelle',
    'Câline mais peut être sauvage avec les inconnus.',
    'Alimentation humide matin et soir.'
  ),
  -- Lucas (proprio 2) : un chien + un chat
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000007',
    'Max', 'chien', 'Border Collie', 2, 18.0, 'male',
    'Très énergique, a besoin de stimulation mentale.',
    'Jeux d''intelligence quotidiens, longues balades.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000007',
    'Mia', 'chat', 'British Shorthair', 4, 4.5, 'femelle',
    'Tranquille et indépendante.',
    NULL
  ),
  -- Emma (proprio 3) : un lapin
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000008',
    'Câlin', 'lapin', 'Bélier nain', 1, 1.8, 'male',
    'Très affectueux, aime être porté.',
    'Foin à volonté, légumes frais quotidiens. Ne pas le laisser seul trop longtemps.'
  );

-- ----------------------------------------------------------------
-- 4. DISPONIBILITÉS (des 4 gardiens)
-- ----------------------------------------------------------------

INSERT INTO disponibilites (utilisateur_id, date_debut, date_fin, disponible)
VALUES
  -- Marie (gardien 1)
  ('a0000000-0000-0000-0000-000000000002', '2026-06-15', '2026-06-30', true),
  ('a0000000-0000-0000-0000-000000000002', '2026-07-10', '2026-07-25', true),
  -- Jean (gardien 2)
  ('a0000000-0000-0000-0000-000000000003', '2026-06-20', '2026-07-05', true),
  ('a0000000-0000-0000-0000-000000000003', '2026-08-01', '2026-08-31', true),
  -- Sarah (gardien 3)
  ('a0000000-0000-0000-0000-000000000004', '2026-07-01', '2026-07-15', true),
  -- Thomas (gardien 4)
  ('a0000000-0000-0000-0000-000000000005', '2026-06-12', '2026-06-20', true),
  ('a0000000-0000-0000-0000-000000000005', '2026-07-01', '2026-07-31', true);

-- ----------------------------------------------------------------
-- 5. RÉSERVATIONS
-- ----------------------------------------------------------------

INSERT INTO reservations (id, proprietaire_id, gardien_id, animal_id, date_debut, date_fin, statut, assurance, instructions)
VALUES
  -- En attente : Alice → Marie, Rocky le chien
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    '2026-06-20', '2026-06-25',
    'en_attente', false,
    'Rocky est vacciné. Il dort dans son panier. Sortie le matin vers 8h si possible.'
  ),
  -- Confirmée : Lucas → Jean, Max le chien
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    '2026-06-22', '2026-06-28',
    'confirmee', true,
    'Max a besoin de courir. Au moins 1h de balade par jour. Croquettes premium.'
  ),
  -- Terminée : Emma → Jean, Câlin le lapin
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000005',
    '2026-05-10', '2026-05-15',
    'terminee', false,
    'Foin Timothy. Creuser une petite zone dans le jardin si possible.'
  );

-- ----------------------------------------------------------------
-- 6. AVIS (sur la réservation terminée)
-- ----------------------------------------------------------------

INSERT INTO avis (reservation_id, auteur_id, cible_id, note, commentaire, recommande)
VALUES
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000008', -- Emma (proprio)
    'a0000000-0000-0000-0000-000000000003', -- Jean (gardien)
    5,
    'Jean a été absolument parfait avec Câlin. Il m''envoyait des photos tous les jours, le lapin était aux petits soins. Je recommande à 100% !',
    true
  );

-- Mettre à jour note_moyenne et nb_avis de Jean manuellement
UPDATE utilisateurs
SET note_moyenne = 5.0, nb_avis = 1
WHERE id = 'a0000000-0000-0000-0000-000000000003';

-- ----------------------------------------------------------------
-- 7. CARNETS DE SANTÉ
-- ----------------------------------------------------------------

INSERT INTO carnets_sante (id, animal_id, type_document, date_document, notes)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', -- Rocky
    'vaccin', '2025-03-15',
    'Vaccin rage + CHPPIL. Prochain rappel : mars 2026. Dr. Lefebvre, Cabinet vétérinaire du Parc.'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001', -- Rocky
    'visite', '2026-01-10',
    'Bilan annuel. RAS. Poids stable à 28.5 kg. Dents propres.'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003', -- Max
    'vaccin', '2025-11-20',
    'Primo-vaccination complète. Vaccin polyvalent (CHPPIL). Rappel dans 1 an.'
  );

-- ----------------------------------------------------------------
-- 8. JOURNAUX DE GARDE
-- ----------------------------------------------------------------

INSERT INTO journaux_garde (id, reservation_id, auteur_id, type_entree, contenu)
VALUES
  -- Réservation confirmée : Max chez Jean
  (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003', -- Jean
    'message',
    'Max est bien arrivé ! Il a mangé toute sa gamelle et a fait une belle balade de 2h. Il est déjà à l''aise dans la maison.'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003', -- Jean
    'statut',
    'Jour 2 : Max a bien dormi. Promenade matinale de 45 min effectuée. Tout se passe très bien.'
  ),
  -- Réservation terminée : Câlin chez Jean
  (
    'e0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003', -- Jean
    'message',
    'Câlin est adorable ! Il a bien mangé son foin et ses carottes. Il saute partout dans son coin et vient se faire câliner le soir.'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000008', -- Emma (propriétaire)
    'message',
    'Merci pour les nouvelles ! Je suis rassurée, il a l''air très bien chez vous.'
  );

-- ================================================================
-- FIN DU SEED
-- Comptes disponibles (mot de passe : Test1234!) :
--   admin@larche.fr          → admin
--   marie.dupont@example.com → gardien (Paris, chien/chat, ★4.8)
--   jean.martin@example.com  → gardien (Lyon, chien/chat/lapin, ★5.0)
--   sarah.bernard@example.com → gardien (Marseille, chat, ★4.2)
--   thomas.petit@example.com  → gardien (Bordeaux, chien, ★4.9)
--   alice.moreau@example.com  → propriétaire (Rocky le chien + Luna le chat)
--   lucas.simon@example.com   → propriétaire (Max le chien + Mia le chat)
--   emma.lambert@example.com  → propriétaire (Câlin le lapin)
-- ================================================================
