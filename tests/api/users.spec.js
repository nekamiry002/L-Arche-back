const { test, expect } = require('@playwright/test');
const { getToken } = require('./helpers');

const USER_EMAIL     = process.env.TEST_USER_EMAIL;
const USER_PASSWORD  = process.env.TEST_USER_PASSWORD;
const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

// ─── Gardiens ─────────────────────────────────────────────────────────────────

test.describe('GET /api/users/gardiens', () => {
  test('sans token → 401', async ({ request }) => {
    const res = await request.get('/api/users/gardiens');
    expect(res.status()).toBe(401);
  });

  test('avec token utilisateur → 200 + { data, total }', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users/gardiens', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total === 'number' || body.total === null).toBe(true);
  });

  test('filtre espece=chien → gardiens acceptent chiens', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users/gardiens?espece=chien', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const g of body.data) {
      expect(g.animaux_acceptes).toContain('chien');
    }
  });

  test('filtre note_min=4 → gardiens avec note >= 4', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users/gardiens?note_min=4', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const g of body.data) {
      if (g.note_moyenne !== null) {
        expect(g.note_moyenne).toBeGreaterThanOrEqual(4);
      }
    }
  });

  test('pagination limit=5 → au plus 5 résultats', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users/gardiens?limit=5', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeLessThanOrEqual(5);
  });
});

// ─── Profil personnel (/me) ───────────────────────────────────────────────────

test.describe('GET /api/users/me', () => {
  test('sans token → 401', async ({ request }) => {
    const res = await request.get('/api/users/me');
    expect(res.status()).toBe(401);
  });

  test('avec token → 200 + profil utilisateur', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(typeof body.nom).toBe('string');
  });
});

test.describe('PATCH /api/users/me', () => {
  test('sans token → 401', async ({ request }) => {
    const res = await request.patch('/api/users/me', { data: { ville: 'Paris' } });
    expect(res.status()).toBe(401);
  });

  test('champ inconnu uniquement → 400', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.patch('/api/users/me', {
      data: { champ_inconnu: 'valeur' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });

  test('mise à jour ville → 200 + ville mise à jour', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.patch('/api/users/me', {
      data: { ville: 'Paris' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ville).toBe('Paris');
  });
});

// ─── Admin : liste de tous les utilisateurs ───────────────────────────────────

test.describe('GET /api/users', () => {
  test('sans token → 401', async ({ request }) => {
    const res = await request.get('/api/users');
    expect(res.status()).toBe(401);
  });

  test('avec token utilisateur normal → 403', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });

  test('avec token admin → 200 + tableau', async ({ request }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD non définis');
    const token = await getToken(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data ?? body)).toBe(true);
  });
});
