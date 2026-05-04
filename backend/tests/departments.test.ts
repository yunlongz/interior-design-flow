import request from 'supertest';
import app from '../src/app.js';

describe('Departments API', () => {
  it('POST /api/departments creates a department', async () => {
    const res = await request(app).post('/api/departments').send({ name: 'Test Dept', sortOrder: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Dept');
  });

  it('DELETE /api/departments/:id returns 409 if department has nodes', async () => {
    const dept = await request(app).post('/api/departments').send({ name: 'D1', sortOrder: 1 });
    const phase = await request(app).post('/api/phases').send({ name: 'P1', sortOrder: 1 });
    await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId: phase.body.id, deptId: dept.body.id });
    const res = await request(app).delete(`/api/departments/${dept.body.id}`);
    expect(res.status).toBe(409);
  });
});
