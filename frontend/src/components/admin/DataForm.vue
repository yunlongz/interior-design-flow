<template>
  <div class="form-overlay" @click="$emit('close')">
    <div class="form-modal" @click.stop>
      <div class="form-header">
        <h4>{{ title }}</h4>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="form-body">
        <div v-for="field in fields" :key="field.key" class="form-row">
          <label>
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
          </label>
          <select
            v-if="field.type === 'select'"
            v-model="formData[field.key]"
            :disabled="field.disabled"
          >
            <option v-if="field.placeholder" value="" disabled>{{ field.placeholder }}</option>
            <option
              v-for="opt in field.options || []"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            :rows="field.rows || 3"
            :placeholder="field.placeholder || ''"
            :disabled="field.disabled"
          />
          <input
            v-else-if="field.type === 'number'"
            v-model.number="formData[field.key]"
            type="number"
            :placeholder="field.placeholder || ''"
            :disabled="field.disabled"
          />
          <input
            v-else
            v-model="formData[field.key]"
            type="text"
            :placeholder="field.placeholder || ''"
            :disabled="field.disabled"
          />
          <div v-if="errors[field.key]" class="error-msg">{{ errors[field.key] }}</div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="submit">确认保存</button>
        <button @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'

interface FormField {
  key: string
  label: string
  type?: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: { value: any; label: string }[]
  rows?: number
  disabled?: boolean
}

const props = defineProps({
  title: { type: String, required: true },
  fields: { type: Array as PropType<FormField[]>, required: true },
  initialData: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  close: []
}>()

const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string>>({})

watch(() => props.initialData, (val) => {
  formData.value = { ...val }
  errors.value = {}
}, { immediate: true })

function submit() {
  errors.value = {}
  for (const field of props.fields) {
    if (field.required && !formData.value[field.key]) {
      errors.value[field.key] = `${field.label}不能为空`
    }
  }
  if (Object.keys(errors.value).length > 0) return
  emit('submit', { ...formData.value })
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-modal {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  width: 460px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.form-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.form-header h4 {
  font-size: 14px;
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
}
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.form-row {
  margin-bottom: 14px;
}
.form-row label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: block;
}
.required {
  color: var(--accent);
}
input, select, textarea {
  width: 100%;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--text);
  background: white;
  outline: none;
  font-family: inherit;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(66,153,225,0.15);
}
textarea {
  height: auto;
  padding: 8px 10px;
  resize: vertical;
}
.error-msg {
  font-size: 11px;
  color: var(--accent);
  margin-top: 4px;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}
.form-actions button {
  height: 34px;
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
</style>
