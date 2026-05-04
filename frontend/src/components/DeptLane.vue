<template>
  <div
    :class="['dept-lane', { collapsed: isCollapsed }]"
    :data-dept="deptName"
    :data-phase="phaseId"
  >
    <div class="dept-label" @click="uiStore.toggleDeptCollapse(phaseId, deptId)">
      <span>{{ deptName }}</span>
      <span class="dept-toggle">▼</span>
    </div>
    <div
      class="lane-tasks"
      :class="{ 'drag-over': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="isDragOver = false"
      @drop="handleDrop"
    >
      <TaskNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FlowNodeFull } from '@/types'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'
import TaskNode from './TaskNode.vue'

const props = defineProps<{
  phaseId: number
  deptId: number
  deptName: string
  nodes: FlowNodeFull[]
}>()

const emit = defineEmits<{
  dragstart: [nodeId: string]
  dragend: []
  drop: [idsInOrder: string[]]
}>()

const uiStore = useUiStore()
const flowStore = useFlowStore()

const isDragOver = ref(false)

const isCollapsed = computed(() => {
  return uiStore.collapsedDeptKeys.has(`${props.phaseId}-${props.deptId}`)
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  const srcId = e.dataTransfer && e.dataTransfer.getData('text/plain')
  if (!srcId) return
  const srcNode = flowStore.nodeMap.get(srcId)
  if (!srcNode) return
  if (srcNode.phaseId !== props.phaseId || srcNode.deptId !== props.deptId) {
    isDragOver.value = false
    return
  }
  isDragOver.value = true

  const container = e.currentTarget as HTMLElement
  const afterElement = getDragAfterElement(container, e.clientX, e.clientY)
  const draggable = document.querySelector(`[data-id="${srcId}"]`)
  if (!draggable) return
  if (afterElement == null) {
    container.appendChild(draggable)
  } else {
    container.insertBefore(draggable, afterElement)
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const srcId = e.dataTransfer && e.dataTransfer.getData('text/plain')
  if (!srcId) return
  const srcNode = flowStore.nodeMap.get(srcId)
  if (!srcNode) return
  if (srcNode.phaseId !== props.phaseId || srcNode.deptId !== props.deptId) {
    uiStore.showToast('仅支持同部门内排序', 'warn')
    flowStore.reloadAll()
    return
  }
  const container = e.currentTarget as HTMLElement
  const ids = Array.from(container.querySelectorAll('.task-node')).map(
    (el) => (el as HTMLElement).dataset.id!
  )
  emit('drop', ids)
}

function getDragAfterElement(container: HTMLElement, x: number, y: number) {
  const draggableElements = [
    ...container.querySelectorAll('.task-node:not(.sort-dragging)'),
  ] as HTMLElement[]

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect()
      const offsetX = x - (box.left + box.width / 2)
      const offsetY = y - (box.top + box.height / 2)
      const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
      if (dist < closest.dist) {
        return { dist, element: child }
      }
      return closest
    },
    { dist: Number.POSITIVE_INFINITY, element: null as HTMLElement | null }
  ).element
}
</script>

<style scoped>
.dept-lane {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.dept-lane.collapsed .lane-tasks {
  display: none;
}
.dept-lane.collapsed .dept-label {
  opacity: 0.5;
}
.dept-label {
  width: 110px;
  flex-shrink: 0;
  padding: 8px 10px;
  background: #edf2f7;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  position: sticky;
  left: 0;
}
.dept-label:hover {
  background: #e2e8f0;
  color: var(--primary);
}
.dept-toggle {
  font-size: 10px;
  transition: transform 0.2s;
}
.dept-lane.collapsed .dept-toggle {
  transform: rotate(-90deg);
}
.lane-tasks {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 40px;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
  position: relative;
}
.lane-tasks.drag-over {
  background: #ebf8ff;
  box-shadow: inset 0 0 0 2px var(--primary-light);
}
@media (max-width: 768px) {
  .dept-lane {
    flex-direction: column;
    gap: 8px;
  }
  .dept-label {
    width: 100%;
    position: relative;
  }
}
</style>
