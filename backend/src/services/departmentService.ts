import { prisma } from '../lib/prisma.js';

export async function getAll() {
  return prisma.department.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getById(id: number) {
  return prisma.department.findUnique({ where: { id } });
}

export async function create(name: string, sortOrder: number) {
  return prisma.department.create({ data: { name, sortOrder } });
}

export async function update(id: number, name: string, sortOrder: number) {
  return prisma.department.update({ where: { id }, data: { name, sortOrder } });
}

export async function remove(id: number) {
  return prisma.department.delete({ where: { id } });
}

export async function getNodeCount(id: number) {
  return prisma.node.count({ where: { deptId: id } });
}
