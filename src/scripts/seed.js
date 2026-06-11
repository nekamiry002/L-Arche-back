/**
 * Script de seed — crée les données de test via l'API Admin Supabase.
 * Usage : node src/scripts/seed.js
 *         node src/scripts/seed.js --clean   (supprime d'abord les données existantes)
 */
require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

const CLEAN = process.argv.includes('--clean');

// ─── Données de test ──────────────────────────────────────────────────────────

const TEST_EMAILS = [
  'admin@larche.fr',
  'marie.dupont@example.com',
  'jean.martin@example.com',
  'sarah.bernard@example.com',
  'thomas.petit@example.com',
  'alice.moreau@example.com',
  'lucas.simon@example.com',
  'emma.lambert@example.com',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(msg); }
function ok(label) { console.log(`  ✓ ${label}`); }
function fail(label, err) { console.error(`  ✗ ${label}:`, err.message ?? err); }

async function createAuthUser(email, password, meta = {}) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function insertProfile(id, profile) {
  const { error } = await supabaseAdmin.from('utilisateurs').insert({ id, ...profile });
  if (error) throw new Error(`profil ${id}: ${error.message}`);
}

async function insertAnimal(data) {
  const { data: row, error } = await supabaseAdmin.from('animaux').insert(data).select('id').single();
  if (error) throw new Error(`animal ${data.nom}: ${error.message}`);
  return row.id;
}

async function insertDispo(data) {
  const { error } = await supabaseAdmin.from('disponibilites').insert(data);
  if (error) throw new Error(`dispo: ${error.message}`);
}

async function insertReservation(data) {
  const { data: row, error } = await supabaseAdmin.from('reservations').insert(data).select('id').single();
  if (error) throw new Error(`reservation: ${error.message}`);
  return row.id;
}

async function insertAvis(data) {
  const { error } = await supabaseAdmin.from('avis').insert(data);
  if (error) throw new Error(`avis: ${error.message}`);
}

async function insertCarnet(data) {
  const { error } = await supabaseAdmin.from('carnets_sante').insert(data);
  if (error) throw new Error(`carnet: ${error.message}`);
}

async function insertJournal(data) {
  const { error } = await supabaseAdmin.from('journaux_garde').insert(data);
  if (error) throw new Error(`journal: ${error.message}`);
}

// ─── Nettoyage ────────────────────────────────────────────────────────────────

async function cleanup() {
  log('\n🧹 Nettoyage des comptes de test existants...');
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) { fail('listUsers', error); return; }

  for (const email of TEST_EMAILS) {
    const user = data.users.find(u => u.email === email);
    if (user) {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (delErr) fail(`delete ${email}`, delErr);
      else ok(`supprimé ${email}`);
    }
  }
}

// ─── Seed principal ───────────────────────────────────────────────────────────

