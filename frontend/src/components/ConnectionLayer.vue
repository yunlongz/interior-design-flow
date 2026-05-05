<template>
  <svg class="connections-svg" :width="canvasSize.width" :height="canvasSize.height">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#a0aec0" />
      </marker>
      <marker id="arrow-highlight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#c53030" />
      </marker>
      <marker id="arrow-upstream" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#2c5282" />
      </marker>
    </defs>
    <path
      v-for="path in paths"
      :key="path.idx"
      :d="path.d"
      :stroke="path.stroke"
      :stroke-width="path.strokeWidth"
      fill="none"
      :marker-end="path.markerEnd"
      :class="path.className"
      @click="(e) => showTooltip(e, path.conn)"
      @mouseenter="hoveredIdx = path.idx"
      @mouseleave="hoveredIdx = null"
    />
  </svg>
  <div
    v-if="tooltip.show"
    class="conn-tooltip"
    :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
  >
    <div class="conn-type">{{ tooltip.type }}</div>
    <div>{{ tooltip.desc }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Connection } from '@/types'
import { useFlowStore } from '@/stores/flowStore'
import { useUiStore } from '@/stores/uiStore'

const props = defineProps<{
  canvasRef?: HTMLElement | null
}>()

const flowStore = useFlowStore()
const uiStore = useUiStore()

const canvasSize = ref({ width: 0, height: 0 })
const hoveredIdx = ref<number | null>(null)
const tooltip = ref({ show: false, x: 0, y: 0, type: '', desc: '' })

const paths = computed(() => {
  const activeId = uiStore.activeNodeId
  const container = props.canvasRef
  if (!container) return []

  const containerRect = container.getBoundingClientRect()
  const result: Array<{
    idx: number
    d: string
    stroke: string
    strokeWidth: number
    markerEnd: string
    className: string
    conn: Connection
    hovered: boolean
  }> = []

  for (let i = 0; i < flowStore.connections.length; i++) {
    const conn = flowStore.connections[i]
    const fromEl = document.querySelector(`[data-id="${conn.fromNode}"]`) as HTMLElement
    const toEl = document.querySelector(`[data-id="${conn.toNode}"]`) as HTMLElement
    if (!fromEl || !toEl) continue

    const fromRect = fromEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()

    const x1 = fromRect.right - containerRect.left
    const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
    const x2 = toRect.left - containerRect.left
    const y2 = toRect.top + toRect.height / 2 - containerRect.top

    const cp1x = x1 + Math.max(60, (x2 - x1) * 0.4)
    const cp1y = y1
    const cp2x = x2 - Math.max(60, (x2 - x1) * 0.4)
    const cp2y = y2
    const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`

    let isHighlighted = false
    let isUpstream = false
    if (activeId) {
      if (conn.fromNode === activeId) {
        isHighlighted = true
      } else if (conn.toNode === activeId) {
        isUpstream = true
      }
    }

    const isHovered = hoveredIdx.value === i

    let stroke = '#a0aec0'
    let strokeWidth = 1.5
    let markerEnd = 'url(#arrow)'
    let className = activeId ? 'visible' : ''

    if (isHighlighted) {
      stroke = '#c53030'
      strokeWidth = 3
      markerEnd = 'url(#arrow-highlight)'
      className = 'visible highlighted'
    } else if (isUpstream) {
      stroke = '#2c5282'
      strokeWidth = 2.5
      markerEnd = 'url(#arrow-upstream)'
      className = 'visible upstream'
    } else if (activeId) {
      className = ''
    } else if (isHovered) {
      stroke = '#2c5282'
      strokeWidth = 3
    }

    result.push({ idx: i, d, stroke, strokeWidth, markerEnd, className, conn, hovered: isHovered })
  }

  return result
})

function showTooltip(e: MouseEvent, conn: Connection) {
  const wrapper = props.canvasRef && props.canvasRef.parentElement
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  tooltip.value = {
    show: true,
    x: e.clientX - rect.left + wrapper.scrollLeft,
    y: e.clientY - rect.top + wrapper.scrollTop - 70,
    type: conn.type,
    desc: conn.description,
  }
  setTimeout(() => {
    tooltip.value.show = false
  }, 3000)
}

function updateSize() {
  const container = props.canvasRef
  if (!container) return
  canvasSize.value = {
    width: container.scrollWidth,
    height: container.scrollHeight,
  }
}

let observer: ResizeObserver | null = null

watch(
  () => flowStore.nodes,
  () => {
    nextTick(updateSize)
  },
  { deep: true }
)

watch(
  () => uiStore.collapsedPhaseIds,
  () => {
    nextTick(updateSize)
  },
  { deep: true }
)

watch(
  () => uiStore.collapsedDeptKeys,
  () => {
    nextTick(updateSize)
  },
  { deep: true }
)

onMounted(() => {
  updateSize()
  observer = new ResizeObserver(updateSize)
  if (props.canvasRef) {
    observer.observe(props.canvasRef)
  }
})

onUnmounted(() => {
  observer && observer.disconnect()
})
</script>

<style scoped>
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
}
.connections-svg path {
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s, stroke 0.2s, opacity 0.3s;
  opacity: 0;
}
.connections-svg path.visible {
  opacity: 1;
}
.connections-svg path:hover {
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 3px rgba(30, 58, 95, 0.3));
}
.connections-svg path.highlighted {
  stroke: var(--accent) !important;
  stroke-width: 3 !important;
  opacity: 1 !important;
  filter: drop-shadow(0 0 4px rgba(197, 48, 48, 0.4));
  animation: dash 1s linear infinite;
  stroke-dasharray: 8 4;
}
.connections-svg path.upstream {
  stroke: var(--primary-light) !important;
  stroke-width: 2.5 !important;
  opacity: 1 !important;
}

.conn-tooltip {
  position: absolute;
  background: var(--primary);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 300;
  pointer-events: none;
  box-shadow: var(--shadow-lg);
  max-width: 240px;
  line-height: 1.5;
}
.conn-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--primary);
}
.conn-tooltip .conn-type {
  font-weight: 600;
  margin-bottom: 2px;
  color: #90cdf4;
}
</style>
