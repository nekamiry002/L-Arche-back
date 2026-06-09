/**
 * Test disponibilités — /api/disponibilites
 * Usage : node src/scripts/testDisponibilites.js
 */

const BASE = 'http://localhost:3000/api';

async function testDisponibilites() {
  console.log('📅 Tests disponibilités...\n');

  // Connexion
  const signinRes = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
  });
  const signinData = await signinRes.json();
  if (!signinRes.ok) {
    console.error('❌ Connexion impossible :', signinData);
    return;
  }
  const token = signinData.session?.access_token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log('✅ Connecté.\n');

  let dispoId;

  // 1. Créer une disponibilité
  console.log('1. POST /api/disponibilites...');
  const createRes = await fetch(`${BASE}/disponibilites`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ date_debut: '2026-07-01', date_fin: '2026-07-15', disponible: true }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('❌', createData);
  } else {
    dispoId = createData.id;
    console.log('✅ Créée :', createData.date_debut, '→', createData.date_fin);
  }

  // 2. Lire mes disponibilités
  console.log('\n2. GET /api/disponibilites/me...');
  const meRes = await fetch(`${BASE}/disponibilites/me`, { headers });
  const meData = await meRes.json();
  if (!meRes.ok) {
    console.error('❌', meData);
  } else {
    console.log(`✅ ${meData.total} disponibilité(s)`);
  }

  if (!dispoId) { console.log('\n⚠️  Pas d\'id, tests suivants ignorés.'); return; }

  // 3. Modifier
  console.log(`\n3. PATCH /api/disponibilites/${dispoId}...`);
  const patchRes = await fetch(`${BASE}/disponibilites/${dispoId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ disponible: false }),
  });
  const patchData = await patchRes.json();
  if (!patchRes.ok) {
    console.error('❌', patchData);
  } else {
    console.log('✅ disponible =', patchData.disponible);
  }

  // 4. Supprimer
  console.log(`\n4. DELETE /api/disponibilites/${dispoId}...`);
  const delRes = await fetch(`${BASE}/disponibilites/${dispoId}`, { method: 'DELETE', headers });
  const delData = await delRes.json();
  if (!delRes.ok) {
    console.error('❌', delData);
  } else {
    console.log('✅', delData.message);
  }

  console.log('\n✨ Tests disponibilités terminés.');
}

testDisponibilites().catch(console.error);
