<template>
  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect v-if="name === 'book'" x="4" y="4" width="16" height="16" />
    <line v-if="name === 'book'" x1="4" y1="12" x2="20" y2="12" />

    <polygon v-if="name === 'triangle'" points="12,2 22,20 2,20" />

    <path v-if="name === 'arrow'" d="M5 12h14M12 5l7 7-7 7" />

    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="10" stroke-dasharray="4 4" />
    </template>

    <path v-if="name === 'cross'" d="M12 2v20M2 12h20" />

    <rect v-if="name === 'square'" x="4" y="4" width="16" height="16" rx="2" />

    <template v-if="name === 'wave'">
      <circle cx="8" cy="12" r="4" />
      <circle cx="16" cy="12" r="4" />
    </template>

    <path
      v-if="name === 'heart'"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />

    <template v-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </template>

    <template v-if="name === 'peak'">
      <line x1="2" y1="22" x2="22" y2="2" />
      <line x1="22" y1="2" x2="16" y2="2" />
      <line x1="22" y1="2" x2="22" y2="8" />
    </template>

    <polygon v-if="name === 'star'" points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />

    <template v-if="name === 'eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true }
})
</script>
