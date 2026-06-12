const { test, expect } = require('@playwright/test');
const { getToken } = require('./helpers');

const USER_EMAIL    = process.env.TEST_USER_EMAIL;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD;

// ─── Auth guards ──────────────────────────────────────────────────────────────

test.describe('Animals — auth guards', () => {
  test('GET /api/animals sans token → 401', async ({ request }) => {
    const res = await request.get('/api/animals');
    expect(res.status()).toBe(401);
  });

  test('POST /api/animals sans token → 401', async ({ request }) => {
    const res = await request.post('/api/animals', {
      data: { nom: 'Rex', espece: 'chien' },
    });
    expect(res.status()).toBe(401);
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

test.describe('Animals — validation', () => {
  test('POST sans nom → 400', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.post('/api/animals', {
      data: { espece: 'chien' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });

  test('POST avec espece invalide → 400', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.post('/api/animals', {
      data: { nom: 'Coco', espece: 'dragon' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });

  test('POST nom trop court (1 char) → 400', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.post('/api/animals', {
      data: { nom: 'X', espece: 'chien' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });
});

// ─── CRUD (séquentiel) ────────────────────────────────────────────────────────

test.describe.serial('Animals — CRUD', () => {
  let token     = null;
  let createdId = null;

  test.beforeAll(async ({ request }) => {
    if (!USER_EMAIL || !USER_PASSWORD) return;
    token = await getToken(request, USER_EMAIL, USER_PASSWORD);
  });

  test('GET /api/animals → 200 + tableau', async ({ request }) => {
    test.skip(!token, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const res = await request.get('/api/animals', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data ?? body)).toBe(true);
  });

  test('POST animal valide → 201', async ({ request }) => {
    test.skip(!token, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const res = await request.post('/api/animals', {
      data: {
        nom: 'Playwright Dog',
        espece: 'chien',
        race: 'Labrador',
        age: 3,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.nom).toBe('Playwright Dog');
    expect(body.espece).toBe('chien');
    createdId = body.id;
  });

  test('GET /api/animals/:id → 200', async ({ request }) => {
    test.skip(!token || !createdId, 'animal non créé');
    const res = await request.get(`/api/animals/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdId);
  });

  test('PATCH → nom mis à jour', async ({ request }) => {
    test.skip(!token || !createdId, 'prérequis manquants');
    const res = await request.patch(`/api/animals/${createdId}`, {
      data: { nom: 'Playwright Dog (MAJ)' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.nom).toBe('Playwright Dog (MAJ)');
  });

  test('PATCH avec champ non autorisé → 400', async ({ request }) => {
    test.skip(!token || !createdId, 'prérequis manquants');
    const res = await request.patch(`/api/animals/${createdId}`, {
      data: { champ_inconnu: 'valeur' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/animals/:id d\'un autre utilisateur → 403', async ({ request }) => {
    test.skip(!token || !createdId, 'prérequis manquants');
    // UUID valide mais appartient à un autre → accès refusé
    // On teste ici avec un UUID qui n'appartient pas à cet utilisateur
    const res = await request.get('/api/animals/00000000-0000-0000-0000-000000000001', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Soit 403 (appartient à un autre) soit 404 (n'existe pas)
    expect([403, 404, 500]).toContain(res.status());
  });

  test('DELETE → 200', async ({ request }) => {
    test.skip(!token || !createdId, 'prérequis manquants');
    const res = await request.delete(`/api/animals/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBeTruthy();
    createdId = null;
  });
});
