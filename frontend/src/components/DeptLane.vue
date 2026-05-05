<template>
  <div
    :class="['dept-lane', { collapsed: isCollapsed }]"
    :data-dept="deptName"
    :data-phase="phaseId"
  >
    <div class="dept-label" @click="uiStore.toggleDeptCollapse(phaseId, deptId)">
      <span>{{ deptName }}</span>
      <span class="dept-actions">
        <button class="add-btn-inline" @click.stop="showAddForm = true" title="添加节点">+</button>
        <span class="dept-toggle">▼</span>
      </span>
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
      <div v-if="showAddForm" class="add-node-card" @click.stop>
        <input
          v-model="newNodeTitle"
          placeholder="节点名称"
          @keyup.enter="confirmAdd"
          ref="addInputRef"
        />
        <select v-model="newNodeType">
          <option value="task">任务</option>
          <option value="review">评审/汇报</option>
          <option value="deliverable">交付物</option>
          <option value="decision">决策</option>
          <option value="milestone">里程碑</option>
        </select>
        <div class="add-actions">
          <button class="btn-confirm" @click="confirmAdd">添加</button>
          <button class="btn-cancel" @click="showAddForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
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
const showAddForm = ref(false)
const newNodeTitle = ref('')
const newNodeType = ref('task')
const addInputRef = ref<HTMLInputElement>()

watch(showAddForm, (val) => {
  if (val) {
    newNodeTitle.value = ''
    newNodeType.value = 'task'
    nextTick(() => addInputRef.value && addInputRef.value.focus())
  }
})

const isCollapsed = computed(() => {
  return uiStore.collapsedDeptKeys.has(`${props.phaseId}-${props.deptId}`)
})

async function confirmAdd() {
  const title = newNodeTitle.value.trim()
  if (!title) {
    uiStore.showToast('请输入节点名称', 'warn')
    return
  }
  await flowStore.createNode(title, newNodeType.value, '', props.phaseId, props.deptId)
  showAddForm.value = false
  uiStore.showToast('节点已添加', 'success')
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  const srcId = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || document.body.dataset.dragSrcId
  if (!srcId) return
  const srcNode = flowStore.nodeMap.get(srcId)
  if (!srcNode) return
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
  const srcId = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || document.body.dataset.dragSrcId
  if (!srcId) return
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
.dept-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-btn-inline {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: none;
  background: var(--primary-light);
  color: white;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.dept-label:hover .add-btn-inline {
  opacity: 1;
}
.add-btn-inline:hover {
  background: var(--primary);
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
.add-node-card {
  background: white;
  border: 1px dashed var(--primary-light);
  border-radius: 6px;
  padding: 8px;
  min-width: 160px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.add-node-card input {
  width: 100%;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 6px;
  font-size: 12px;
  outline: none;
}
.add-node-card input:focus {
  border-color: var(--primary);
}
.add-node-card select {
  width: 100%;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 4px;
  font-size: 12px;
  outline: none;
  background: white;
}
.add-actions {
  display: flex;
  gap: 6px;
}
.add-actions button {
  flex: 1;
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: white;
  font-size: 11px;
  cursor: pointer;
}
.add-actions .btn-confirm {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.add-actions .btn-confirm:hover {
  background: var(--primary-light);
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
