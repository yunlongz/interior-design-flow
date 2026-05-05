import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const activeNodeId = ref<string | null>(null)
  const selectedPhaseId = ref<number | null>(null)
  const searchKeyword = ref('')
  const activeDeptIds = ref<Set<number>>(new Set())
  const collapsedPhaseIds = ref<Set<number>>(new Set())
  const collapsedDeptKeys = ref<Set<string>>(new Set())
  const scale = ref(1)
  const toast = ref<{ text: string; type: 'success' | 'warn' | 'info'; show: boolean } | null>(null)

  function setActiveNode(id: string | null) {
    activeNodeId.value = id
  }

  function setSelectedPhase(id: number | null) {
    selectedPhaseId.value = id
  }

  function toggleDeptActive(deptId: number) {
    if (activeDeptIds.value.has(deptId)) {
      activeDeptIds.value.delete(deptId)
    } else {
      activeDeptIds.value.add(deptId)
    }
  }

  function addDeptActive(deptId: number) {
    activeDeptIds.value.add(deptId)
  }

  function setAllDeptsActive(ids: number[]) {
    activeDeptIds.value = new Set(ids)
  }

  function togglePhaseCollapse(phaseId: number) {
    if (collapsedPhaseIds.value.has(phaseId)) {
      collapsedPhaseIds.value.delete(phaseId)
    } else {
      collapsedPhaseIds.value.add(phaseId)
    }
  }

  function toggleDeptCollapse(phaseId: number, deptId: number) {
    const key = `${phaseId}-${deptId}`
    if (collapsedDeptKeys.value.has(key)) {
      collapsedDeptKeys.value.delete(key)
    } else {
      collapsedDeptKeys.value.add(key)
    }
  }

  function setScale(val: number) {
    scale.value = Math.max(0.3, Math.min(2.5, val))
  }

  function showToast(text: string, type: 'success' | 'warn' | 'info' = 'info') {
    toast.value = { text, type, show: true }
    setTimeout(() => {
      if (toast.value && toast.value.text === text) {
        toast.value = null
      }
    }, 2500)
  }

  function resetView() {
    activeNodeId.value = null
    searchKeyword.value = ''
    scale.value = 1
    collapsedPhaseIds.value.clear()
    collapsedDeptKeys.value.clear()
  }

  return {
    activeNodeId,
    selectedPhaseId,
    searchKeyword,
    activeDeptIds,
    collapsedPhaseIds,
    collapsedDeptKeys,
    scale,
    toast,
    setActiveNode,
    setSelectedPhase,
    toggleDeptActive,
    addDeptActive,
    setAllDeptsActive,
    togglePhaseCollapse,
    toggleDeptCollapse,
    setScale,
    showToast,
    resetView,
  }
})
