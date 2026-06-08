<template>
  <div class="trait-card-frame" :class="{ 'is-active': active }">
    <div class="trait-card-frame-border" />
    <div class="trait-card-frame-shine" aria-hidden="true" />
    <div class="trait-card-frame-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  }
})
</script>
