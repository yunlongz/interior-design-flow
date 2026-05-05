<template>
  <Transition name="slide">
    <div v-if="activeNode" class="detail-panel">
      <div class="detail-panel-header">
        <h3>节点详情</h3>
        <button class="close-btn" @click="uiStore.setActiveNode(null)">×</button>
      </div>
      <div class="detail-panel-body">
        <!-- 节点名称 -->
        <div class="detail-row">
          <label>节点名称 <span class="edit-badge">可编辑</span></label>
          <input
            :value="activeNode.title"
            @blur="saveTitle($event)"
            @keyup.enter="($event.target as HTMLInputElement).blur()"
            style="font-size: 15px; font-weight: 600"
          />
        </div>

        <!-- 重要节点标记 -->
        <div class="detail-row">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input
              type="checkbox"
              :checked="activeNode.isHighlighted"
              @change="saveHighlighted($event)"
            />
            <span>重要节点标记</span>
          </label>
        </div>

        <!-- 节点类型 -->
        <div class="detail-row">
          <label>节点类型</label>
          <div class="value">
            <span class="badge" :class="typeBadge.class">{{ typeBadge.label }}</span>
          </div>
        </div>

        <!-- 所属阶段 -->
        <div class="detail-row">
          <label>所属阶段 <span class="edit-badge">可编辑</span></label>
          <select :value="activeNode.phaseId" @change="updatePhase($event)">
            <option v-for="p in flowStore.phases" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <div class="edit-hint">修改后自动保存</div>
        </div>

        <!-- 责任部门 -->
        <div class="detail-row">
          <label>责任部门 <span class="edit-badge">可编辑</span></label>
          <select :value="activeNode.deptId" @change="updateDept($event)">
            <option v-for="d in flowStore.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
          <div class="edit-hint">修改后自动保存</div>
        </div>

        <!-- 节点详情 -->
        <div class="detail-row">
          <label>节点详情 <span class="edit-badge">可编辑</span></label>
          <textarea
            v-model="detailText"
            @blur="saveDetail"
            placeholder="输入节点详细描述..."
          />
          <div class="edit-hint">
            {{ detailSaved ? '✓ 已保存' : '编辑后自动保存' }}
          </div>
        </div>

        <!-- 上游依赖 -->
        <div class="detail-row">
          <label class="section-label">
            上游依赖 ({{ upstream.length }})
            <button class="add-btn" @click="openSelector('upstream')">+ 添加</button>
          </label>
          <div class="value">
            <template v-if="upstream.length">
              <div
                v-for="c in upstream"
                :key="c.id"
                class="conn-item conn-upstream"
              >
                <div class="conn-header">
                  <b>{{ c.type }}</b> ← <b>{{ c.fromTitle }}</b>
                  <button class="del-btn" @click="removeConn(c.id)">×</button>
                </div>
                <div class="conn-meta">{{ c.fromDept }}</div>
                <div class="conn-desc">{{ c.description }}</div>
              </div>
            </template>
            <span v-else class="empty-text">无上游依赖（流程起点）</span>
          </div>
        </div>

        <!-- 下游输出 -->
        <div class="detail-row">
          <label class="section-label">
            下游输出 ({{ downstream.length }})
            <button class="add-btn" @click="openSelector('downstream')">+ 添加</button>
          </label>
          <div class="value">
            <template v-if="downstream.length">
              <div
                v-for="c in downstream"
                :key="c.id"
                class="conn-item conn-downstream"
              >
                <div class="conn-header">
                  <b>{{ c.type }}</b> → <b>{{ c.toTitle }}</b>
                  <button class="del-btn" @click="removeConn(c.id)">×</button>
                </div>
                <div class="conn-meta">{{ c.toDept }}</div>
                <div class="conn-desc">{{ c.description }}</div>
              </div>
            </template>
            <span v-else class="empty-text">无下游输出（流程终点）</span>
          </div>
        </div>
      </div>

      <!-- 节点选择器弹窗 -->
      <div v-if="selectorOpen" class="selector-overlay" @click="selectorOpen = false">
        <div class="selector-modal" @click.stop>
          <div class="selector-header">
            <h4>{{ selectorMode === 'upstream' ? '选择上游节点' : '选择下游节点' }}</h4>
            <button class="close-btn" @click="selectorOpen = false">×</button>
          </div>
          <div class="selector-search">
            <input v-model="selectorSearch" placeholder="搜索节点名称、阶段、部门..." />
          </div>
          <div class="selector-list">
            <div
              v-for="node in filteredNodes"
              :key="node.id"
              :class="['selector-item', { disabled: isNodeDisabled(node.id) }]"
              @click="selectNode(node)"
            >
              <div class="selector-item-title">{{ node.title }}</div>
              <div class="selector-item-meta">
                <span class="badge" :class="`badge-${node.type}`">{{ typeLabel(node.type) }}</span>
                {{ node.phaseName }} / {{ node.deptName }}
              </div>
            </div>
            <div v-if="filteredNodes.length === 0" class="selector-empty">无匹配节点</div>
          </div>
        </div>
      </div>

      <!-- 连接信息编辑弹窗 -->
      <div v-if="connFormOpen" class="selector-overlay" @click="connFormOpen = false">
        <div class="selector-modal" @click.stop>
          <div class="selector-header">
            <h4>添加{{ connFormMode === 'upstream' ? '上游' : '下游' }}连接</h4>
            <button class="close-btn" @click="connFormOpen = false">×</button>
          </div>
          <div class="conn-form-body">
            <div class="form-row">
              <label>目标节点</label>
              <div class="value" style="font-weight: 600">{{ selectedNode && selectedNode.title }}</div>
              <div class="edit-hint">{{ selectedNode && selectedNode.phaseName }} / {{ selectedNode && selectedNode.deptName }}</div>
            </div>
            <div class="form-row">
              <label>关系类型</label>
              <input v-model="connFormType" placeholder="如：提资、流程、交底..." />
            </div>
            <div class="form-row">
              <label>关系描述</label>
              <textarea v-model="connFormDesc" rows="3" placeholder="描述节点间的依赖关系..." />
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="confirmAddConn">确认添加</button>
              <button @click="connFormOpen = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useFlowStore } from '@/stores/flowStore'
