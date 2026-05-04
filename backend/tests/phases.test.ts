import request from 'supertest';
import app from '../src/app.js';

describe('Phases API', () => {
  it('POST /api/phases creates a phase', async () => {
    const res = await request(app).post('/api/phases').send({ name: 'Test Phase', sortOrder: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Phase');
  });

  it('GET /api/phases returns all phases', async () => {
    await request(app).post('/api/phases').send({ name: 'A', sortOrder: 1 });
    await request(app).post('/api/phases').send({ name: 'B', sortOrder: 2 });
    const res = await request(app).get('/api/phases');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('PUT /api/phases/:id updates a phase', async () => {
    const create = await request(app).post('/api/phases').send({ name: 'Old', sortOrder: 1 });
    const res = await request(app).put(`/api/phases/${create.body.id}`).send({ name: 'New', sortOrder: 2 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });

  it('DELETE /api/phases/:id deletes a phase', async () => {
    const create = await request(app).post('/api/phases').send({ name: 'DeleteMe', sortOrder: 1 });
    const res = await request(app).delete(`/api/phases/${create.body.id}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/phases/:id returns 409 if phase has nodes', async () => {
    const dept = await request(app).post('/api/departments').send({ name: 'D1', sortOrder: 1 });
    const phase = await request(app).post('/api/phases').send({ name: 'P1', sortOrder: 1 });
    await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId: phase.body.id, deptId: dept.body.id });
    const res = await request(app).delete(`/api/phases/${phase.body.id}`);
    expect(res.status).toBe(409);
  });

  it('GET /api/phases/:id/node-count returns correct count', async () => {
    const dept = await request(app).post('/api/departments').send({ name: 'D2', sortOrder: 1 });
    const phase = await request(app).post('/api/phases').send({ name: 'P2', sortOrder: 1 });
    await request(app).post('/api/nodes').send({ title: 'N2', type: 'task', phaseId: phase.body.id, deptId: dept.body.id });
    const res = await request(app).get(`/api/phases/${phase.body.id}/node-count`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });
});
