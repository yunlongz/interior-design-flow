import { prisma } from '../src/lib/prisma.js';

beforeEach(async () => {
  await prisma.connection.deleteMany();
  await prisma.node.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.department.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
