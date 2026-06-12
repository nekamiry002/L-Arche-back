const { test, expect } = require('@playwright/test');

const USER_EMAIL    = process.env.TEST_USER_EMAIL;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD;

// ─── Signin ───────────────────────────────────────────────────────────────────

test.describe('POST /api/auth/signin', () => {
  test('corps vide → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signin', { data: {} });
    expect(res.status()).toBe(400);
  });

  test('email seul sans mot de passe → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'test@test.fr' },
    });
    expect(res.status()).toBe(400);
  });

  test('identifiants invalides → 401', async ({ request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'inexistant@nope.fr', password: 'WrongPass1' },
    });
    expect(res.status()).toBe(401);
  });

  test('identifiants valides → session + access_token', async ({ request }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD non définis');
    const res = await request.post('/api/auth/signin', {
      data: { email: USER_EMAIL, password: USER_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.session?.access_token).toBeTruthy();
    expect(body.user?.email).toBe(USER_EMAIL);
  });
});

// ─── Signup ───────────────────────────────────────────────────────────────────

test.describe('POST /api/auth/signup', () => {
  test('email invalide → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: 'pas-un-email', password: 'Test1234!', nom: 'Test' },
    });
    expect(res.status()).toBe(400);
  });

  test('mot de passe trop faible (sans majuscule) → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: 'test@test.fr', password: 'toofaible1', nom: 'Test' },
    });
    expect(res.status()).toBe(400);
  });

  test('nom trop court (1 char) → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: 'test@test.fr', password: 'ValidPass1', nom: 'X' },
    });
    expect(res.status()).toBe(400);
  });

  test('corps vide → 400', async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: {} });
    expect(res.status()).toBe(400);
  });
});

// ─── Signout ──────────────────────────────────────────────────────────────────

test.describe('POST /api/auth/signout', () => {
  test('sans user_id → 200 (best-effort)', async ({ request }) => {
    const res = await request.post('/api/auth/signout', { data: {} });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
