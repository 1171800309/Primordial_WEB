import { onMounted, onUnmounted, ref } from 'vue'

export function useOrbitCanvas(canvasRef, options = {}) {
  const { opacity = 0.5, particleCount = null } = options
  let raf = 0
  let particles = []
  let w = 0
  let h = 0

  class OrbitParticle {
    constructor() {
      this.angle = Math.random() * Math.PI * 2
      this.radius = Math.random() * (w > 800 ? 600 : 300) + 50
      this.speed = (0.00015 + Math.random() * 0.0002) * (Math.random() > 0.5 ? 1 : -1)
      this.size = Math.random() * 1.5 + 0.5
      const alpha = Math.random() * 0.5 + 0.1
      this.color =
        Math.random() > 0.8
          ? `rgba(234, 222, 199, ${alpha})`
          : `rgba(255, 255, 255, ${alpha * 0.4})`
      this.yOffset = (Math.random() - 0.5) * 100
    }

    update() {
      this.angle += this.speed
    }

    draw(ctx) {
      const cx = w / 2
      const cy = h / 2
      const x = cx + Math.cos(this.angle) * this.radius
      const y = cy + Math.sin(this.angle) * this.radius * 0.4 + this.yOffset
      ctx.beginPath()
      ctx.arc(x, y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = this.color
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
    const count = particleCount ?? (w > 800 ? 300 : 120)
    particles = Array.from({ length: count }, () => new OrbitParticle())
  }

  const animate = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = `rgba(5, 5, 7, ${1 - opacity})`
    ctx.fillRect(0, 0, w, h)

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.8)
    grad.addColorStop(0, 'rgba(234, 222, 199, 0.03)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

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

  return { resize }
}
