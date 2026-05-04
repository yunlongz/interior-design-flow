<template>
  <Transition name="toast">
    <div v-if="toast && toast.show" class="toast" :class="toast.type">
      {{ toast.text }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'
import { storeToRefs } from 'pinia'

const uiStore = useUiStore()
const { toast } = storeToRefs(uiStore)
</script>

<style scoped>
.toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  z-index: 400;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}
.toast.success { background: #38a169; }
.toast.warn { background: #dd6b20; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
