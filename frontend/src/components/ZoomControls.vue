<template>
  <div class="zoom-controls">
    <button @click="zoomIn">+</button>
    <button @click="zoomOut">−</button>
    <button @click="zoomReset">⌂</button>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

function zoomIn() {
  uiStore.setScale(uiStore.scale * 1.2)
}
function zoomOut() {
  uiStore.setScale(uiStore.scale / 1.2)
}
function zoomReset() {
  uiStore.setScale(1)
}
</script>

<style scoped>
.zoom-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 90;
}
.zoom-controls button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: all 0.15s;
}
.zoom-controls button:hover { background: var(--bg); }
@media (max-width: 768px) {
  .zoom-controls {
    display: none;
  }
}
</style>
