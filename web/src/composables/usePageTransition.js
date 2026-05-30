import { onMounted, ref } from 'vue'

export function usePageTransition(delay = 500) {
  const loaded = ref(false)

  onMounted(() => {
    setTimeout(() => {
      loaded.value = true
    }, delay)
  })

  return { loaded }
}
