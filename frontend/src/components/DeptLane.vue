<template>
  <div
    :class="['dept-lane', { collapsed: isCollapsed }]"
    :data-dept="deptId"
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
      ref="laneRef"
      class="lane-tasks"
    >
      <TaskNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
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
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import type { FlowNodeFull } from '@/types'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'
import TaskNode from './TaskNode.vue'
import Sortable from 'sortablejs'

const props = defineProps<{
  phaseId: number
  deptId: number
  deptName: string
  nodes: FlowNodeFull[]
}>()

const emit = defineEmits<{
  move: [nodeId: string, phaseId: number, deptId: number, ids: string[]]
  reorder: [phaseId: number, deptId: number, ids: string[]]
}>()

const uiStore = useUiStore()
const flowStore = useFlowStore()

const laneRef = ref<HTMLElement>()
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

let sortable: Sortable | null = null

onMounted(() => {
  if (!laneRef.value) return
  sortable = new Sortable(laneRef.value, {
    group: {
      name: 'nodes',
      pull: true,
      put: true,
    },
    animation: 150,
    ghostClass: 'sort-ghost',
    dragClass: 'sort-drag',
    chosenClass: 'sort-chosen',
    forceFallback: true,
    fallbackClass: 'sort-fallback',
    onEnd: (evt) => {
      const nodeId = evt.item.dataset.id
      if (!nodeId) return
      const ids = Array.from(evt.to.querySelectorAll('.task-node')).map(
        (el) => (el as HTMLElement).dataset.id!
      )
      if (evt.from !== evt.to) {
        const toLane = evt.to.closest('.dept-lane') as HTMLElement | null
        const toPhaseId = Number(toLane?.dataset.phase)
        const toDeptId = Number(toLane?.dataset.dept)
        emit('move', nodeId, toPhaseId, toDeptId, ids)
      } else {
        emit('reorder', props.phaseId, props.deptId, ids)
      }
    },
  })
})

onUnmounted(() => {
  sortable?.destroy()
})
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
