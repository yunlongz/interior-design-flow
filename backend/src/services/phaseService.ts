import { prisma } from '../lib/prisma.js';

export async function getAll() {
  return prisma.phase.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getById(id: number) {
  return prisma.phase.findUnique({ where: { id } });
}

export async function create(name: string, sortOrder: number) {
  return prisma.phase.create({ data: { name, sortOrder } });
}

export async function update(id: number, name: string, sortOrder: number) {
  return prisma.phase.update({ where: { id }, data: { name, sortOrder } });
}

export async function remove(id: number) {
  return prisma.phase.delete({ where: { id } });
}

export async function getNodeCount(id: number) {
  return prisma.node.count({ where: { phaseId: id } });
}
