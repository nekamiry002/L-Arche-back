/**
 * Test recherche de gardiens — GET /api/users/gardiens
 * Pré-requis : le serveur tourne sur localhost:3000
 *              un compte valide existe (email/password ci-dessous)
 *
 * Usage : node src/scripts/testGardiens.js
 */

const BASE = 'http://localhost:3000/api';

async function testGardiens() {
  console.log('🔍 Tests recherche gardiens...\n');

  // 1. Connexion pour obtenir un token
  console.log('1. Connexion...');
  const signinRes = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
  });
  const signinData = await signinRes.json();

  if (!signinRes.ok) {
    console.error('❌ Impossible de se connecter :', signinData);
    console.log('   → Modifie email/password dans ce script avec un compte existant.');
    return;
  }
  const token = signinData.session?.access_token;
  console.log('✅ Connecté, token obtenu.\n');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Liste tous les gardiens (sans filtre)
  console.log('2. GET /api/users/gardiens (sans filtre)...');
  const allRes = await fetch(`${BASE}/users/gardiens`, { headers });
  const allData = await allRes.json();
  if (!allRes.ok) {
    console.error('❌', allData);
  } else {
    console.log(`✅ ${allData.total ?? allData.data?.length} gardien(s) trouvé(s)`);
  }

  // 3. Filtre par espèce
  console.log('\n3. GET /api/users/gardiens?espece=chien...');
  const especeRes = await fetch(`${BASE}/users/gardiens?espece=chien`, { headers });
  const especeData = await especeRes.json();
  if (!especeRes.ok) {
    console.error('❌', especeData);
  } else {
    console.log(`✅ ${especeData.total ?? especeData.data?.length} gardien(s) acceptant les chiens`);
  }

  // 4. Filtre par note minimum
  console.log('\n4. GET /api/users/gardiens?note_min=4...');
  const noteRes = await fetch(`${BASE}/users/gardiens?note_min=4`, { headers });
  const noteData = await noteRes.json();
  if (!noteRes.ok) {
    console.error('❌', noteData);
  } else {
    console.log(`✅ ${noteData.total ?? noteData.data?.length} gardien(s) avec note ≥ 4`);
  }

  // 5. Filtre géographique (coordonnées Lyon)
  console.log('\n5. GET /api/users/gardiens?lat=45.75&lng=4.85&distance_km=30...');
  const geoRes = await fetch(`${BASE}/users/gardiens?lat=45.75&lng=4.85&distance_km=30`, { headers });
  const geoData = await geoRes.json();
  if (!geoRes.ok) {
    console.error('❌', geoData);
  } else {
    console.log(`✅ ${geoData.data?.length} gardien(s) dans un rayon de 30 km autour de Lyon`);
    if (geoData.data?.[0]) {
      console.log(`   Premier résultat : ${geoData.data[0].nom} — ${geoData.data[0].distance_km} km`);
    }
  }

  // 6. Profil public d'un gardien (utilise le premier résultat si disponible)
  const gardiensRes = await fetch(`${BASE}/users/gardiens?limit=1`, { headers });
  const gardiensData = await gardiensRes.json();
  const firstId = gardiensData.data?.[0]?.id;

  if (firstId) {
    console.log(`\n6. GET /api/users/gardiens/${firstId}...`);
    const profilRes = await fetch(`${BASE}/users/gardiens/${firstId}`, { headers });
    const profilData = await profilRes.json();
    if (!profilRes.ok) {
      console.error('❌', profilData);
    } else {
      console.log(`✅ Profil gardien : ${profilData.nom} ${profilData.prenom ?? ''} — ${profilData.ville}`);
    }
  } else {
    console.log('\n6. Aucun gardien en base, test profil ignoré.');
  }

  console.log('\n✨ Tests terminés.');
}

testGardiens().catch(console.error);
