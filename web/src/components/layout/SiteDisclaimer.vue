<template>
  <footer class="site-disclaimer" :class="{ fixed: fixed }">
    <p>本站内容源自中国传统文化，仅供娱乐，不构成任何决策建议，请理性看待，切勿迷信</p>
  </footer>
</template>

<script setup>
defineProps({
  fixed: { type: Boolean, default: true }
})
</script>

<style scoped>
.site-disclaimer {
  z-index: 800;
  pointer-events: none;
  text-align: center;
  padding: 10px 16px 14px;
}

.site-disclaimer.fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

.site-disclaimer p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.5;
}
</style>
