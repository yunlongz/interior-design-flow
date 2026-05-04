import request from 'supertest';
import app from '../src/app.js';

describe('Connections API', () => {
  async function setup() {
    const phase = await request(app).post('/api/phases').send({ name: 'P', sortOrder: 1 });
    const dept = await request(app).post('/api/departments').send({ name: 'D', sortOrder: 1 });
    const n1 = await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId: phase.body.id, deptId: dept.body.id });
    const n2 = await request(app).post('/api/nodes').send({ title: 'N2', type: 'task', phaseId: phase.body.id, deptId: dept.body.id });
    return { n1: n1.body.id, n2: n2.body.id };
  }

  it('POST /api/connections creates a connection', async () => {
    const { n1, n2 } = await setup();
    const res = await request(app).post('/api/connections').send({ fromNode: n1, toNode: n2, type: '流程' });
    expect(res.status).toBe(201);
    expect(res.body.fromNode).toBe(n1);
  });

  it('GET /api/connections/node/:id returns upstream/downstream', async () => {
    const { n1, n2 } = await setup();
    await request(app).post('/api/connections').send({ fromNode: n1, toNode: n2, type: '流程' });
    const res = await request(app).get(`/api/connections/node/${n2}`);
    expect(res.status).toBe(200);
    expect(res.body.upstream.length).toBe(1);
    expect(res.body.downstream.length).toBe(0);
  });

  it('POST /api/connections rejects duplicate connection', async () => {
    const { n1, n2 } = await setup();
    await request(app).post('/api/connections').send({ fromNode: n1, toNode: n2 });
    const res = await request(app).post('/api/connections').send({ fromNode: n1, toNode: n2 });
    expect(res.status).toBe(500); // Prisma unique constraint error
  });
});
