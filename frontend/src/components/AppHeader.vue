<template>
  <div class="header">
    <h1>内装设计全流程交互图 <span class="version-badge">{{ appVersion }}</span></h1>
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        :value="uiStore.searchKeyword"
        @input="onSearch"
        placeholder="搜索任务、部门、节点..."
      />
    </div>
    <div class="controls">
      <div class="dept-filter" ref="deptFilterRef">
        <button @click="showDeptDropdown = !showDeptDropdown">部门筛选 ▼</button>
        <div v-if="showDeptDropdown" class="dept-dropdown">
          <label v-for="dept in flowStore.departments" :key="dept.id">
            <input
              type="checkbox"
              :checked="uiStore.activeDeptIds.has(dept.id)"
              @change="uiStore.toggleDeptActive(dept.id)"
            />
            {{ dept.name }}
          </label>
          <div class="dropdown-actions">
            <button @click="selectAllDepts(true)">全选</button>
            <button @click="selectAllDepts(false)">清空</button>
          </div>
        </div>
      </div>
      <button @click="$emit('toggleAdmin')">管理控制台</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'

const uiStore = useUiStore()
const flowStore = useFlowStore()

const showDeptDropdown = ref(false)
const deptFilterRef = ref<HTMLElement>()

let searchDebounce: ReturnType<typeof setTimeout> | null = null

function onSearch(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    uiStore.searchKeyword = val
    doSearch(val)
  }, 300)
}

function doSearch(keyword: string) {
  uiStore.setActiveNode(null)
  if (!keyword.trim()) {
    document.querySelectorAll('.task-node').forEach((node) => {
      node.classList.remove('active', 'related', 'dimmed')
    })
    return
  }
  const lower = keyword.toLowerCase()
  const matched: HTMLElement[] = []
  document.querySelectorAll('.task-node').forEach((node) => {
    const el = node as HTMLElement
    const text = (el.textContent && el.textContent.toLowerCase()) || ''
    const dept = (el.dataset.dept && el.dataset.dept.toLowerCase()) || ''
    const phaseBlock = el.closest('.phase-block')
    const phaseHeader = phaseBlock && phaseBlock.querySelector('.phase-header h2')
    const phase = (phaseHeader && phaseHeader.textContent && phaseHeader.textContent.toLowerCase()) || ''
    if (text.includes(lower) || dept.includes(lower) || phase.includes(lower)) {
      el.classList.add('active')
      matched.push(el)
    } else {
      el.classList.remove('active')
      el.classList.add('dimmed')
    }
  })
  if (matched.length > 0) {
    matched[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
}

function selectAllDepts(checked: boolean) {
  if (checked) {
    uiStore.setAllDeptsActive(flowStore.departments.map((d) => d.id))
  } else {
    uiStore.activeDeptIds.clear()
  }
}

const appVersion = __APP_VERSION__

function onDocClick(e: MouseEvent) {
  if (deptFilterRef.value && !deptFilterRef.value.contains(e.target as Node)) {
    showDeptDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.header {
  height: 56px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  flex-shrink: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}
.version-badge {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0;
}
.search-box {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.search-box input {
  width: 100%;
  height: 34px;
  border-radius: 4px;
  border: none;
  padding: 0 12px 0 32px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  outline: none;
  transition: background 0.2s;
}
.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.search-box input:focus {
  background: rgba(255, 255, 255, 0.25);
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.7;
}
.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.header button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.header button:hover {
  background: rgba(255, 255, 255, 0.2);
}
.header button.danger {
  background: rgba(197, 48, 48, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}
.header button.danger:hover {
  background: rgba(197, 48, 48, 0.35);
}

.dept-filter {
  position: relative;
}
.dept-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 220px;
  background: white;
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
}
.dept-dropdown label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;
}
.dept-dropdown label:hover {
  background: var(--bg);
}
.dropdown-actions {
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
.dropdown-actions button {
  flex: 1;
  height: 28px;
  font-size: 11px;
  color: var(--text);
  border: 1px solid var(--border);
  background: white;
}
.dropdown-actions button:hover {
  background: var(--bg);
}
@media (max-width: 768px) {
  .header {
    height: 48px;
    padding: 0 12px;
    gap: 8px;
  }
  .header h1 {
    font-size: 14px;
  }
  .search-box {
    max-width: 140px;
  }
  .search-box input {
    height: 30px;
    font-size: 12px;
    padding: 0 8px 0 28px;
  }
  .controls button {
    padding: 0 8px;
    height: 28px;
    font-size: 11px;
  }
}
</style>
