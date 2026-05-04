import request from 'supertest';
import app from '../src/app.js';

describe('Nodes API', () => {
  async function createPhaseAndDept() {
    const phase = await request(app).post('/api/phases').send({ name: 'Phase', sortOrder: 1 });
    const dept = await request(app).post('/api/departments').send({ name: 'Dept', sortOrder: 1 });
    return { phaseId: phase.body.id, deptId: dept.body.id };
  }

  it('POST /api/nodes creates a node with auto-generated ID', async () => {
    const { phaseId, deptId } = await createPhaseAndDept();
    const res = await request(app).post('/api/nodes').send({ title: 'Node1', type: 'task', phaseId, deptId });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Node1');
  });

  it('GET /api/nodes returns nodes with phase/dept names', async () => {
    const { phaseId, deptId } = await createPhaseAndDept();
    await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId, deptId });
    const res = await request(app).get('/api/nodes');
    expect(res.status).toBe(200);
    expect(res.body[0].phaseName).toBe('Phase');
    expect(res.body[0].deptName).toBe('Dept');
  });

  it('PATCH /api/nodes/:id/phase updates phase', async () => {
    const { phaseId, deptId } = await createPhaseAndDept();
    const node = await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId, deptId });
    const newPhase = await request(app).post('/api/phases').send({ name: 'Phase2', sortOrder: 2 });
    const res = await request(app).patch(`/api/nodes/${node.body.id}/phase`).send({ phaseId: newPhase.body.id });
    expect(res.status).toBe(200);
    expect(res.body.phaseId).toBe(newPhase.body.id);
  });

  it('DELETE /api/nodes/:id cascades connections', async () => {
    const { phaseId, deptId } = await createPhaseAndDept();
    const n1 = await request(app).post('/api/nodes').send({ title: 'N1', type: 'task', phaseId, deptId });
    const n2 = await request(app).post('/api/nodes').send({ title: 'N2', type: 'task', phaseId, deptId });
    await request(app).post('/api/connections').send({ fromNode: n1.body.id, toNode: n2.body.id });
    const res = await request(app).delete(`/api/nodes/${n1.body.id}`);
    expect(res.status).toBe(204);
    const conns = await request(app).get('/api/connections');
    expect(conns.body.length).toBe(0);
  });
});
