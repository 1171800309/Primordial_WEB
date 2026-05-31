import { useRouter } from 'vue-router'

export function useBackToHub() {
  const router = useRouter()
  return () => router.replace({ name: 'hub' })
}
