<template>
  <div
    :class="[
      'task-node',
      `type-${node.type}`,
      {
        active: isActive,
        related: isRelated,
        dimmed: isDimmed,
        expanded: isExpanded,
        'sort-dragging': isDragging,
        'node-highlighted': props.node.isHighlighted,
      },
    ]"
    :data-id="node.id"
    :data-dept="node.deptName"
    draggable="true"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="node-type-badge"></div>
    <button class="node-delete-btn" @click.stop="handleDelete">×</button>
    <div class="node-title">{{ node.title }}</div>
    <div v-if="node.detail && isExpanded" class="node-detail" v-html="detailHtml"></div>
    <div
      v-if="node.detail"
      class="node-detail-toggle"
      @click.stop="isExpanded = !isExpanded"
    >
      ▼
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FlowNodeFull } from '@/types'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  node: FlowNodeFull
}>()

const emit = defineEmits<{
  dragstart: [nodeId: string]
  dragend: []
}>()

const uiStore = useUiStore()
const flowStore = useFlowStore()
const { activeNodeId } = storeToRefs(uiStore)

const isExpanded = ref(false)
const isDragging = ref(false)

const isActive = computed(() => activeNodeId.value === props.node.id)

const isRelated = computed(() => {
  if (!activeNodeId.value) return false
  return flowStore.connections.some(
    (c) =>
      (c.fromNode === activeNodeId.value && c.toNode === props.node.id) ||
      (c.toNode === activeNodeId.value && c.fromNode === props.node.id)
  )
})

const isDimmed = computed(() => {
  if (!activeNodeId.value) return false
  return activeNodeId.value !== props.node.id && !isRelated.value
})

const detailHtml = computed(() => {
  return props.node.detail.replace(/\n/g, '<br>')
})

function handleClick() {
  if (isActive.value) {
    uiStore.setActiveNode(null)
  } else {
    uiStore.setActiveNode(props.node.id)
    // 自动展开当前节点及上下游节点所在部门
    uiStore.addDeptActive(props.node.deptId)
    for (const c of flowStore.connections) {
      if (c.fromNode === props.node.id) {
        const toNode = flowStore.nodeMap.get(c.toNode)
        if (toNode) uiStore.addDeptActive(toNode.deptId)
      } else if (c.toNode === props.node.id) {
        const fromNode = flowStore.nodeMap.get(c.fromNode)
        if (fromNode) uiStore.addDeptActive(fromNode.deptId)
      }
    }
  }
}

function handleDragStart(e: DragEvent) {
  isDragging.value = true
  emit('dragstart', props.node.id)
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', props.node.id)
  document.body.dataset.dragSrcId = props.node.id
}

function handleDragEnd() {
  isDragging.value = false
  emit('dragend')
  delete document.body.dataset.dragSrcId
}

async function handleDelete() {
  if (!confirm(`确定删除节点「${props.node.title}」吗？\n相关连接关系也会被一并删除。`)) return
  await flowStore.deleteNode(props.node.id)
}
</script>

<style scoped>
.task-node {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 14px;
  min-width: 160px;
  max-width: 260px;
  box-shadow: var(--shadow);
  cursor: grab;
  transition: all 0.15s;
  position: relative;
  font-size: 12px;
  line-height: 1.5;
  user-select: none;
}
.task-node:hover {
  box-shadow: var(--shadow-lg);
  border-color: #cbd5e0;
  transform: translateY(-1px);
}
.task-node.active {
  box-shadow: 0 0 0 2px var(--accent), var(--shadow-lg);
  border-color: var(--accent);
  background: #fff5f5;
}
.task-node.related {
  box-shadow: 0 0 0 2px var(--primary-light), var(--shadow-lg);
  border-color: var(--primary-light);
  background: #f7fafc;
}
.task-node.dimmed {
  opacity: 0.25;
  filter: grayscale(0.6);
  pointer-events: none;
}
.task-node.sort-dragging {
  opacity: 0.3;
  cursor: grabbing;
  border: 2px dashed var(--primary);
  background: #ebf8ff;
}
.task-node.node-highlighted {
  box-shadow: 0 0 0 3px #f6ad55, 0 4px 12px rgba(246, 173, 85, 0.35);
  border-color: #f6ad55;
}
.task-node.node-highlighted .node-title {
  color: #c05621;
}
.node-delete-btn {
  position: absolute;
  top: 4px;
  right: 18px;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
  z-index: 2;
}
.task-node:hover .node-delete-btn {
  opacity: 1;
}
.node-delete-btn:hover {
  background: #fee;
  color: var(--accent);
}
.node-title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  padding-right: 16px;
}
.node-type-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.node-detail {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.4;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}
.node-detail-toggle {
  position: absolute;
  bottom: 4px;
  right: 6px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
}
.node-detail-toggle:hover {
  background: var(--bg);
  color: var(--primary);
}
.task-node.expanded .node-detail-toggle {
  transform: rotate(180deg);
}

.type-task .node-type-badge { background: var(--primary); }
.type-review { border-left: 3px solid var(--review); }
.type-review .node-type-badge { background: var(--review); }
.type-deliverable { border-left: 3px solid var(--deliverable); }
.type-deliverable .node-type-badge { background: var(--deliverable); }
.type-decision { border-left: 3px solid var(--decision); }
.type-decision .node-type-badge { background: var(--decision); }
.type-milestone { border-left: 3px solid var(--milestone); }
.type-milestone .node-type-badge { background: var(--milestone); }
</style>
