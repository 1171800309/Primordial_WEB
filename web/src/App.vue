<template>
  <div class="yiqi-root">
    <router-view />
    <SiteDisclaimer v-if="showDisclaimer" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteDisclaimer from '@/components/layout/SiteDisclaimer.vue'

const route = useRoute()
const showDisclaimer = computed(() => route.name !== 'registerLoading')
</script>

