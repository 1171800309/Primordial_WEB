<template>
  <svg
    class="cover-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect v-if="name === 'book'" x="3" y="6" width="18" height="12" rx="1" />
    <line v-if="name === 'book'" x1="3" y1="12" x2="21" y2="12" />

    <polygon v-if="name === 'triangle'" points="12 3 4 20 20 20" />

    <line v-if="name === 'arrow'" x1="5" y1="12" x2="19" y2="12" />
    <polyline v-if="name === 'arrow'" points="12 5 19 12 12 19" />

    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </template>

    <path v-if="name === 'cross'" d="M12 3v18M3 12h18M6.5 6.5L12 12" />

    <rect v-if="name === 'square'" x="4" y="4" width="16" height="16" rx="2" ry="2" />

    <path
      v-if="name === 'wave'"
      d="M8 8a4 4 0 1 0 0 8c2.67 0 4-4 6-4a4 4 0 1 1 0 8c-2.67 0-4-4-6-4"
    />

    <path
      v-if="name === 'heart'"
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    />

    <template v-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </template>

    <template v-if="name === 'peak'">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})
</script>
