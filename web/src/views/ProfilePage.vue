<template>
  <div class="prototype-page profile-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <span class="brand-text">一炁文化</span>
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

    <main class="profile-main">
      <img :src="logoUrl" alt="一炁" class="profile-logo ink-blend" />
      <h1 class="profile-title">个人中心</h1>
      <p class="profile-greeting">欢迎回来，<span>{{ displayName }}</span></p>

      <section class="profile-orders">
        <h2 class="profile-section-title">我的订单</h2>
        <p v-if="ordersLoading" class="profile-muted">加载中…</p>
        <p v-else-if="!orders.length" class="profile-muted">暂无盲盒订单</p>
        <div v-else class="order-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-head">
              <strong>{{ order.productName }}</strong>
              <span class="order-status">{{ order.statusLabel }}</span>
            </div>
            <p class="order-meta">订单号 {{ order.id }} · ¥{{ order.amountYuan }} · {{ shippingNote }}</p>
            <p class="order-meta">{{ order.recipientName }} {{ order.recipientPhone }}</p>
            <p class="order-meta">{{ order.shippingAddress }}</p>
            <p v-if="order.trackingCompany" class="order-logistics">
              物流：{{ order.trackingCompany }} {{ order.trackingNo }}
            </p>
            <button
              v-if="order.status === 'pending'"
              type="button"
              class="order-pay-btn"
              :disabled="payingId === order.id"
              @click="payOrder(order.id)"
            >
              {{ payingId === order.id ? '支付中…' : `去支付 ¥${order.amountYuan}` }}
            </button>
          </article>
        </div>
      </section>

      <button type="button" class="logout-btn" @click="logout">退出登录</button>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useBackToHub } from '@/composables/useBackToHub'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { clearSession } from '@/utils/session'
import { fetchMyOrders, payShopOrder } from '@/api/shop'
import { SHIPPING_NOTE } from '@/constants/blindBoxes'
import '@/styles/prototype-base.css'

const canvasRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const router = useRouter()
const goHub = useBackToHub()
const orders = ref([])
const ordersLoading = ref(false)
const payingId = ref(null)
const shippingNote = SHIPPING_NOTE

const displayName = computed(() => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return '炁友'
    const user = JSON.parse(raw)
    return user?.username || user?.name || user?.nickname || '炁友'
  } catch {
    return '炁友'
  }
})

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await fetchMyOrders()
    orders.value = res?.data?.items ?? res?.items ?? []
  } catch {
    orders.value = []
  } finally {
    ordersLoading.value = false
  }
}

const payOrder = async (id) => {
  payingId.value = id
  try {
    await payShopOrder(id)
    ElMessage.success('支付成功')
    await loadOrders()
  } catch (error) {
    ElMessage.error(error?.message || '支付失败')
  } finally {
    payingId.value = null
  }
}

const logout = () => {
  clearSession()
  router.push('/login')
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
}

.profile-main {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 5% 100px;
  text-align: center;
}

.profile-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
}

.profile-title {
  font-family: var(--font-serif, 'Noto Serif SC', serif);
  font-size: 28px;
  letter-spacing: 0.2em;
  color: var(--gold-light, #eadec7);
  margin-bottom: 8px;
}

.profile-greeting {
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 32px;
}

.profile-section-title {
  font-size: 16px;
  letter-spacing: 0.15em;
  color: var(--gold-light, #eadec7);
  margin-bottom: 16px;
}

.profile-orders {
  width: min(640px, 100%);
  text-align: left;
  margin-bottom: 32px;
}

.profile-muted {
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 12, 0.65);
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.order-status {
  font-size: 12px;
  color: var(--gold-light, #eadec7);
}

.order-meta,
.order-logistics {
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.order-pay-btn {
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid rgba(234, 222, 199, 0.35);
  border-radius: 6px;
  background: transparent;
  color: var(--gold-light, #eadec7);
  cursor: pointer;
}

.logout-btn {
  padding: 12px 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
</style>
