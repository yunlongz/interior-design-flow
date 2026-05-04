import express from 'express';
import cors from 'cors';
import phaseRoutes from './routes/phases.js';
import departmentRoutes from './routes/departments.js';
import nodeRoutes from './routes/nodes.js';
import connectionRoutes from './routes/connections.js';
import dbRoutes from './routes/db.js';
import { seedDefaultData } from './routes/db.js';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/phases', phaseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/db', dbRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('[Startup] Prisma connected to database');
    const count = await prisma.node.count();
    console.log(`[Startup] Node count: ${count}`);
    if (count === 0) {
      console.log('[Startup] Database empty, seeding default data...');
      await seedDefaultData();
      console.log('[Startup] Default data seeded.');
    } else {
      console.log('[Startup] Database already has data, skipping seed.');
    }
  } catch (e: any) {
    console.error('[Startup] Auto-seed failed:', e?.message || e);
  }
});

export default app;
