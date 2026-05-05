<template>
  <div v-if="show" class="admin-overlay" @click="show = false">
    <div class="admin-panel" @click.stop>
      <div class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h3>管理控制台</h3>
          <button class="close-btn" @click="show = false">×</button>
        </div>
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['admin-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="admin-content">
        <!-- 阶段管理 -->
        <div v-if="activeTab === 'phases'" class="admin-section">
          <div class="section-header">
            <h4>阶段管理</h4>
            <button class="btn-add" @click="openForm('phase')">+ 新增阶段</button>
          </div>
          <DataTable
            :columns="phaseColumns"
            :data="flowStore.phases"
            @edit="openForm('phase', $event)"
            @delete="deletePhase($event)"
          />
        </div>

        <!-- 部门管理 -->
        <div v-if="activeTab === 'departments'" class="admin-section">
          <div class="section-header">
            <h4>部门管理</h4>
            <button class="btn-add" @click="openForm('dept')">+ 新增部门</button>
          </div>
          <DataTable
            :columns="deptColumns"
            :data="flowStore.departments"
            @edit="openForm('dept', $event)"
            @delete="deleteDept($event)"
          />
        </div>

        <!-- 节点管理 -->
        <div v-if="activeTab === 'nodes'" class="admin-section">
          <div class="section-header">
            <h4>节点管理</h4>
            <button class="btn-add" @click="openForm('node')">+ 新增节点</button>
          </div>
          <DataTable
            :columns="nodeColumns"
            :data="flowStore.nodes"
            @edit="openForm('node', $event)"
            @delete="deleteNode($event)"
          />
        </div>

        <!-- 连接管理 -->
        <div v-if="activeTab === 'connections'" class="admin-section">
          <div class="section-header">
            <h4>连接管理</h4>
            <button class="btn-add" @click="openForm('conn')">+ 新增连接</button>
          </div>
          <DataTable
            :columns="connColumns"
            :data="connTableData"
            @edit="openForm('conn', $event)"
            @delete="deleteConn($event)"
          />
        </div>

        <!-- 系统工具 -->
        <div v-if="activeTab === 'tools'" class="admin-section">
          <div class="section-header">
            <h4>系统工具</h4>
          </div>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">📤</div>
              <div class="tool-title">导出数据</div>
              <div class="tool-desc">将所有节点、阶段、部门、连接数据导出为 JSON 文件</div>
              <button class="btn-tool" @click="exportData">立即导出</button>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📥</div>
              <div class="tool-title">导入数据</div>
              <div class="tool-desc">从 JSON 文件恢复数据（会覆盖现有数据）</div>
              <button class="btn-tool" @click="triggerImport">选择文件</button>
              <input
                ref="importInput"
                type="file"
                accept=".json,.db"
                style="display: none"
                @change="handleImport"
              />
            </div>
            <div class="tool-card">
              <div class="tool-icon">🔍</div>
              <div class="tool-title">重置视图</div>
              <div class="tool-desc">取消节点选中状态、清除搜索、回到画布顶部</div>
              <button class="btn-tool" @click="resetView">重置视图</button>
            </div>
            <div class="tool-card">
              <div class="tool-icon">↩️</div>
              <div class="tool-title">恢复默认</div>
              <div class="tool-desc">恢复到系统默认的初始数据（所有自定义调整将丢失）</div>
              <button class="btn-tool btn-danger" @click="restoreDefault">恢复默认</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通用表单弹窗 -->
    <DataForm
      v-if="formOpen"
      :title="formTitle"
      :fields="formFields"
      :initial-data="formData"
      @submit="handleFormSubmit"
      @close="formOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFlowStore } from '@/stores/flowStore'
import { useUiStore } from '@/stores/uiStore'
import DataTable from './DataTable.vue'
import DataForm from './DataForm.vue'
import client from '@/api/client.js'

const importInput = ref<HTMLInputElement>()

const flowStore = useFlowStore()
const uiStore = useUiStore()

const show = defineModel<boolean>('show', { default: false })
const activeTab = ref('phases')

const tabs = [
  { key: 'phases', label: '阶段管理' },
  { key: 'departments', label: '部门管理' },
  { key: 'nodes', label: '节点管理' },
  { key: 'connections', label: '连接管理' },
  { key: 'tools', label: '系统工具' },
]

// 阶段表格
const phaseColumns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: '阶段名称' },
  { key: 'sortOrder', label: '排序', width: '80px' },
]

// 部门表格
const deptColumns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: '部门名称' },
  { key: 'sortOrder', label: '排序', width: '80px' },
]

// 节点表格
const nodeColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'title', label: '节点标题' },
  { key: 'type', label: '类型', type: 'badge' as const, width: '80px' },
  { key: 'phaseName', label: '阶段', width: '140px' },
  { key: 'deptName', label: '部门', width: '120px' },
]

