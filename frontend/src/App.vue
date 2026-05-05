<template>
  <div v-if="flowStore.isReady" class="app-container">
    <AppHeader @toggle-admin="showAdmin = !showAdmin" />
    <div class="main">
      <PhaseNav />
      <div id="canvasWrapper" class="canvas-wrapper" @wheel="handleWheel" @click="handleCanvasClick">
        <div
          id="canvas"
          class="canvas"
          :style="canvasStyle"
          ref="canvasRef"
        >
          <ConnectionLayer :canvas-ref="canvasRef" />
          <div id="phasesContainer">
            <PhaseBlock
              v-for="phase in visiblePhases"
              :key="phase.id"
              :phase="phase"
              @dragstart="dragSrcId = $event"
              @dragend="dragSrcId = null"
              @drop="handleDrop"
            />
          </div>
        </div>
      </div>
      <DetailPanel />
    </div>
    <LegendBar />
    <ZoomControls />
    <AdminPanel v-model:show="showAdmin" />
    <ToastMessage />
  </div>
  <div v-else-if="loadError" class="loading">
    <div class="loading-text" style="color: var(--accent)">
      加载失败：{{ loadError }}
    </div>
    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px">
      请按 F12 查看控制台错误信息
    </div>
  </div>
  <div v-else class="loading">
    <div class="loading-text">正在初始化数据库...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useFlowStore } from '@/stores/flowStore'
import { useUiStore } from '@/stores/uiStore'
import AppHeader from './components/AppHeader.vue'
import AdminPanel from './components/admin/AdminPanel.vue'
import PhaseNav from './components/PhaseNav.vue'
import PhaseBlock from './components/PhaseBlock.vue'
import ConnectionLayer from './components/ConnectionLayer.vue'
import DetailPanel from './components/DetailPanel.vue'
import LegendBar from './components/LegendBar.vue'
import ZoomControls from './components/ZoomControls.vue'
import ToastMessage from './components/ToastMessage.vue'

const flowStore = useFlowStore()
const uiStore = useUiStore()

const canvasRef = ref<HTMLElement>()
const dragSrcId = ref<string | null>(null)
const loadError = ref('')
const showAdmin = ref(false)

const visiblePhases = computed(() => {
  return flowStore.phases.filter((p) => {
    const deptIds = flowStore.phaseDeptMap.get(p.id)
    if (!deptIds) return false
    // 至少有一个部门是激活的且有节点
    for (const deptId of deptIds) {
      if (uiStore.activeDeptIds.has(deptId)) {
        const nodes = flowStore.nodesByPhaseDept.get(`${p.id}-${deptId}`)
        if (nodes && nodes.length > 0) return true
      }
    }
    return false
  })
})

const canvasStyle = computed(() => ({
  zoom: uiStore.scale,
}))

function handleWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    uiStore.setScale(uiStore.scale * delta)
  }
}

function handleCanvasClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.task-node')) {
    uiStore.setActiveNode(null)
  }
}

async function handleDrop(phaseId: number, deptId: number, ids: string[]) {
  const srcId = dragSrcId.value || document.body.dataset.dragSrcId || null
  if (!srcId) return
  const srcNode = flowStore.nodeMap.get(srcId)
  if (!srcNode) return
  // 跨阶段或跨部门时先移动节点
  if (srcNode.phaseId !== phaseId || srcNode.deptId !== deptId) {
    await flowStore.moveNode(srcId, phaseId, deptId)
  }
  // 更新目标位置的排序
  await flowStore.updateSortOrder(phaseId, deptId, ids)
  dragSrcId.value = null
  delete document.body.dataset.dragSrcId
  uiStore.showToast('位置已调整并保存', 'success')
}

onMounted(async () => {
  try {
    await flowStore.init()
    // 初始化完成后，默认只显示「内装方案团队」
    if (uiStore.activeDeptIds.size === 0) {
      const targetDept = flowStore.departments.find((d) => d.name === '内装方案团队')
      if (targetDept) {
        uiStore.setAllDeptsActive([targetDept.id])
      }
    }
  } catch (err: any) {
    loadError.value = (err && err.message) || '数据库初始化失败'
    console.error('App init error:', err)
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  background: var(--bg);
}
.canvas {
  position: relative;
  min-width: 100%;
  min-height: 100%;
  padding: 20px;
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg);
}
.loading-text {
  font-size: 16px;
  color: var(--text-secondary);
}
@media (max-width: 768px) {
  .main {
    flex-direction: column;
  }
  .canvas-wrapper {
    min-height: 50vh;
  }
}
</style>