async function seed() {
  if (CLEAN) await cleanup();

  // ── 1. Utilisateurs ─────────────────────────────────────────────────────────
  log('\n👤 Création des utilisateurs...');

  const adminId = await createAuthUser('admin@larche.fr', 'Test1234!');
  await insertProfile(adminId, {
    nom: 'Admin', prenom: "L'Arche",
    role: 'admin', est_gardien: false, charte_acceptee: true, identite_verifiee: true,
  });
  ok('admin@larche.fr');

  const marieId = await createAuthUser('marie.dupont@example.com', 'Test1234!');
  await insertProfile(marieId, {
    nom: 'Dupont', prenom: 'Marie', ville: 'Paris', telephone: '0601020304',
    role: 'utilisateur', est_gardien: true, charte_acceptee: true, identite_verifiee: true,
    description_gardien: 'Passionnée par les animaux depuis toujours, je prends soin de vos compagnons comme des membres de ma famille.',
    experience_animaux: 'expérimenté — 5 ans (ancienne assistante vétérinaire)',
    type_logement: 'appartement', jardin: false,
    animaux_acceptes: ['chien', 'chat'],
    latitude: 48.8566, longitude: 2.3522,
    note_moyenne: 4.8, nb_avis: 12, profil_gardien_verifie: true,
  });
  ok('marie.dupont@example.com');

  const jeanId = await createAuthUser('jean.martin@example.com', 'Test1234!');
  await insertProfile(jeanId, {
    nom: 'Martin', prenom: 'Jean', ville: 'Lyon', telephone: '0607080910',
    role: 'utilisateur', est_gardien: true, charte_acceptee: true, identite_verifiee: true,
    description_gardien: 'Grande maison avec jardin à Lyon, idéale pour les animaux qui ont besoin d\'espace.',
    experience_animaux: 'expérimenté — 8 ans',
    type_logement: 'maison', jardin: true,
    animaux_acceptes: ['chien', 'chat', 'lapin', 'rongeur'],
    latitude: 45.7640, longitude: 4.8357,
    note_moyenne: 5.0, nb_avis: 1, profil_gardien_verifie: true,
  });
  ok('jean.martin@example.com');

  const sarahId = await createAuthUser('sarah.bernard@example.com', 'Test1234!');
  await insertProfile(sarahId, {
    nom: 'Bernard', prenom: 'Sarah', ville: 'Marseille', telephone: '0611121314',
    role: 'utilisateur', est_gardien: true, charte_acceptee: true, identite_verifiee: false,
    description_gardien: 'Spécialisée dans la garde de chats. Appartement calme et ensoleillé.',
    experience_animaux: 'intermédiaire — 3 ans',
    type_logement: 'appartement', jardin: false,
    animaux_acceptes: ['chat'],
    latitude: 43.2965, longitude: 5.3698,
    note_moyenne: 4.2, nb_avis: 4, profil_gardien_verifie: false,
  });
  ok('sarah.bernard@example.com');

  const thomasId = await createAuthUser('thomas.petit@example.com', 'Test1234!');
  await insertProfile(thomasId, {
    nom: 'Petit', prenom: 'Thomas', ville: 'Bordeaux', telephone: '0615161718',
    role: 'utilisateur', est_gardien: true, charte_acceptee: true, identite_verifiee: true,
    description_gardien: 'Éducateur canin certifié. Méthodes positives uniquement.',
    experience_animaux: 'expérimenté — 6 ans (éducateur canin CCPDT)',
    type_logement: 'maison', jardin: true,
    animaux_acceptes: ['chien'],
    latitude: 44.8378, longitude: -0.5792,
    note_moyenne: 4.9, nb_avis: 21, profil_gardien_verifie: true,
  });
  ok('thomas.petit@example.com');

  const aliceId = await createAuthUser('alice.moreau@example.com', 'Test1234!');
  await insertProfile(aliceId, {
    nom: 'Moreau', prenom: 'Alice', ville: 'Paris', telephone: '0621222324',
    role: 'utilisateur', est_gardien: false, charte_acceptee: true, identite_verifiee: false,
  });
  ok('alice.moreau@example.com');

  const lucasId = await createAuthUser('lucas.simon@example.com', 'Test1234!');
  await insertProfile(lucasId, {
    nom: 'Simon', prenom: 'Lucas', ville: 'Lyon', telephone: '0625262728',
    role: 'utilisateur', est_gardien: false, charte_acceptee: true, identite_verifiee: false,
  });
  ok('lucas.simon@example.com');

  const emmaId = await createAuthUser('emma.lambert@example.com', 'Test1234!');
  await insertProfile(emmaId, {
    nom: 'Lambert', prenom: 'Emma', ville: 'Marseille', telephone: '0629303132',
    role: 'utilisateur', est_gardien: false, charte_acceptee: true, identite_verifiee: false,
  });
  ok('emma.lambert@example.com');

  // ── 2. Animaux ──────────────────────────────────────────────────────────────
  log('\n🐾 Création des animaux...');

  const rockyId = await insertAnimal({
    proprietaire_id: aliceId, nom: 'Rocky', espece: 'chien', race: 'Labrador',
    age: 3, poids: 28.5, sexe: 'male',
    caractere: 'Joueur, Sociable', besoins_specifiques: 'Sortir 2 fois par jour minimum.',
  });
  ok('Rocky (Alice)');

  const lunaId = await insertAnimal({
    proprietaire_id: aliceId, nom: 'Luna', espece: 'chat', race: 'Siamois',
    age: 5, poids: 3.8, sexe: 'femelle',
    caractere: 'Câline, Calme', besoins_specifiques: 'Alimentation humide matin et soir.',
  });
  ok('Luna (Alice)');

  const maxId = await insertAnimal({
    proprietaire_id: lucasId, nom: 'Max', espece: 'chien', race: 'Border Collie',
    age: 2, poids: 18.0, sexe: 'male',
    caractere: 'Énergique, Joueur', besoins_specifiques: 'Jeux d\'intelligence quotidiens, longues balades.',
  });
  ok('Max (Lucas)');

  const miaId = await insertAnimal({
    proprietaire_id: lucasId, nom: 'Mia', espece: 'chat', race: 'British Shorthair',
    age: 4, poids: 4.5, sexe: 'femelle',
    caractere: 'Calme', besoins_specifiques: null,
  });
  ok('Mia (Lucas)');

  const calinId = await insertAnimal({
    proprietaire_id: emmaId, nom: 'Câlin', espece: 'lapin', race: 'Bélier nain',
    age: 1, poids: 1.8, sexe: 'male',
    caractere: 'Câlin, Sociable', besoins_specifiques: 'Foin à volonté, légumes frais quotidiens.',
  });
  ok('Câlin (Emma)');

  // ── 3. Disponibilités ───────────────────────────────────────────────────────
  log('\n📅 Création des disponibilités...');

  for (const [userId, ranges] of [
    [marieId,  [['2026-06-15','2026-06-30'],['2026-07-10','2026-07-25']]],
    [jeanId,   [['2026-06-20','2026-07-05'],['2026-08-01','2026-08-31']]],
    [sarahId,  [['2026-07-01','2026-07-15']]],
    [thomasId, [['2026-06-12','2026-06-20'],['2026-07-01','2026-07-31']]],
  ]) {
    for (const [debut, fin] of ranges) {
      await insertDispo({ utilisateur_id: userId, date_debut: debut, date_fin: fin, disponible: true });
    }
  }
  ok('disponibilités (4 gardiens)');

  // ── 4. Réservations ─────────────────────────────────────────────────────────
  log('\n📋 Création des réservations...');

  const resa1Id = await insertReservation({
    proprietaire_id: aliceId, gardien_id: marieId, animal_id: rockyId,
    date_debut: '2026-06-20', date_fin: '2026-06-25',
    statut: 'en_attente', assurance: false,
    instructions: 'Rocky est vacciné. Il dort dans son panier. Sortie le matin vers 8h si possible.',
  });
  ok('Resa en_attente — Alice → Marie (Rocky)');

  const resa2Id = await insertReservation({
    proprietaire_id: lucasId, gardien_id: jeanId, animal_id: maxId,
    date_debut: '2026-06-22', date_fin: '2026-06-28',
    statut: 'confirmee', assurance: true,
    instructions: 'Max a besoin de courir. Au moins 1h de balade par jour. Croquettes premium.',
  });
  ok('Resa confirmée — Lucas → Jean (Max)');

  const resa3Id = await insertReservation({
    proprietaire_id: emmaId, gardien_id: jeanId, animal_id: calinId,
    date_debut: '2026-05-10', date_fin: '2026-05-15',
    statut: 'terminee', assurance: false,
    instructions: 'Foin Timothy. Légumes frais tous les matins.',
  });
  ok('Resa terminée — Emma → Jean (Câlin)');

  // ── 5. Avis ─────────────────────────────────────────────────────────────────
  log('\n⭐ Création des avis...');

  await insertAvis({
    reservation_id: resa3Id, auteur_id: emmaId, cible_id: jeanId,
    note: 5, recommande: true,
    commentaire: 'Jean a été absolument parfait avec Câlin. Photos tous les jours, le lapin était aux petits soins. Je recommande à 100% !',
  });
  ok('Avis Emma → Jean (5/5)');

  // ── 6. Carnets de santé ─────────────────────────────────────────────────────
  log('\n🏥 Création des carnets de santé...');

  await insertCarnet({
    animal_id: rockyId, type_document: 'vaccin', date_document: '2025-03-15',
    notes: 'Vaccin rage + CHPPIL. Prochain rappel : mars 2026. Dr. Lefebvre.',
  });
  await insertCarnet({
    animal_id: rockyId, type_document: 'visite', date_document: '2026-01-10',
    notes: 'Bilan annuel. RAS. Poids stable à 28.5 kg.',
  });
  await insertCarnet({
    animal_id: maxId, type_document: 'vaccin', date_document: '2025-11-20',
    notes: 'Primo-vaccination complète CHPPIL. Rappel dans 1 an.',
  });
  ok('carnets (Rocky x2, Max x1)');

  // ── 7. Journaux de garde ────────────────────────────────────────────────────
  log('\n📔 Création des journaux de garde...');

  await insertJournal({
    reservation_id: resa2Id, auteur_id: jeanId, type_entree: 'message',
    contenu: 'Max est bien arrivé ! Grande balade de 2h, il a mangé toute sa gamelle. Il est déjà à l\'aise.',
  });
  await insertJournal({
    reservation_id: resa2Id, auteur_id: jeanId, type_entree: 'statut',
    contenu: 'Jour 2 : promenade matinale 45 min effectuée. Tout se passe très bien.',
  });
  await insertJournal({
    reservation_id: resa3Id, auteur_id: jeanId, type_entree: 'message',
    contenu: 'Câlin est adorable ! Il mange bien son foin et ses carottes. Très affectueux le soir.',
  });
  await insertJournal({
    reservation_id: resa3Id, auteur_id: emmaId, type_entree: 'message',
    contenu: 'Merci pour les nouvelles ! Je suis rassurée, il a l\'air très bien chez vous.',
  });
  ok('journaux (resa2 x2, resa3 x2)');

  // ── Résumé ──────────────────────────────────────────────────────────────────
  log('\n✅ Seed terminé avec succès !');
  log('\nComptes disponibles (mot de passe : Test1234!) :');
  log(`  admin@larche.fr             → admin`);
  log(`  marie.dupont@example.com    → gardien (Paris, chien/chat, ★4.8)`);
  log(`  jean.martin@example.com     → gardien (Lyon, chien/chat/lapin, ★5.0)`);
  log(`  sarah.bernard@example.com   → gardien (Marseille, chat, ★4.2)`);
  log(`  thomas.petit@example.com    → gardien (Bordeaux, chien, ★4.9)`);
  log(`  alice.moreau@example.com    → propriétaire (Rocky + Luna)`);
  log(`  lucas.simon@example.com     → propriétaire (Max + Mia, resa confirmée avec Jean)`);
  log(`  emma.lambert@example.com    → propriétaire (Câlin, resa terminée avec Jean)`);
}

seed().catch(err => {
  console.error('\n❌ Erreur seed:', err.message);
  process.exit(1);
});
