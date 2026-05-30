import { onMounted, onUnmounted } from 'vue'

export function useDustCanvas(canvasRef, options = {}) {
  const { count = null } = options
  let raf = 0
  let particles = []
  let w = 0
  let h = 0

  class DustParticle {
    constructor() {
      this.x = Math.random() * w
      this.y = Math.random() * h
      this.size = Math.random() * 1.5
      this.speedX = (Math.random() - 0.5) * 0.1
      this.speedY = (Math.random() - 0.5) * 0.1
      this.alpha = Math.random() * 0.4
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY
      if (this.x < 0) this.x = w
      if (this.x > w) this.x = 0
      if (this.y < 0) this.y = h
      if (this.y > h) this.y = 0
    }

    draw(ctx) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 222, 199, ${this.alpha})`
      ctx.fill()
    }
  }

  const resize = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w
    canvas.height = h
    const pCount = count ?? (w > 800 ? 150 : 50)
    particles = Array.from({ length: pCount }, () => new DustParticle())
  }

  const animate = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    particles.forEach((p) => {
      p.update()
      p.draw(ctx)
    })
    raf = requestAnimationFrame(animate)
  }

  onMounted(() => {
    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(animate)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    cancelAnimationFrame(raf)
  })
}
