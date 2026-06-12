const { test, expect } = require('@playwright/test');

test.describe('GET /api/health', () => {
  test('retourne 200 + status OK', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.timestamp).toBeTruthy();
  });
});
