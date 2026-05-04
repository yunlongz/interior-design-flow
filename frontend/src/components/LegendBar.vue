<template>
  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background:var(--primary)"></div>任务
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background:var(--review)"></div>评审/汇报
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background:var(--deliverable)"></div>交付物
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background:var(--decision)"></div>决策
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background:var(--milestone)"></div>里程碑
    </div>
  </div>
</template>

<style scoped>
.legend {
  position: fixed;
  bottom: 20px;
  left: 200px;
  background: white;
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  padding: 10px 14px;
  display: flex;
  gap: 14px;
  z-index: 90;
  font-size: 11px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
@media (max-width: 768px) {
  .legend {
    left: 10px;
    bottom: 70px;
    flex-wrap: wrap;
    max-width: 280px;
  }
}
</style>
