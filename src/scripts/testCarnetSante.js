/**
 * Test carnet de santé — /api/carnets-sante
 * Usage : node src/scripts/testCarnetSante.js
 * Note : modifie ANIMAL_ID avec un animal t'appartenant.
 */

const BASE = 'http://localhost:3000/api';
const ANIMAL_ID = 'REMPLACE_PAR_UN_ID_REEL'; // ← à modifier

async function testCarnetSante() {
  console.log('🏥 Tests carnet de santé...\n');

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

  if (ANIMAL_ID === 'REMPLACE_PAR_UN_ID_REEL') {
    console.log('⚠️  Modifie ANIMAL_ID dans ce script avec un ID d\'animal t\'appartenant.');
    return;
  }

  let entryId;

  // 1. Lire le carnet
  console.log(`1. GET /api/carnets-sante/${ANIMAL_ID}...`);
  const readRes = await fetch(`${BASE}/carnets-sante/${ANIMAL_ID}`, { headers });
  const readData = await readRes.json();
  if (!readRes.ok) { console.error('❌', readData); } else { console.log(`✅ ${readData.total} entrée(s)`); }

  // 2. Ajouter une visite vétérinaire
  console.log('\n2. POST /api/carnets-sante/:id (visite)...');
  const addRes = await fetch(`${BASE}/carnets-sante/${ANIMAL_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_document: 'visite', date_document: '2026-06-01', notes: 'Visite annuelle — tout va bien' }),
  });
  const addData = await addRes.json();
  if (!addRes.ok) { console.error('❌', addData); } else { entryId = addData.id; console.log('✅ Entrée créée :', addData.id); }

  // 3. Ajouter un vaccin
  console.log('\n3. POST /api/carnets-sante/:id (vaccin)...');
  const vaccRes = await fetch(`${BASE}/carnets-sante/${ANIMAL_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_document: 'vaccin', date_document: '2026-06-01', notes: 'Rappel vaccin rage' }),
  });
  const vaccData = await vaccRes.json();
  if (!vaccRes.ok) { console.error('❌', vaccData); } else { console.log('✅ Vaccin ajouté'); }

  // 4. Type invalide → 400
  console.log('\n4. POST avec type_document invalide (doit retourner 400)...');
  const badRes = await fetch(`${BASE}/carnets-sante/${ANIMAL_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type_document: 'radio', notes: 'test' }),
  });
  if (badRes.status === 400) { console.log('✅ Refus correct'); } else { console.error('❌ Inattendu :', badRes.status); }

  // 5. Supprimer une entrée
  if (entryId) {
    console.log(`\n5. DELETE /api/carnets-sante/entries/${entryId}...`);
    const delRes = await fetch(`${BASE}/carnets-sante/entries/${entryId}`, { method: 'DELETE', headers });
    const delData = await delRes.json();
    if (!delRes.ok) { console.error('❌', delData); } else { console.log('✅', delData.message); }
  }

  console.log('\n✨ Tests carnet de santé terminés.');
}

testCarnetSante().catch(console.error);
