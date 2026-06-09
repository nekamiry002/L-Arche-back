/**
 * Test avis — /api/reviews
 * Usage : node src/scripts/testReviews.js
 * Note : nécessite une réservation avec statut 'terminee' en base.
 */

const BASE = 'http://localhost:3000/api';

async function testReviews() {
  console.log('⭐ Tests avis...\n');

  const signinRes = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
  });
  const signinData = await signinRes.json();
  if (!signinRes.ok) { console.error('❌ Connexion impossible'); return; }
  const token = signinData.session?.access_token;
  const userId = signinData.session?.user?.id;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log('✅ Connecté :', userId, '\n');

  // 1. Mes avis donnés
  console.log('1. GET /api/reviews/me...');
  const meRes = await fetch(`${BASE}/reviews/me`, { headers });
  const meData = await meRes.json();
  if (!meRes.ok) { console.error('❌', meData); } else { console.log(`✅ ${meData.total} avis donnés`); }

  // 2. Avis reçus par l'utilisateur connecté
  console.log(`\n2. GET /api/reviews/user/${userId}...`);
  const forUserRes = await fetch(`${BASE}/reviews/user/${userId}`, { headers });
  const forUserData = await forUserRes.json();
  if (!forUserRes.ok) { console.error('❌', forUserData); } else { console.log(`✅ ${forUserData.total} avis reçus`); }

  // 3. Tentative de création (sans réservation terminée — doit échouer avec 400)
  console.log('\n3. POST /api/reviews (sans réservation valide — doit retourner 400/404)...');
  const badRes = await fetch(`${BASE}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reservation_id: '00000000-0000-0000-0000-000000000000', cible_id: userId, note: 5 }),
  });
  const badData = await badRes.json();
  if (badRes.status === 404 || badRes.status === 400) {
    console.log('✅ Refus correct :', badData.error?.message);
  } else {
    console.error('❌ Réponse inattendue :', badRes.status, badData);
  }

  console.log('\n✨ Tests avis terminés.');
  console.log('   Pour tester la création complète, crée une réservation terminée en base');
  console.log('   et lance manuellement POST /api/reviews avec les bons ids.');
}

testReviews().catch(console.error);
