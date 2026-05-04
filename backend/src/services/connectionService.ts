import { prisma } from '../lib/prisma.js';

export async function getAll() {
  return prisma.connection.findMany({ orderBy: { id: 'asc' } });
}

export async function create(fromNode: string, toNode: string, type: string, description: string) {
  return prisma.connection.create({
    data: { fromNode, toNode, type, description },
  });
}

export async function update(id: number, type: string, description: string) {
  return prisma.connection.update({ where: { id }, data: { type, description } });
}

export async function remove(id: number) {
  return prisma.connection.delete({ where: { id } });
}

export async function getByNode(nodeId: string) {
  const upstream = await prisma.connection.findMany({
    where: { toNode: nodeId },
    include: { from: { include: { phase: true, department: true } } },
  });
  const downstream = await prisma.connection.findMany({
    where: { fromNode: nodeId },
    include: { to: { include: { phase: true, department: true } } },
  });
  return {
    upstream: upstream.map((c: any) => ({
      id: c.id,
      fromNode: c.fromNode,
      toNode: c.toNode,
      type: c.type,
      description: c.description,
      fromTitle: c.from.title,
      fromDept: c.from.department.name,
    })),
    downstream: downstream.map((c: any) => ({
      id: c.id,
      fromNode: c.fromNode,
      toNode: c.toNode,
      type: c.type,
      description: c.description,
      toTitle: c.to.title,
      toDept: c.to.department.name,
    })),
  };
}
