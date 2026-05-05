<template>
  <div
    :class="['phase-block', { collapsed: isCollapsed }]"
    :data-phase-id="phase.id"
    ref="blockRef"
  >
    <div class="phase-header" @click="uiStore.togglePhaseCollapse(phase.id)">
      <span class="toggle-icon">▼</span>
      <h2>{{ phase.name }}</h2>
      <span class="phase-meta">{{ deptCount }} 部门 · {{ taskCount }} 节点</span>
    </div>
    <div class="phase-content">
      <DeptLane
        v-for="deptId in deptIds"
        :key="deptId"
        :phase-id="phase.id"
        :dept-id="deptId"
        :dept-name="getDeptName(deptId)"
        :nodes="getNodes(deptId)"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
        @drop="(ids) => $emit('drop', phase.id, deptId, ids)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Phase } from '@/types'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'
import DeptLane from './DeptLane.vue'

const props = defineProps<{
  phase: Phase
}>()

const emit = defineEmits<{
  dragstart: [nodeId: string]
  dragend: []
  drop: [phaseId: number, deptId: number, ids: string[]]
}>()

const uiStore = useUiStore()
const flowStore = useFlowStore()

const isCollapsed = computed(() => uiStore.collapsedPhaseIds.has(props.phase.id))

const deptIds = computed(() => {
  const ids = flowStore.phaseDeptMap.get(props.phase.id)
  if (!ids) return []
  return Array.from(ids).filter((id) => uiStore.activeDeptIds.has(id)) as number[]
})

const deptCount = computed(() => deptIds.value.length)
const taskCount = computed(() => {
  return deptIds.value.reduce((sum, deptId) => {
    const nodes = flowStore.nodesByPhaseDept.get(`${props.phase.id}-${deptId}`)
    return sum + (nodes && nodes.length || 0)
  }, 0)
})

function getDeptName(deptId: number): string {
  const dept = flowStore.departments.find((d: any) => d.id === deptId)
  return (dept && dept.name) || ''
}

function getNodes(deptId: number) {
  return flowStore.nodesByPhaseDept.get(`${props.phase.id}-${deptId}`) || []
}
</script>

<style scoped>
.phase-block {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: margin 0.3s;
}
.phase-block.collapsed {
  margin-bottom: 12px;
}
.phase-block.collapsed .phase-content {
  display: none;
}
.phase-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
}
.phase-header .toggle-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 12px;
  transition: transform 0.3s;
  opacity: 0.8;
}
.phase-block.collapsed .toggle-icon {
  transform: rotate(-90deg);
}
.phase-header h2 {
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}
.phase-header .phase-meta {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 12px;
}
.phase-content {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
