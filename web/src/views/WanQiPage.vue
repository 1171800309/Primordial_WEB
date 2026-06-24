<template>
  <div class="prototype-page wanqi-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
    </div>

    <router-link to="/hub" class="left-return-dot" :style="hubReturnStyle">
      <div class="dot-core" />
      <div class="return-label">← 返回能量中枢</div>
    </router-link>

    <a href="#" class="left-return-dot" :style="storeReturnStyle" @click.prevent="closeStore">
      <div class="dot-core" />
      <div class="return-label">← 返回万炁之门</div>
    </a>

    <div id="portal-view" class="view-container" :class="{ 'view-active': !storeOpen, 'bg-mode': storeOpen }">
      <div class="locked-section">
        <div class="lock-overlay" aria-hidden="true" />

        <div class="locked-content">
          <div class="portal-title">万炁之城</div>

          <div class="portals-grid">
            <div v-for="portal in portals" :key="portal.name" class="portal-item">
              <div class="portal-icon" v-html="portal.icon" />
              <div class="portal-name">{{ portal.name }}</div>
            </div>
          </div>

          <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <div class="lock-text">暂未开放</div>
        </div>
      </div>

      <div v-if="showBlindBoxes" class="unlocked-section">
        <div
          v-for="box in blindBoxes"
          :key="box.key"
          class="mystery-box-wrapper"
          :class="`mystery-box-${box.key}`"
          @click="openStore(box.key)"
        >
          <div class="mystery-box-icon">
            <BlindBoxVisual :variant="box.key" size="sm" />
          </div>
          <div class="box-name">{{ box.title }}</div>
          <div class="box-price">¥ {{ box.priceYuan }}.00</div>
        </div>
      </div>
    </div>

    <div id="store-view" class="view-container" :class="{ 'view-active': storeOpen, 'view-hidden': !storeOpen }">
      <div class="store-content" v-if="activeBox">
        <div class="store-header">
          <h2>{{ activeBox.title }}</h2>
          <p class="store-shipping">{{ shippingNote }}</p>
        </div>

        <div class="single-product-card">
          <div class="product-visual">
            <BlindBoxVisual :variant="activeBox.key" size="md" />
          </div>
          <div class="product-body">
            <div class="product-title">{{ activeBox.productName }}</div>
            <div class="product-price">¥ {{ activeBox.priceYuan }}.00</div>
            <AutoFitCoverText class="product-desc-fit" :max-size="13" :min-size="10">
              <p class="product-desc">{{ activeBox.description }}</p>
            </AutoFitCoverText>
            <div class="product-ship-tag">{{ shippingNote }}</div>
          </div>
        </div>

        <div class="checkout-panel">
          <h3>收货信息</h3>
          <el-form label-position="top" class="checkout-form">
            <el-form-item label="收件人">
              <el-input v-model="checkout.recipientName" placeholder="请输入收件人姓名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="checkout.recipientPhone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="收货地址">
              <el-input v-model="checkout.shippingAddress" type="textarea" :rows="3" placeholder="省市区 + 详细地址" />
            </el-form-item>
          </el-form>
          <button type="button" class="checkout-btn" :disabled="paying" @click="submitOrder">
            {{ paying ? '处理中…' : `确认支付 ¥${activeBox.priceYuan}.00` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { BLIND_BOXES, SHIPPING_NOTE } from '@/constants/blindBoxes'
import { createShopOrder, payShopOrder } from '@/api/shop'
import BlindBoxVisual from '@/components/wanqi/BlindBoxVisual.vue'
import AutoFitCoverText from '@/components/trait/AutoFitCoverText.vue'
import '@/styles/prototype-base.css'
import '@/styles/pages/万炁之城1.css'

const canvasRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const storeOpen = ref(false)
const activeBoxKey = ref('')
const paying = ref(false)
const shippingNote = SHIPPING_NOTE
const blindBoxes = Object.values(BLIND_BOXES)
// 下方盲盒商城暂不显示，仅展示「万炁之城」部分
const showBlindBoxes = ref(false)

const checkout = reactive({
  recipientName: '',
  recipientPhone: '',
  shippingAddress: ''
})

const activeBox = computed(() => BLIND_BOXES[activeBoxKey.value] || null)

const hubReturnStyle = computed(() =>
  storeOpen.value
    ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }
    : { opacity: 1, visibility: 'visible', pointerEvents: 'auto' }
)

const storeReturnStyle = computed(() =>
  storeOpen.value
    ? { opacity: 1, visibility: 'visible', pointerEvents: 'auto' }
    : { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }
)

const portals = [
  { name: '眼', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M10,50 Q50,15 90,50 Q50,85 10,50" stroke-width="3"/><circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="6" fill="currentColor"/></svg>' },
  { name: '耳', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M60,20 A30,30 0 1,0 60,80 A20,20 0 1,1 60,40 A10,10 0 1,0 60,60" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: '鼻', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M50,85 C40,85 35,75 40,65 C45,55 50,45 50,25" stroke-width="3" stroke-linecap="round"/><path d="M50,85 C60,85 65,75 60,65 C55,55 50,45 50,25" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: '舌', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M50,15 C80,50 80,85 50,85 C20,85 20,50 50,15 Z" stroke-width="3"/><line x1="50" y1="40" x2="50" y2="75" stroke-linecap="round"/></svg>' },
  { name: '触', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><circle cx="50" cy="50" r="10" fill="currentColor"/><circle cx="50" cy="50" r="16" stroke-dasharray="4 4"/><path d="M38,38 Q10,20 15,5 T5,15" stroke-width="2"/><path d="M62,62 Q90,80 85,95 T95,85" stroke-width="2"/></svg>' }
]

const openStore = (key) => {
  activeBoxKey.value = key
  storeOpen.value = true
}

const closeStore = () => {
  storeOpen.value = false
  activeBoxKey.value = ''
}

const submitOrder = async () => {
  if (!activeBox.value) return
  if (!checkout.recipientName.trim() || !checkout.recipientPhone.trim() || !checkout.shippingAddress.trim()) {
    ElMessage.warning('请填写完整收货信息')
    return
  }

  paying.value = true
  try {
    const created = await createShopOrder({
      productSku: activeBox.value.sku,
      recipientName: checkout.recipientName.trim(),
      recipientPhone: checkout.recipientPhone.trim(),
      shippingAddress: checkout.shippingAddress.trim()
    })
    const orderId = created?.data?.id
    if (!orderId) {
      ElMessage.error('下单失败，请稍后重试')
      return
    }
    await payShopOrder(orderId)
    ElMessage.success('支付成功')
    closeStore()
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || '下单失败'
    ElMessage.error(msg)
  } finally {
    paying.value = false
  }
}
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.5;
  pointer-events: none;
}

.left-return-dot {
  text-decoration: none;
}

/* 仅展示「万炁之城」部分：撑满整屏并水平垂直居中，整体放大 */
.wanqi-page .locked-section {
  flex: 1 1 100%;
  min-height: 100vh;
  padding-top: 0;
  border-bottom: none;
}

.wanqi-page .locked-content {
  gap: 36px;
}

.wanqi-page .portal-title {
  font-size: clamp(34px, 5vw, 48px);
}

.wanqi-page .portals-grid {
  gap: clamp(36px, 5vw, 56px);
}

.wanqi-page .portal-icon {
  width: 104px;
  height: 104px;
}

.wanqi-page .portal-icon svg {
  width: 48px;
  height: 48px;
}

.wanqi-page .portal-name {
  font-size: 18px;
}

.wanqi-page .locked-content .lock-icon {
  width: 54px;
  height: 54px;
}

.wanqi-page .locked-content .lock-text {
  font-size: 24px;
}

.wanqi-page .mystery-box-icon {
  width: auto;
  height: auto;
  animation: none;
}

.wanqi-page .product-visual {
  flex: 0 0 180px;
  min-height: 180px;
  background: transparent;
  border: none;
}

.wanqi-page .product-desc-fit {
  width: 100%;
  margin-bottom: 12px;
}

.wanqi-page .product-desc {
  margin: 0;
  line-height: 1.85;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
</style>