// 连接表格数据（聚合节点名称）
const connTableData = computed(() => {
  return flowStore.connections.map((c) => {
    const fromNode = flowStore.nodeMap.get(c.fromNode)
    const toNode = flowStore.nodeMap.get(c.toNode)
    return {
      id: c.id,
      fromId: c.fromNode,
      fromTitle: fromNode ? `${c.fromNode} ${fromNode.title}` : c.fromNode,
      toId: c.toNode,
      toTitle: toNode ? `${c.toNode} ${toNode.title}` : c.toNode,
      type: c.type,
      description: c.description,
    }
  })
})

const connColumns = [
  { key: 'fromTitle', label: '上游节点' },
  { key: 'toTitle', label: '下游节点' },
  { key: 'type', label: '关系', width: '80px' },
  { key: 'description', label: '描述', width: '200px' },
]

// 表单状态
const formOpen = ref(false)
const formMode = ref<'phase' | 'dept' | 'node' | 'conn'>('phase')
const formTitle = ref('')
const formFields = ref<any[]>([])
const formData = ref<Record<string, any>>({})
const editingId = ref<any>(null)

function openForm(mode: 'phase' | 'dept' | 'node' | 'conn', item?: any) {
  formMode.value = mode
  editingId.value = (item && item.id) || null

  if (mode === 'phase') {
    formTitle.value = item ? '编辑阶段' : '新增阶段'
    formFields.value = [
      { key: 'name', label: '阶段名称', type: 'text', required: true },
      { key: 'sortOrder', label: '排序', type: 'number', required: true },
    ]
    formData.value = item ? { name: item.name, sortOrder: item.sortOrder } : { name: '', sortOrder: flowStore.phases.length + 1 }
  } else if (mode === 'dept') {
    formTitle.value = item ? '编辑部门' : '新增部门'
    formFields.value = [
      { key: 'name', label: '部门名称', type: 'text', required: true },
      { key: 'sortOrder', label: '排序', type: 'number', required: true },
    ]
    formData.value = item ? { name: item.name, sortOrder: item.sortOrder } : { name: '', sortOrder: flowStore.departments.length + 1 }
  } else if (mode === 'node') {
    formTitle.value = item ? '编辑节点' : '新增节点'
    formFields.value = [
      { key: 'title', label: '节点标题', type: 'text', required: true },
      { key: 'type', label: '节点类型', type: 'select', required: true, options: [
        { value: 'task', label: '任务' },
        { value: 'review', label: '评审/汇报' },
        { value: 'deliverable', label: '交付物' },
        { value: 'decision', label: '决策' },
        { value: 'milestone', label: '里程碑' },
      ]},
      { key: 'phaseId', label: '所属阶段', type: 'select', required: true, options: flowStore.phases.map((p: any) => ({ value: p.id, label: p.name })) },
      { key: 'deptId', label: '责任部门', type: 'select', required: true, options: flowStore.departments.map((d: any) => ({ value: d.id, label: d.name })) },
      { key: 'detail', label: '详细描述', type: 'textarea', rows: 4 },
    ]
    formData.value = item
      ? { title: item.title, type: item.type, phaseId: item.phaseId, deptId: item.deptId, detail: item.detail || '' }
      : { title: '', type: 'task', phaseId: (flowStore.phases[0] && flowStore.phases[0].id) || 0, deptId: (flowStore.departments[0] && flowStore.departments[0].id) || 0, detail: '' }
  } else if (mode === 'conn') {
    formTitle.value = item ? '编辑连接' : '新增连接'
    const nodeOptions = flowStore.nodes.map((n: any) => ({ value: n.id, label: `${n.id} ${n.title}` }))
    formFields.value = [
      { key: 'fromNode', label: '上游节点', type: 'select', required: true, options: nodeOptions },
      { key: 'toNode', label: '下游节点', type: 'select', required: true, options: nodeOptions },
      { key: 'type', label: '关系类型', type: 'text', required: true, placeholder: '如：提资、流程、交底' },
      { key: 'description', label: '描述', type: 'textarea', rows: 3 },
    ]
    formData.value = item
      ? { fromNode: item.fromId, toNode: item.toId, type: item.type, description: item.description || '' }
      : { fromNode: '', toNode: '', type: '流程', description: '' }
  }

  formOpen.value = true
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    if (formMode.value === 'phase') {
      if (editingId.value) {
        await flowStore.updatePhaseAdmin(editingId.value, data.name, data.sortOrder)
      } else {
        await flowStore.createPhase(data.name, data.sortOrder)
      }
    } else if (formMode.value === 'dept') {
      if (editingId.value) {
        await flowStore.updateDeptAdmin(editingId.value, data.name, data.sortOrder)
      } else {
        await flowStore.createDept(data.name, data.sortOrder)
      }
    } else if (formMode.value === 'node') {
      if (editingId.value) {
        await flowStore.updateNodeAdmin(editingId.value, {
          title: data.title,
          type: data.type,
          phaseId: data.phaseId,
          deptId: data.deptId,
          detail: data.detail,
        })
      } else {
        await flowStore.createNode(data.title, data.type, data.detail, data.phaseId, data.deptId)
      }
    } else if (formMode.value === 'conn') {
      if (editingId.value) {
        await flowStore.updateConnection(editingId.value, data.type, data.description)
      } else {
        await flowStore.addConnection(data.fromNode, data.toNode, data.type, data.description)
      }
    }
    formOpen.value = false
    uiStore.showToast('保存成功', 'success')
  } catch (e: any) {
    uiStore.showToast('保存失败: ' + (e.message || ''), 'warn')
  }
}

