import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import * as phaseService from '../services/phaseService.js';
import * as deptService from '../services/departmentService.js';
import * as nodeService from '../services/nodeService.js';
import * as connService from '../services/connectionService.js';
import { defaultNodes, defaultConnections } from '../seedData.js';

const router = Router();

router.post('/reset', async (_req, res, next) => {
  try {
    await prisma.connection.deleteMany();
    await prisma.node.deleteMany();
    await prisma.phase.deleteMany();
    await prisma.department.deleteMany();
    await seedDefaultData();
    res.json({ message: 'Database reset to default' });
  } catch (e) { next(e); }
});

router.get('/export', async (_req, res, next) => {
  try {
    const data = {
      phases: await phaseService.getAll(),
      departments: await deptService.getAll(),
      nodes: await nodeService.getAll(),
      connections: await connService.getAll(),
    };
    res.json(data);
  } catch (e) { next(e); }
});

router.post('/import', async (req, res, next) => {
  try {
    const { phases, departments, nodes, connections } = req.body;
    await prisma.$transaction(async (tx) => {
      await tx.connection.deleteMany();
      await tx.node.deleteMany();
      await tx.phase.deleteMany();
      await tx.department.deleteMany();
      if (phases?.length) await tx.phase.createMany({ data: phases });
      if (departments?.length) await tx.department.createMany({ data: departments });
      if (nodes?.length) {
        for (const n of nodes) {
          await tx.node.create({
            data: {
              id: n.id,
              title: n.title,
              type: n.type,
              detail: n.detail,
              phaseId: n.phaseId,
              deptId: n.deptId,
              sortOrder: n.sortOrder,
            },
          });
        }
      }
      if (connections?.length) await tx.connection.createMany({ data: connections });
    });
    res.json({ message: 'Data imported successfully' });
  } catch (e) { next(e); }
});

async function seedDefaultData() {
  const defaultPhases = [
    { id: 1, name: '自主研发阶段', sortOrder: 1 },
    { id: 2, name: '样板间概念方案设计节点', sortOrder: 2 },
    { id: 3, name: '样板间方案设计阶段', sortOrder: 3 },
    { id: 4, name: '样板间施工图阶段', sortOrder: 4 },
    { id: 5, name: '样板间施工阶段', sortOrder: 5 },
    { id: 6, name: '预售阶段', sortOrder: 6 },
    { id: 7, name: '批次图深化阶段', sortOrder: 7 },
    { id: 8, name: '批次施工阶段', sortOrder: 8 },
  ];
  const defaultDepts = [
    { id: 1, name: '产品', sortOrder: 1 },
    { id: 2, name: '建筑', sortOrder: 2 },
    { id: 3, name: '景观', sortOrder: 3 },
    { id: 4, name: '内装方案团队', sortOrder: 4 },
    { id: 5, name: '方案单位', sortOrder: 5 },
    { id: 6, name: '施工图单位', sortOrder: 6 },
    { id: 7, name: '照明设计', sortOrder: 7 },
    { id: 8, name: 'BIM', sortOrder: 8 },
    { id: 9, name: '成本', sortOrder: 9 },
    { id: 10, name: '招采', sortOrder: 10 },
    { id: 11, name: '技术部', sortOrder: 11 },
    { id: 12, name: '工程', sortOrder: 12 },
    { id: 13, name: '开发', sortOrder: 13 },
    { id: 14, name: '营销', sortOrder: 14 },
    { id: 15, name: '法务', sortOrder: 15 },
    { id: 16, name: '物业', sortOrder: 16 },
    { id: 17, name: '外装', sortOrder: 17 },
    { id: 18, name: '软装', sortOrder: 18 },
    { id: 19, name: '报建报审审图公司', sortOrder: 19 },
    { id: 20, name: '内装第三方审图', sortOrder: 20 },
    { id: 21, name: '智能化', sortOrder: 21 },
    { id: 22, name: '机电', sortOrder: 22 },
  ];
  console.log('[Seed] Creating phases...');
  await prisma.phase.createMany({ data: defaultPhases, skipDuplicates: true });
  console.log('[Seed] Creating departments...');
  await prisma.department.createMany({ data: defaultDepts, skipDuplicates: true });
  console.log('[Seed] Creating', defaultNodes.length, 'nodes...');
  for (const n of defaultNodes) {
    await prisma.node.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }
  console.log('[Seed] Creating', defaultConnections.length, 'connections...');
  for (const c of defaultConnections) {
    try {
      await prisma.connection.upsert({
        where: { fromNode_toNode: { fromNode: c.fromNode, toNode: c.toNode } },
        update: {},
        create: c,
      });
    } catch (err) {
      console.error('[Seed] Connection upsert failed for', c.fromNode, '->', c.toNode, ':', err);
    }
  }
  console.log('[Seed] Done');
}

export { seedDefaultData };
export default router;
