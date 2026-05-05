import { Router } from 'express';
import * as service from '../services/nodeService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const phaseId = req.query.phaseId ? Number(req.query.phaseId) : undefined;
    if (phaseId) {
      res.json(await service.getByPhase(phaseId));
    } else {
      res.json(await service.getAll());
    }
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Node not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, type, detail, phaseId, deptId } = req.body;
    if (!title || !type || !phaseId || !deptId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = await service.create({ title, type, detail: detail || '', phaseId: Number(phaseId), deptId: Number(deptId) });
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
});

router.patch('/:id/phase', async (req, res, next) => {
  try {
    const { phaseId } = req.body;
    const item = await service.updatePhase(req.params.id, Number(phaseId));
    res.json(item);
  } catch (e) { next(e); }
});

router.patch('/:id/dept', async (req, res, next) => {
  try {
    const { deptId } = req.body;
    const item = await service.updateDept(req.params.id, Number(deptId));
    res.json(item);
  } catch (e) { next(e); }
});

router.patch('/:id/detail', async (req, res, next) => {
  try {
    const { detail } = req.body;
    const item = await service.updateDetail(req.params.id, detail || '');
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/sort-order', async (req, res, next) => {
  try {
    const { phaseId, deptId, orders } = req.body;
    await service.updateSortOrder(Number(phaseId), Number(deptId), orders);
    res.status(204).send();
  } catch (e) { next(e); }
});

router.patch('/:id/move', async (req, res, next) => {
  try {
    const { phaseId, deptId } = req.body;
    const item = await service.moveNode(req.params.id, Number(phaseId), Number(deptId));
    res.json(item);
  } catch (e) { next(e); }
});

export default router;
