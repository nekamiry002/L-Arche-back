const API_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
  console.log('🚀 Démarrage des tests d\'authentification...');
  
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    nom: 'Test'
  };

  try {
    // 1. Signup
    console.log('\n📝 Test Inscription...');
    const signupRes = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(JSON.stringify(signupData));
    console.log('✅ Inscription réussie:', signupData.email);

    // 2. Signin
    console.log('\n🔑 Test Connexion...');
    const signinRes = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const signinData = await signinRes.json();
    if (!signinRes.ok) throw new Error(JSON.stringify(signinData));
    console.log('✅ Connexion réussie, access_token reçu');
    const { session } = signinData;

    // 3. Refresh
    console.log('\n🔄 Test Refresh Token...');
    const refreshRes = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: session.refresh_token
      })
    });
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) throw new Error(JSON.stringify(refreshData));
    console.log('✅ Refresh réussi, nouveau token reçu');

    // 4. Signout
    console.log('\n🚪 Test Déconnexion...');
    const signoutRes = await fetch(`${API_URL}/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id
      })
    });
    const signoutData = await signoutRes.json();
    if (!signoutRes.ok) throw new Error(JSON.stringify(signoutData));
    console.log('✅ Déconnexion réussie:', signoutData.ok);

    console.log('\n✨ Tous les tests d\'auth sont passés !');
  } catch (error) {
    console.error('\n❌ Erreur pendant les tests:', error.message);
  }
}

testAuth();
