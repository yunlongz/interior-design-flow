import { prisma } from '../lib/prisma.js';

function getPinyinFirst(name: string): string {
  const map: Record<string, string> = {
    '产品': 'p', '建筑': 'b', '景观': 'l', '内装方案团队': 'i', '方案单位': 'f',
    '施工图单位': 'd', '照明设计': 'ld', 'BIM': 'bim', '成本': 'c', '招采': 'pr',
    '技术部': 't', '工程': 'e', '开发': 'dev', '营销': 'mk', '法务': 'law',
    '物业': 'wy', '外装': 'wz', '软装': 's', '报建报审审图公司': 'a',
    '内装第三方审图': 'sp', '智能化': 'sm', '机电': 'm',
  };
  if (map[name]) return map[name];
  const first = name.charAt(0);
  const code = first.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fa5) {
    const pyMap: Record<string, string> = {
      '产': 'p', '建': 'b', '景': 'l', '内': 'i', '方': 'f', '施': 'd', '照': 'ld',
      '成': 'c', '招': 'pr', '技': 't', '工': 'e', '开': 'dev', '营': 'mk',
      '法': 'law', '物': 'wy', '外': 'wz', '软': 's', '报': 'a', '智': 'sm', '机': 'm',
    };
    return pyMap[first] || first.toLowerCase();
  }
  return first.toLowerCase();
}

async function generateId(phaseId: number, deptId: number): Promise<string> {
  const dept = await prisma.department.findUnique({ where: { id: deptId } });
  const deptCode = dept ? getPinyinFirst(dept.name) : 'x';
  const nodes = await prisma.node.findMany({
    where: { phaseId, deptId },
    select: { id: true },
  });
  let maxSeq = 0;
  for (const n of nodes) {
    const match = n.id.match(/_(\d+)$/);
    if (match) maxSeq = Math.max(maxSeq, parseInt(match[1]));
  }
  return `${deptCode}${phaseId}_${maxSeq + 1}`;
}

export async function getAll() {
  const rows = await prisma.node.findMany({
    include: { phase: true, department: true },
    orderBy: [
      { phase: { sortOrder: 'asc' } },
      { department: { sortOrder: 'asc' } },
      { sortOrder: 'asc' },
    ],
  });
  return rows.map((n: any) => ({
    id: n.id,
    title: n.title,
    type: n.type,
    detail: n.detail || '',
    sortOrder: n.sortOrder,
    phaseId: n.phaseId,
    phaseName: n.phase.name,
    deptId: n.deptId,
    deptName: n.department.name,
  }));
}

export async function getByPhase(phaseId: number) {
  const rows = await prisma.node.findMany({
    where: { phaseId },
    include: { phase: true, department: true },
    orderBy: [{ department: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
  return rows.map((n: any) => ({
    id: n.id,
    title: n.title,
    type: n.type,
    detail: n.detail || '',
    sortOrder: n.sortOrder,
    phaseId: n.phaseId,
    phaseName: n.phase.name,
    deptId: n.deptId,
    deptName: n.department.name,
  }));
}

export async function getById(id: string) {
  const n = await prisma.node.findUnique({
    where: { id },
    include: { phase: true, department: true },
  });
  if (!n) return null;
  return {
    id: n.id,
    title: n.title,
    type: n.type,
    detail: n.detail || '',
    sortOrder: n.sortOrder,
    phaseId: n.phaseId,
    phaseName: n.phase.name,
    deptId: n.deptId,
    deptName: n.department.name,
  };
}

export async function create(data: {
  title: string;
  type: string;
  detail: string;
  phaseId: number;
  deptId: number;
}) {
  const id = await generateId(data.phaseId, data.deptId);
  const maxSort = await prisma.node.aggregate({
    where: { phaseId: data.phaseId, deptId: data.deptId },
    _max: { sortOrder: true },
  });
  return prisma.node.create({
    data: {
      id,
      title: data.title,
      type: data.type,
      detail: data.detail,
      phaseId: data.phaseId,
      deptId: data.deptId,
      sortOrder: (maxSort._max.sortOrder || 0) + 1,
    },
  });
}

export async function update(
  id: string,
  fields: { title?: string; type?: string; detail?: string; phaseId?: number; deptId?: number }
) {
  return prisma.node.update({ where: { id }, data: fields });
}

export async function remove(id: string) {
  await prisma.connection.deleteMany({ where: { OR: [{ fromNode: id }, { toNode: id }] } });
  return prisma.node.delete({ where: { id } });
}

export async function updatePhase(id: string, phaseId: number) {
  return prisma.node.update({ where: { id }, data: { phaseId } });
}

export async function updateDept(id: string, deptId: number) {
  return prisma.node.update({ where: { id }, data: { deptId } });
}

export async function updateDetail(id: string, detail: string) {
  return prisma.node.update({ where: { id }, data: { detail } });
}

export async function updateSortOrder(
  phaseId: number,
  deptId: number,
  orders: { id: string; order: number }[]
) {
  const updates = orders.map((o) =>
    prisma.node.update({ where: { id: o.id }, data: { sortOrder: o.order } })
  );
  await prisma.$transaction(updates);
}

export async function getMaxSortOrder(phaseId: number, deptId: number) {
  const result = await prisma.node.aggregate({
    where: { phaseId, deptId },
    _max: { sortOrder: true },
  });
  return result._max.sortOrder || 0;
}
