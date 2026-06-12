/**
 * Authentifie un utilisateur via /api/auth/signin et retourne l'access_token Supabase.
 * Les tests qui nécessitent un token doivent appeler cette fonction dans beforeAll/beforeEach.
 *
 * Credentials attendus via variables d'environnement :
 *   TEST_USER_EMAIL / TEST_USER_PASSWORD  — compte utilisateur normal
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD — compte admin
 */
async function getToken(request, email, password) {
  const res = await request.post('/api/auth/signin', {
    data: { email, password },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`signin failed (${res.status()}): ${body}`);
  }
  const body = await res.json();
  const token = body.session?.access_token;
  if (!token) throw new Error('Aucun access_token dans la réponse signin');
  return token;
}

module.exports = { getToken };
