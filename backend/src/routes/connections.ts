import { Router } from 'express';
import * as service from '../services/connectionService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try { res.json(await service.getAll()); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { fromNode, toNode, type, description } = req.body;
    if (!fromNode || !toNode) return res.status(400).json({ error: 'Missing fromNode or toNode' });
    const item = await service.create(fromNode, toNode, type || '流程', description || '');
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { type, description } = req.body;
    const item = await service.update(id, type, description);
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await service.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
});

router.get('/node/:id', async (req, res, next) => {
  try {
    const result = await service.getByNode(req.params.id);
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
