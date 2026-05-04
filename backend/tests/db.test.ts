import request from 'supertest';
import app from '../src/app.js';

describe('Database API', () => {
  it('POST /api/db/reset clears and reseeds data', async () => {
    const res = await request(app).post('/api/db/reset');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Database reset to default');

    const phases = await request(app).get('/api/phases');
    expect(phases.body.length).toBeGreaterThan(0);
  });

  it('GET /api/db/export returns full dataset', async () => {
    await request(app).post('/api/db/reset');
    const res = await request(app).get('/api/db/export');
    expect(res.status).toBe(200);
    expect(res.body.phases).toBeDefined();
    expect(res.body.departments).toBeDefined();
  });
});
