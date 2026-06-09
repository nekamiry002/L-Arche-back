/**
 * Test journal de garde — /api/journaux
 * Usage : node src/scripts/testJournal.js
 * Note : nécessite une réservation avec statut 'confirmee' en base.
 *        Modifie RESERVATION_ID ci-dessous.
 */

const BASE = 'http://localhost:3000/api';
const RESERVATION_ID = 'REMPLACE_PAR_UN_ID_REEL'; // ← à modifier

async function testJournal() {
  console.log('📓 Tests journal de garde...\n');

  const signinRes = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
  });
  const signinData = await signinRes.json();
  if (!signinRes.ok) { console.error('❌ Connexion impossible'); return; }
  const token = signinData.session?.access_token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log('✅ Connecté.\n');

  if (RESERVATION_ID === 'REMPLACE_PAR_UN_ID_REEL') {
    console.log('⚠️  Modifie RESERVATION_ID dans ce script avec un ID de réservation confirmée.');
    console.log('   Les tests d\'écriture sont ignorés, mais on teste les accès refusés.\n');
  }

  // 1. Lire le journal (accès non autorisé si la réservation n'est pas la tienne → 403 ou 404)
  console.log(`1. GET /api/journaux/${RESERVATION_ID}...`);
  const readRes = await fetch(`${BASE}/journaux/${RESERVATION_ID}`, { headers });
  const readData = await readRes.json();
  if (readRes.ok) {
    console.log(`✅ ${readData.total} entrée(s) dans le journal`);
  } else {
    console.log(`  Status ${readRes.status} :`, readData.error?.message);
  }

  if (RESERVATION_ID === 'REMPLACE_PAR_UN_ID_REEL') return;

  // 2. Ajouter une entrée texte
  console.log('\n2. POST /api/journaux/:id (message)...');
  const msgRes = await fetch(`${BASE}/journaux/${RESERVATION_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_entree: 'message', contenu: 'Luna a bien mangé ce matin !' }),
  });
  const msgData = await msgRes.json();
  if (!msgRes.ok) { console.error('❌', msgData); } else { console.log('✅ Entrée créée :', msgData.id); }

  // 3. Ajouter un statut
  console.log('\n3. POST /api/journaux/:id (statut)...');
  const statRes = await fetch(`${BASE}/journaux/${RESERVATION_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_entree: 'statut', contenu: 'Promenade terminée, tout va bien.' }),
  });
  const statData = await statRes.json();
  if (!statRes.ok) { console.error('❌', statData); } else { console.log('✅ Statut ajouté'); }

  // 4. Type invalide → 400
  console.log('\n4. POST avec type_entree invalide (doit retourner 400)...');
  const badRes = await fetch(`${BASE}/journaux/${RESERVATION_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_entree: 'invalid', contenu: 'test' }),
  });
  const badData = await badRes.json();
  if (badRes.status === 400) {
    console.log('✅ Refus correct :', badData.error?.message);
  } else {
    console.error('❌ Réponse inattendue :', badRes.status);
  }

  console.log('\n✨ Tests journal terminés.');
}

testJournal().catch(console.error);
