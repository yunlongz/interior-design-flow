import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PhaseDao, DepartmentDao, NodeDao, ConnectionDao } from '@/db/dao'
import { dbManager } from '@/db/DatabaseManager'
import type { Phase, Department, FlowNodeFull, Connection } from '@/types'

export const useFlowStore = defineStore('flow', () => {
  // State
  const phases = ref<Phase[]>([])
  const departments = ref<Department[]>([])
  const nodes = ref<FlowNodeFull[]>([])
  const connections = ref<Connection[]>([])
  const isReady = ref(false)

  // DAO instances
  const phaseDao = new PhaseDao()
  const deptDao = new DepartmentDao()
  const nodeDao = new NodeDao()
  const connDao = new ConnectionDao()

  // Computed
  const nodesByPhaseDept = computed(() => {
    const map = new Map<string, FlowNodeFull[]>()
    for (const node of nodes.value) {
      const key = `${node.phaseId}-${node.deptId}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(node)
    }
    return map
  })

  const phaseDeptMap = computed(() => {
    const map = new Map<number, Set<number>>()
    for (const node of nodes.value) {
      if (!map.has(node.phaseId)) map.set(node.phaseId, new Set())
      map.get(node.phaseId)!.add(node.deptId)
    }
    return map
  })

  const nodeMap = computed(() => {
    const map = new Map<string, FlowNodeFull>()
    for (const node of nodes.value) {
      map.set(node.id, node)
    }
    return map
  })

  // Actions
  async function init() {
    await dbManager.init()
    await reloadAll()
    isReady.value = true
  }

  async function reloadAll() {
    phases.value = phaseDao.getAll()
    departments.value = deptDao.getAll()
    nodes.value = nodeDao.getAll()
    connections.value = connDao.getAll()
  }

  // Node operations
  async function updateNodePhase(nodeId: string, newPhaseId: number) {
    nodeDao.updatePhase(nodeId, newPhaseId)
    await dbManager.persist()
    await reloadAll()
  }

  async function updateNodeDept(nodeId: string, newDeptId: number) {
    nodeDao.updateDept(nodeId, newDeptId)
    await dbManager.persist()
    await reloadAll()
  }

  async function updateNodeDetail(nodeId: string, detail: string) {
    nodeDao.updateDetail(nodeId, detail)
    await dbManager.persist()
    const node = nodeMap.value.get(nodeId)
    if (node) {
      node.detail = detail
    }
  }

  async function updateSortOrder(phaseId: number, deptId: number, idsInOrder: string[]) {
    const orders = idsInOrder.map((id, idx) => ({ id, order: idx + 1 }))
    nodeDao.updateSortOrder(phaseId, deptId, orders)
    await dbManager.persist()
    await reloadAll()
  }

  // Connection operations
  async function addConnection(fromNode: string, toNode: string, type: string, description: string) {
    connDao.create(fromNode, toNode, type, description)
    await dbManager.persist()
    connections.value = connDao.getAll()
  }

  async function removeConnection(id: number) {
    connDao.deleteById(id)
    await dbManager.persist()
    connections.value = connDao.getAll()
  }

  // Admin: Phase CRUD
  async function createPhase(name: string, sortOrder: number) {
    phaseDao.create(name, sortOrder)
    await dbManager.persist()
    phases.value = phaseDao.getAll()
  }

  async function updatePhaseAdmin(id: number, name: string, sortOrder: number) {
    phaseDao.update(id, name, sortOrder)
    await dbManager.persist()
    phases.value = phaseDao.getAll()
  }

  async function deletePhase(id: number) {
    phaseDao.delete(id)
    await dbManager.persist()
    phases.value = phaseDao.getAll()
  }

  // Admin: Department CRUD
  async function createDept(name: string, sortOrder: number) {
    deptDao.create(name, sortOrder)
    await dbManager.persist()
    departments.value = deptDao.getAll()
  }

  async function updateDeptAdmin(id: number, name: string, sortOrder: number) {
    deptDao.update(id, name, sortOrder)
    await dbManager.persist()
    departments.value = deptDao.getAll()
  }

  async function deleteDept(id: number) {
    deptDao.delete(id)
    await dbManager.persist()
    departments.value = deptDao.getAll()
  }

  // Admin: Node CRUD
  async function createNode(title: string, type: string, detail: string, phaseId: number, deptId: number) {
    const id = nodeDao.generateId(phaseId, deptId)
    nodeDao.create(id, title, type, detail, phaseId, deptId)
    await dbManager.persist()
    nodes.value = nodeDao.getAll()
  }

  async function updateNodeAdmin(nodeId: string, fields: { title?: string; type?: string; detail?: string; phaseId?: number; deptId?: number }) {
    nodeDao.update(nodeId, fields)
    await dbManager.persist()
    nodes.value = nodeDao.getAll()
  }

  async function deleteNode(nodeId: string) {
    nodeDao.delete(nodeId)
    await dbManager.persist()
    await reloadAll()
  }

  // Admin: Connection CRUD
  async function updateConnection(id: number, type: string, description: string) {
    connDao.update(id, type, description)
    await dbManager.persist()
    connections.value = connDao.getAll()
  }

  async function resetToDefault() {
    await dbManager.resetToDefault()
    await reloadAll()
  }

  return {
    phases,
    departments,
    nodes,
    connections,
    isReady,
    nodesByPhaseDept,
    phaseDeptMap,
    nodeMap,
    init,
    reloadAll,
    updateNodePhase,
    updateNodeDept,
    updateNodeDetail,
    updateSortOrder,
    addConnection,
    removeConnection,
    createPhase,
    updatePhaseAdmin,
    deletePhase,
    createDept,
    updateDeptAdmin,
    deleteDept,
    createNode,
    updateNodeAdmin,
    deleteNode,
    updateConnection,
    resetToDefault,
  }
})