import type { ConnectionFull, FlowNodeFull } from '@/types'
import client from '@/api/client.js'

const uiStore = useUiStore()
const flowStore = useFlowStore()

const activeNode = computed(() => {
  if (!uiStore.activeNodeId) return null
  return flowStore.nodeMap.get(uiStore.activeNodeId) || null
})

const typeBadge = computed(() => {
  const map: Record<string, { label: string; class: string }> = {
    task: { label: '任务节点', class: 'badge-task' },
    review: { label: '评审/汇报', class: 'badge-review' },
    deliverable: { label: '交付物', class: 'badge-deliverable' },
    decision: { label: '决策节点', class: 'badge-decision' },
    milestone: { label: '里程碑', class: 'badge-milestone' },
  }
  return map[(activeNode.value && activeNode.value.type) || 'task'] || map.task
})

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    task: '任务', review: '评审', deliverable: '交付物', decision: '决策', milestone: '里程碑'
  }
  return map[type] || type
}

const upstream = ref<ConnectionFull[]>([])
const downstream = ref<ConnectionFull[]>([])

async function loadConnections() {
  if (!uiStore.activeNodeId) {
    upstream.value = []
    downstream.value = []
    return
  }
  try {
    const { data } = await client.get(`/connections/node/${uiStore.activeNodeId}`)
    upstream.value = data.upstream
    downstream.value = data.downstream
  } catch {
    upstream.value = []
    downstream.value = []
  }
}

watch(() => uiStore.activeNodeId, loadConnections, { immediate: true })

// 详情编辑
const detailText = ref('')
const detailSaved = ref(false)

watch(() => activeNode.value && activeNode.value.id, (newId) => {
  if (newId && activeNode.value) {
    detailText.value = activeNode.value.detail
    detailSaved.value = false
  }
}, { immediate: true })

function saveDetail() {
  if (!activeNode.value) return
  if (detailText.value !== activeNode.value.detail) {
    flowStore.updateNodeDetail(activeNode.value.id, detailText.value)
    detailSaved.value = true
  }
}

function saveTitle(e: Event) {
  if (!activeNode.value) return
  const newTitle = (e.target as HTMLInputElement).value.trim()
  if (newTitle && newTitle !== activeNode.value.title) {
    flowStore.updateNodeAdmin(activeNode.value.id, { title: newTitle })
    uiStore.showToast('节点名称已更新', 'success')
  }
}

function updatePhase(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value)
  if (activeNode.value && val !== activeNode.value.phaseId) {
    flowStore.updateNodePhase(activeNode.value.id, val)
    uiStore.showToast('阶段已更新并保存', 'success')
  }
}

function updateDept(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value)
  if (activeNode.value && val !== activeNode.value.deptId) {
    flowStore.updateNodeDept(activeNode.value.id, val)
    uiStore.showToast('部门已更新并保存', 'success')
  }
}

function saveHighlighted(e: Event) {
  if (!activeNode.value) return
  const val = (e.target as HTMLInputElement).checked
  if (val !== activeNode.value.isHighlighted) {
    flowStore.updateNodeAdmin(activeNode.value.id, { isHighlighted: val })
    uiStore.showToast(val ? '已标记为重要节点' : '已取消重要节点标记', 'success')
  }
}

// 连接管理
function removeConn(id: number) {
  if (!confirm('确定删除这条连接关系吗？')) return
  flowStore.removeConnection(id)
  uiStore.showToast('连接已删除', 'success')
}

// 节点选择器
const selectorOpen = ref(false)
const selectorMode = ref<'upstream' | 'downstream'>('upstream')
const selectorSearch = ref('')

const filteredNodes = computed(() => {
  const keyword = selectorSearch.value.trim().toLowerCase()
  return flowStore.nodes.filter((n: FlowNodeFull) => {
    if (activeNode.value && n.id === activeNode.value.id) return false
    if (!keyword) return true
    const text = `${n.title} ${n.phaseName} ${n.deptName}`.toLowerCase()
    return text.includes(keyword)
  })
})

