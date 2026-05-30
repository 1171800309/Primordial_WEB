import { nextTick, onMounted, onUnmounted, ref } from 'vue'

export function useSegmentControl(sliderRef, defaultTab, scopeSelector = '') {
  const activeTab = ref(defaultTab)

  const updateSlider = (btnEl) => {
    const slider = sliderRef.value
    const control = slider?.parentElement
    if (!slider || !btnEl || !control) return
    slider.style.width = `${btnEl.offsetWidth}px`
    slider.style.transform = `translateX(${btnEl.offsetLeft - 6}px)`
  }

  const selectTab = async (tabId, btnEl) => {
    activeTab.value = tabId
    await nextTick()
    updateSlider(btnEl)
  }

  const onResize = () => {
    const activeBtn = document.querySelector(
      scopeSelector ? `${scopeSelector} .segment-btn.active` : '.segment-btn.active'
    )
    if (activeBtn) updateSlider(activeBtn)
  }

  onMounted(() => {
    setTimeout(onResize, 100)
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { activeTab, selectTab, updateSlider }
}
