<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }">
            {{ col.label }}
          </th>
          <th class="col-actions" style="width: 100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in data" :key="getKey(item, idx)">
          <td v-for="col in columns" :key="col.key">
            <template v-if="col.type === 'badge'">
              <span class="badge" :class="`badge-${getValue(item, col.key)}`">
                {{ col.format ? col.format(getValue(item, col.key), item) : getValue(item, col.key) }}
              </span>
            </template>
            <template v-else>
              {{ col.format ? col.format(getValue(item, col.key), item) : getValue(item, col.key) }}
            </template>
          </td>
          <td class="col-actions">
            <button class="btn-icon" @click="$emit('edit', item)">✏️</button>
            <button class="btn-icon" @click="$emit('delete', item)">🗑️</button>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + 1" class="empty-row">暂无数据</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface Column {
  key: string
  label: string
  type?: 'text' | 'badge'
  width?: string
  format?: (val: any, item: any) => string
}

defineProps({
  columns: { type: Array as PropType<Column[]>, required: true },
  data: { type: Array as PropType<any[]>, required: true },
})

defineEmits<{
  edit: [item: any]
  delete: [item: any]
}>()

function getValue(item: any, key: string): any {
  return item[key]
}

function getKey(item: any, idx: number): string {
  return (item.id && item.id.toString && item.id.toString()) || item.id || idx.toString()
}
</script>

<style scoped>
.data-table {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  text-align: left;
  padding: 10px 12px;
  background: #f7fafc;
  border-bottom: 2px solid var(--border);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
tr:hover td {
  background: #f7fafc;
}
.col-actions {
  text-align: center;
  white-space: nowrap;
}
.btn-icon {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  margin: 0 2px;
}
.btn-icon:hover {
  background: var(--bg);
}
.empty-row {
  text-align: center;
  color: var(--text-secondary);
  padding: 30px;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.badge-task { background: #ebf4ff; color: var(--primary); }
.badge-review { background: #fffaf0; color: var(--review); }
.badge-deliverable { background: #ebf8ff; color: var(--deliverable); }
.badge-decision { background: #faf5ff; color: var(--decision); }
.badge-milestone { background: #f0fff4; color: var(--milestone); }
</style>
