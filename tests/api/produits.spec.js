const { test, expect } = require('@playwright/test');
const { getToken } = require('./helpers');

const USER_EMAIL     = process.env.TEST_USER_EMAIL;
const USER_PASSWORD  = process.env.TEST_USER_PASSWORD;
const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

// ─── Lecture publique ─────────────────────────────────────────────────────────

test.describe('Produits — lecture publique', () => {
  test('GET /api/produits → 200 + tableau', async ({ request }) => {
    const res = await request.get('/api/produits');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('chaque produit a les champs obligatoires', async ({ request }) => {
    const res = await request.get('/api/produits');
    const body = await res.json();
    for (const p of body) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.nom).toBe('string');
      expect(typeof p.prix).toBe('number');
      expect(typeof p.categorie).toBe('string');
      expect(typeof p.ordre).toBe('number');
    }
  });

  test('produits triés par ordre croissant', async ({ request }) => {
    const res = await request.get('/api/produits');
    const body = await res.json();
    for (let i = 1; i < body.length; i++) {
      expect(body[i].ordre).toBeGreaterThanOrEqual(body[i - 1].ordre);
    }
  });

  test('GET /api/produits?categorie=vetements → produits filtrés', async ({ request }) => {
    const res = await request.get('/api/produits?categorie=vetements');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    for (const p of body) {
      expect(p.categorie).toBe('vetements');
    }
  });

  test('GET /api/produits?categorie=tous → même résultat que sans filtre', async ({ request }) => {
    const [all, tous] = await Promise.all([
      request.get('/api/produits').then(r => r.json()),
      request.get('/api/produits?categorie=tous').then(r => r.json()),
    ]);
    expect(tous.length).toBe(all.length);
  });

  test('GET /api/produits/:id avec UUID inexistant → 404', async ({ request }) => {
    const res = await request.get('/api/produits/00000000-0000-0000-0000-000000000000');
    expect(res.status()).toBe(404);
  });
});

// ─── Auth guards ──────────────────────────────────────────────────────────────

test.describe('Produits — auth guards', () => {
  test('POST sans token → 401', async ({ request }) => {
    const res = await request.post('/api/produits', {
      data: { nom: 'Test', prix: 10 },
    });
    expect(res.status()).toBe(401);
  });

  test('PATCH sans token → 401', async ({ request }) => {
    const res = await request.patch('/api/produits/00000000-0000-0000-0000-000000000000', {
      data: { nom: 'x' },
    });
    expect(res.status()).toBe(401);
  });

  test('DELETE sans token → 401', async ({ request }) => {
    const res = await request.delete('/api/produits/00000000-0000-0000-0000-000000000000');
    expect(res.status()).toBe(401);
  });

  test('POST avec token utilisateur normal → 403', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const token = await getToken(request, USER_EMAIL, USER_PASSWORD);
    const res = await request.post('/api/produits', {
      data: { nom: 'Test', prix: 10 },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });
});

// ─── CRUD admin (séquentiel) ──────────────────────────────────────────────────

test.describe.serial('Produits — CRUD admin', () => {
  let adminToken = null;
  let createdId   = null;

  test.beforeAll(async ({ request }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
    adminToken = await getToken(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('POST sans nom → 400', async ({ request }) => {
    test.skip(!adminToken, 'TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD non définis');
    const res = await request.post('/api/produits', {
      data: { prix: 10 },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('POST sans prix → 400', async ({ request }) => {
    test.skip(!adminToken, 'TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD non définis');
    const res = await request.post('/api/produits', {
      data: { nom: 'Produit sans prix' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(400);
  });

  test('POST valide → 201 + produit créé', async ({ request }) => {
    test.skip(!adminToken, 'TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD non définis');
    const res = await request.post('/api/produits', {
      data: {
        nom: 'Produit Test Playwright',
        description: 'Créé par les tests automatisés',
        prix: 9.99,
        categorie: 'accessoires',
        stock: 5,
        ordre: 9999,
      },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.nom).toBe('Produit Test Playwright');
    expect(body.prix).toBe(9.99);
    createdId = body.id;
  });

  test('GET /:id → produit créé visible publiquement', async ({ request }) => {
    test.skip(!createdId, 'produit non créé (test précédent ignoré ou échoué)');
    const res = await request.get(`/api/produits/${createdId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdId);
    expect(body.nom).toBe('Produit Test Playwright');
  });

  test('PATCH → nom mis à jour', async ({ request }) => {
    test.skip(!adminToken || !createdId, 'prérequis manquants');
    const res = await request.patch(`/api/produits/${createdId}`, {
      data: { nom: 'Produit Test Playwright (MAJ)' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.nom).toBe('Produit Test Playwright (MAJ)');
  });

  test('PATCH avec champ inconnu uniquement → 400', async ({ request }) => {
    test.skip(!adminToken || !createdId, 'prérequis manquants');
    const res = await request.patch(`/api/produits/${createdId}`, {
      data: { champ_invalide: 'valeur' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(400);
  });

  test('DELETE → 204', async ({ request }) => {
    test.skip(!adminToken || !createdId, 'prérequis manquants');
    const res = await request.delete(`/api/produits/${createdId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(204);
  });

  test('GET /:id après suppression → 404', async ({ request }) => {
    test.skip(!createdId, 'prérequis manquants');
    const res = await request.get(`/api/produits/${createdId}`);
    expect(res.status()).toBe(404);
    createdId = null;
  });
});