async function deletePhase(item: any) {
  try {
    const { data } = await client.get(`/phases/${item.id}/node-count`)
    if (data.count > 0) {
      uiStore.showToast(`该阶段下还有 ${data.count} 个节点，无法删除`, 'warn')
      return
    }
  } catch { /* ignore */ }
  if (!confirm(`确定删除阶段「${item.name}」吗？`)) return
  await flowStore.deletePhase(item.id)
  uiStore.showToast('阶段已删除', 'success')
}

async function deleteDept(item: any) {
  try {
    const { data } = await client.get(`/departments/${item.id}/node-count`)
    if (data.count > 0) {
      uiStore.showToast(`该部门下还有 ${data.count} 个节点，无法删除`, 'warn')
      return
    }
  } catch { /* ignore */ }
  if (!confirm(`确定删除部门「${item.name}」吗？`)) return
  await flowStore.deleteDept(item.id)
  uiStore.showToast('部门已删除', 'success')
}

async function deleteNode(item: any) {
  if (!confirm(`确定删除节点「${item.title}」吗？\n相关连接关系也会被一并删除。`)) return
  await flowStore.deleteNode(item.id)
  uiStore.showToast('节点已删除', 'success')
}

async function deleteConn(item: any) {
  if (!confirm('确定删除这条连接关系吗？')) return
  await flowStore.removeConnection(item.id)
  uiStore.showToast('连接已删除', 'success')
}

// 系统工具
async function exportData() {
  try {
    const { data } = await client.get('/db/export')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interior-design-flow-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    uiStore.showToast('数据已导出', 'success')
  } catch (e) {
    uiStore.showToast('导出失败', 'warn')
  }
}

function triggerImport() {
  importInput.value && importInput.value.click()
}

async function handleImport(e: Event) {
  const files = (e.target as HTMLInputElement).files
  const file = files && files[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await client.post('/db/import', data)
    await flowStore.reloadAll()
    uiStore.showToast('数据已导入', 'success')
  } catch (err) {
    uiStore.showToast('导入失败，文件格式错误', 'warn')
  }
  if (importInput.value) importInput.value.value = ''
}

function resetView() {
  uiStore.resetView()
  document.querySelectorAll('.task-node').forEach((node) => {
    node.classList.remove('active', 'related', 'dimmed')
  })
  const wrapper = document.getElementById('canvasWrapper')
  wrapper && wrapper.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  uiStore.showToast('视图已重置', 'success')
}

function restoreDefault() {
  if (confirm('确定要恢复默认配置吗？所有自定义调整将丢失。')) {
    flowStore.resetToDefault()
    uiStore.resetView()
    uiStore.showToast('已恢复默认配置', 'success')
  }
}
</script>

<style scoped>
.admin-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.admin-panel {
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  width: 1100px;
  max-width: 95vw;
  height: 85vh;
  display: flex;
  overflow: hidden;
}
.admin-sidebar {
  width: 180px;
  background: #f8fafc;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.admin-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
}
.admin-tab {
  padding: 12px 16px;
  font-size: 13px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.admin-tab:hover {
  background: #edf2f7;
}
.admin-tab.active {
  background: #ebf4ff;
  border-left-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}
.admin-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}
.admin-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h4 {
  font-size: 16px;
  font-weight: 600;
}
.btn-add {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--primary-light);
  background: #ebf4ff;
  color: var(--primary);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-add:hover {
  background: var(--primary);
  color: white;
}
.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background: #e2e8f0;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.tool-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.15s;
}
.tool-card:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow);
}
.tool-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
}
.btn-tool {
  height: 32px;
  padding: 0 20px;
  border: 1px solid var(--primary-light);
  background: #ebf4ff;
  color: var(--primary);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-tool:hover {
  background: var(--primary);
  color: white;
}
.btn-tool.btn-danger {
  background: #fff5f5;
  border-color: #fc8181;
  color: #c53030;
}
.btn-tool.btn-danger:hover {
  background: #c53030;
  color: white;
  border-color: #c53030;
}
@media (max-width: 768px) {
  .admin-panel {
    width: 100%;
    height: 100%;
    border-radius: 0;
    flex-direction: column;
  }
  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .admin-sidebar-header {
    display: none;
  }
  .admin-tab {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  .admin-tab.active {
    border-left-color: transparent;
    border-bottom-color: var(--primary);
  }
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