function isNodeDisabled(nodeId: string): boolean {
  if (!activeNode.value) return false
  // 上游模式：已在上游列表中的节点不可选
  if (selectorMode.value === 'upstream') {
    return upstream.value.some((c) => c.fromNode === nodeId)
  }
  // 下游模式：已在下游列表中的节点不可选
  return downstream.value.some((c) => c.toNode === nodeId)
}

function openSelector(mode: 'upstream' | 'downstream') {
  selectorMode.value = mode
  selectorSearch.value = ''
  selectorOpen.value = true
}

// 连接表单
const connFormOpen = ref(false)
const connFormMode = ref<'upstream' | 'downstream'>('upstream')
const selectedNode = ref<FlowNodeFull | null>(null)
const connFormType = ref('')
const connFormDesc = ref('')

function selectNode(node: FlowNodeFull) {
  if (isNodeDisabled(node.id)) return
  selectedNode.value = node
  connFormMode.value = selectorMode.value
  connFormType.value = ''
  connFormDesc.value = ''
  selectorOpen.value = false
  connFormOpen.value = true
}

function confirmAddConn() {
  if (!activeNode.value || !selectedNode.value) return
  const type = connFormType.value.trim() || '流程'
  const desc = connFormDesc.value.trim()

  if (connFormMode.value === 'upstream') {
    flowStore.addConnection(selectedNode.value.id, activeNode.value.id, type, desc)
  } else {
    flowStore.addConnection(activeNode.value.id, selectedNode.value.id, type, desc)
  }

  connFormOpen.value = false
  selectedNode.value = null
  uiStore.showToast('连接已添加', 'success')
}
</script>

<style scoped>
.detail-panel {
  width: 380px;
  background: white;
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
  z-index: 80;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.detail-panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detail-panel-header h3 {
  font-size: 15px;
  font-weight: 600;
}
.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: var(--bg);
  cursor: pointer;
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background: #e2e8f0;
  color: var(--text);
}
.detail-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.detail-row {
  margin-bottom: 16px;
}
.detail-row label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
}
.detail-row .value {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
}
.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  height: 24px;
  padding: 0 10px;
  border: 1px solid var(--primary-light);
  background: #ebf4ff;
  color: var(--primary);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: var(--primary);
  color: white;
}
.del-btn {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}
.del-btn:hover {
  background: #fee;
  color: var(--accent);
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
}
.badge-task { background: #ebf4ff; color: var(--primary); }
.badge-review { background: #fffaf0; color: var(--review); }
.badge-deliverable { background: #ebf8ff; color: var(--deliverable); }
.badge-decision { background: #faf5ff; color: var(--decision); }
.badge-milestone { background: #f0fff4; color: var(--milestone); }

select {
  width: 100%;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--text);
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
select:hover { border-color: #90cdf4; }
select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(66,153,225,0.15); }

textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  color: var(--text);
  background: white;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;
  line-height: 1.5;
}
textarea:hover { border-color: #90cdf4; }
textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(66,153,225,0.15); }

input {
  width: 100%;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--text);
  background: white;
  outline: none;
  transition: border-color 0.2s;
}
input:hover { border-color: #90cdf4; }
input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(66,153,225,0.15); }

.edit-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 6px;
  background: #c6f6d5;
  color: #22543d;
}
.edit-hint {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.conn-item {
  font-size: 11px;
  margin-top: 4px;
  padding: 6px 10px;
  border-radius: 4px;
}
.conn-upstream {
  background: #f7fafc;
  border-left: 2px solid var(--primary-light);
}
.conn-downstream {
  background: #fff5f5;
  border-left: 2px solid var(--accent);
}
.conn-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.conn-meta {
  opacity: 0.6;
  font-size: 10px;
  margin-bottom: 2px;
}
.conn-desc {
  opacity: 0.7;
  font-size: 10px;
}
.empty-text {
  color: var(--text-secondary);
  font-size: 12px;
}

/* 节点选择器 */
.selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.selector-modal {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.selector-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.selector-header h4 {
  font-size: 14px;
  font-weight: 600;
}
.selector-search {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}
.selector-search input {
  width: 100%;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  outline: none;
}
.selector-search input:focus {
  border-color: var(--primary);
}
.selector-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.selector-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f7fafc;
}
.selector-item:hover {
  background: #edf2f7;
}
.selector-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: transparent !important;
}
.selector-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.selector-item-meta {
  font-size: 11px;
  color: var(--text-secondary);
}
.selector-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

/* 连接表单 */
.conn-form-body {
  padding: 16px;
}
.form-row {
  margin-bottom: 14px;
}
.form-row label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.form-actions button {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  cursor: pointer;
}
.form-actions .btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.form-actions .btn-primary:hover {
  background: var(--primary-light);
}

@media (max-width: 768px) {
  .detail-panel {
    width: 100%;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
  }
}
</style>
