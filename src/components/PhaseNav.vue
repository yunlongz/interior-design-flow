<template>
  <div class="phase-nav">
    <div class="phase-nav-header">阶段导航</div>
    <div
      v-for="phase in flowStore.phases"
      :key="phase.id"
      :class="['phase-nav-item', { active: uiStore.selectedPhaseId === phase.id }]"
      @click="selectPhase(phase.id)"
    >
      <span>{{ phase.name }}</span>
      <span class="nav-count">{{ getCount(phase.id) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFlowStore } from '@/stores/flowStore'
import { useUiStore } from '@/stores/uiStore'

const flowStore = useFlowStore()
const uiStore = useUiStore()

function getCount(phaseId: number): number {
  const deptIds = flowStore.phaseDeptMap.get(phaseId)
  if (!deptIds) return 0
  return (Array.from(deptIds) as number[]).reduce((sum: number, deptId: number) => {
    const nodes = flowStore.nodesByPhaseDept.get(`${phaseId}-${deptId}`)
    return sum + (nodes && nodes.length || 0)
  }, 0)
}

function selectPhase(phaseId: number) {
  uiStore.setSelectedPhase(phaseId)
  const block = document.querySelector(`[data-phase-id="${phaseId}"]`)
  if (block) {
    block.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.phase-nav {
  width: 180px;
  background: white;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 50;
  overflow-y: auto;
}
.phase-nav-header {
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.phase-nav-item {
  padding: 10px 16px;
  font-size: 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
  line-height: 1.4;
  position: relative;
}
.phase-nav-item:hover {
  background: var(--bg);
}
.phase-nav-item.active {
  background: #edf2f7;
  border-left-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}
.nav-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 1px 6px;
  border-radius: 10px;
}
@media (max-width: 768px) {
  .phase-nav {
    display: none;
  }
}
</style>
