import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PhaseDao, DepartmentDao, NodeDao, ConnectionDao } from '@/db/dao'
import type { Phase, Department, FlowNodeFull, Connection } from '@/types'

export const useFlowStore = defineStore('flow', () => {
  const phases = ref<Phase[]>([])
  const departments = ref<Department[]>([])
  const nodes = ref<FlowNodeFull[]>([])
  const connections = ref<Connection[]>([])
  const isReady = ref(false)

  const phaseDao = new PhaseDao()
  const deptDao = new DepartmentDao()
  const nodeDao = new NodeDao()
  const connDao = new ConnectionDao()

  const nodesByPhaseDept = computed(() => {
    const map = new Map<string, FlowNodeFull[]>()
    for (const node of nodes.value) {
      const key = `${node.phaseId}-${node.deptId}`
      let arr = map.get(key)
      if (!arr) {
        arr = []
        map.set(key, arr)
      }
      arr.push(node)
    }
    return map
  })

  const phaseDeptMap = computed(() => {
    const map = new Map<number, Set<number>>()
    for (const node of nodes.value) {
      let set = map.get(node.phaseId)
      if (!set) {
        set = new Set()
        map.set(node.phaseId, set)
      }
      set.add(node.deptId)
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

  async function init() {
    await reloadAll()
    isReady.value = true
  }

  async function reloadAll() {
    phases.value = await phaseDao.getAll()
    departments.value = await deptDao.getAll()
    nodes.value = await nodeDao.getAll()
    connections.value = await connDao.getAll()
  }

  async function updateNodePhase(nodeId: string, newPhaseId: number) {
    await nodeDao.updatePhase(nodeId, newPhaseId)
    await reloadAll()
  }

  async function updateNodeDept(nodeId: string, newDeptId: number) {
    await nodeDao.updateDept(nodeId, newDeptId)
    await reloadAll()
  }

  async function moveNode(nodeId: string, phaseId: number, deptId: number) {
    await nodeDao.moveNode(nodeId, phaseId, deptId)
    await reloadAll()
  }

  async function updateNodeDetail(nodeId: string, detail: string) {
    await nodeDao.updateDetail(nodeId, detail)
    const node = nodeMap.value.get(nodeId)
    if (node) {
      node.detail = detail
    }
  }

  async function updateSortOrder(phaseId: number, deptId: number, idsInOrder: string[]) {
    const orders = idsInOrder.map((id, idx) => ({ id, order: idx + 1 }))
    await nodeDao.updateSortOrder(phaseId, deptId, orders)
    await reloadAll()
  }

  async function addConnection(fromNode: string, toNode: string, type: string, description: string) {
    await connDao.create(fromNode, toNode, type, description)
    connections.value = await connDao.getAll()
  }

  async function removeConnection(id: number) {
    await connDao.deleteById(id)
    connections.value = await connDao.getAll()
  }

  async function createPhase(name: string, sortOrder: number) {
    await phaseDao.create(name, sortOrder)
    phases.value = await phaseDao.getAll()
  }

  async function updatePhaseAdmin(id: number, name: string, sortOrder: number) {
    await phaseDao.update(id, name, sortOrder)
    phases.value = await phaseDao.getAll()
  }

  async function deletePhase(id: number) {
    await phaseDao.delete(id)
    phases.value = await phaseDao.getAll()
  }

  async function createDept(name: string, sortOrder: number) {
    await deptDao.create(name, sortOrder)
    departments.value = await deptDao.getAll()
  }

  async function updateDeptAdmin(id: number, name: string, sortOrder: number) {
    await deptDao.update(id, name, sortOrder)
    departments.value = await deptDao.getAll()
  }

  async function deleteDept(id: number) {
    await deptDao.delete(id)
    departments.value = await deptDao.getAll()
  }

  async function createNode(title: string, type: string, detail: string, phaseId: number, deptId: number) {
    await nodeDao.create('', title, type, detail, phaseId, deptId)
    nodes.value = await nodeDao.getAll()
  }

  async function updateNodeAdmin(nodeId: string, fields: { title?: string; type?: string; detail?: string; phaseId?: number; deptId?: number; isHighlighted?: boolean }) {
    await nodeDao.update(nodeId, fields)
    nodes.value = await nodeDao.getAll()
  }

  async function deleteNode(nodeId: string) {
    await nodeDao.delete(nodeId)
    await reloadAll()
  }

  async function updateConnection(id: number, type: string, description: string) {
    await connDao.update(id, type, description)
    connections.value = await connDao.getAll()
  }

  async function resetToDefault() {
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
    moveNode,
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
