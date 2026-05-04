import { Router } from 'express';
import * as service from '../services/phaseService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try { res.json(await service.getAll()); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await service.getById(id);
    if (!item) return res.status(404).json({ error: 'Phase not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, sortOrder } = req.body;
    if (!name || sortOrder === undefined) return res.status(400).json({ error: 'Missing name or sortOrder' });
    const item = await service.create(name, Number(sortOrder));
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, sortOrder } = req.body;
    if (!name || sortOrder === undefined) return res.status(400).json({ error: 'Missing name or sortOrder' });
    const item = await service.update(id, name, Number(sortOrder));
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const count = await service.getNodeCount(id);
    if (count > 0) return res.status(409).json({ error: `Phase has ${count} nodes, cannot delete` });
    await service.remove(id);
    res.status(204).send();
  } catch (e) { next(e); }
});

router.get('/:id/node-count', async (req, res, next) => {
  try {
    const count = await service.getNodeCount(Number(req.params.id));
    res.json({ count });
  } catch (e) { next(e); }
});

export default router;
