<template>
  <div class="pagination-dots" role="tablist" aria-label="词卡切换">
    <button
      v-for="(item, index) in items"
      :key="item.key ?? index"
      type="button"
      class="pagination-dot"
      :class="{ active: index === activeIndex }"
      role="tab"
      :aria-selected="index === activeIndex"
      :aria-label="item.label"
      @click="$emit('select', index)"
    >
      <span class="pagination-dot-core" />
      <span class="pagination-dot-tooltip">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  activeIndex: {
    type: Number,
    default: 0
  }
})

defineEmits(['select'])
</script>
