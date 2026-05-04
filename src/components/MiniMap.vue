<template>
  <div class="minimap" ref="minimapRef" @click="handleClick">
    <div class="minimap-content" :style="contentStyle">
      <div
        v-for="block in blocks"
        :key="block.phaseId"
        :style="block.style"
      />
    </div>
    <div class="minimap-viewport" :style="viewportStyle" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useFlowStore } from '@/stores/flowStore'
import { useUiStore } from '@/stores/uiStore'

const flowStore = useFlowStore()
const uiStore = useUiStore()
const minimapRef = ref<HTMLElement>()

const scaleFactor = ref(0.1)
const blocks = ref<Array<{ phaseId: number; style: Record<string, string> }>>([])

const contentStyle = computed(() => ({
  transform: `scale(${scaleFactor.value})`,
  transformOrigin: '0 0',
}))

const viewportStyle = computed(() => {
  const wrapper = document.getElementById('canvasWrapper')
  if (!wrapper) return {}
  const container = document.getElementById('phasesContainer')
  if (!container) return {}
  const sf = scaleFactor.value
  const vw = wrapper.clientWidth * sf
  const vh = wrapper.clientHeight * sf
  const vx = wrapper.scrollLeft * sf
  const vy = wrapper.scrollTop * sf
  return {
    width: Math.min(vw, 160) + 'px',
    height: Math.min(vh, 100) + 'px',
    left: Math.max(0, Math.min(vx, 160 - vw)) + 'px',
    top: Math.max(0, Math.min(vy, 100 - vy)) + 'px',
  }
})

function updateBlocks() {
  const container = document.getElementById('phasesContainer')
  if (!container) return
  const cw = container.scrollWidth + 40
  scaleFactor.value = 160 / cw

  blocks.value = []
  document.querySelectorAll('.phase-block').forEach((block) => {
    const el = block as HTMLElement
    blocks.value.push({
      phaseId: Number(el.dataset.phaseId),
      style: {
        position: 'absolute',
        left: el.offsetLeft + 'px',
        top: el.offsetTop + 'px',
        width: el.offsetWidth + 'px',
        height: el.offsetHeight + 'px',
        background: '#e2e8f0',
        borderRadius: '2px',
        border: '1px solid #cbd5e0',
      },
    })
  })
}

function handleClick(e: MouseEvent) {
  const rect = minimapRef.value && minimapRef.value.getBoundingClientRect()
  if (!rect) return
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  const wrapper = document.getElementById('canvasWrapper')
  const container = document.getElementById('phasesContainer')
  if (!wrapper || !container) return
  wrapper.scrollLeft = x * container.scrollWidth - wrapper.clientWidth / 2
  wrapper.scrollTop = y * container.scrollHeight - wrapper.clientHeight / 2
}

onMounted(() => {
  setTimeout(updateBlocks, 600)
  window.addEventListener('resize', updateBlocks)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBlocks)
})

watch(
  () => [flowStore.nodes, uiStore.collapsedPhaseIds, uiStore.scale],
  () => {
    nextTick(updateBlocks)
  },
  { deep: true }
)
</script>

<style scoped>
.minimap {
  position: fixed;
  bottom: 20px;
  right: 60px;
  width: 160px;
  height: 100px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: var(--shadow);
  z-index: 90;
  overflow: hidden;
  cursor: pointer;
}
.minimap-content {
  position: absolute;
  top: 0;
  left: 0;
}
.minimap-viewport {
  position: absolute;
  border: 2px solid var(--accent);
  background: rgba(197, 48, 48, 0.1);
  border-radius: 2px;
  pointer-events: none;
}
@media (max-width: 768px) {
  .minimap {
    display: none;
  }
}
</style>
