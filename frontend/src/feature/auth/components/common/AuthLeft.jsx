import { useEffect, useRef } from 'react'
import styles from '../../style/auth-left.module.scss'

export default function AuthLeft() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef([])
  const animFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init orbs
    orbsRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 120 + Math.random() * 160,
      color: [
        'rgba(82,39,255,',
        'rgba(177,158,239,',
        'rgba(255,159,252,',
        'rgba(82,39,255,',
        'rgba(120,80,255,',
        'rgba(200,140,255,',
      ][i],
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
    }))

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    const draw = () => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Deep background
      ctx.fillStyle = '#07071a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Aurora waves
      const time = Date.now() * 0.0005
      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.2 + i * 80, canvas.width, canvas.height * 0.8)
        gradient.addColorStop(0, `rgba(82,39,255,${0.03 + i * 0.01})`)
        gradient.addColorStop(0.4, `rgba(177,158,239,${0.05 + i * 0.01})`)
        gradient.addColorStop(0.7, `rgba(255,159,252,${0.04 + i * 0.01})`)
        gradient.addColorStop(1, `rgba(82,39,255,0.02)`)

        ctx.beginPath()
        ctx.moveTo(0, canvas.height * 0.5)
        for (let x = 0; x <= canvas.width; x += 8) {
          const y = canvas.height * 0.5
            + Math.sin(x * 0.004 + time + i * 1.2) * (60 + i * 20)
            + Math.sin(x * 0.008 + time * 1.5 + i) * 30
          ctx.lineTo(x, y)
        }
        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Orbs
      orbsRef.current.forEach(orb => {
        orb.phase += orb.speed

        // Mouse attraction
        const dx = mouseRef.current.x - orb.x
        const dy = mouseRef.current.y - orb.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 300 && dist > 0) {
          orb.vx += (dx / dist) * 0.08
          orb.vy += (dy / dist) * 0.08
        }

        // Dampen + move
        orb.vx *= 0.97
        orb.vy *= 0.97
        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius

        const pulsedRadius = Math.max(1, orb.radius + Math.sin(orb.phase) * 18)

        // Ensure all values are valid numbers
        if (!Number.isFinite(orb.x) || !Number.isFinite(orb.y) || !Number.isFinite(pulsedRadius)) {
          return
        }

        try {
          const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulsedRadius)
          grad.addColorStop(0, orb.color + '0.18)')
          grad.addColorStop(0.5, orb.color + '0.08)')
          grad.addColorStop(1, orb.color + '0)')

          ctx.beginPath()
          ctx.arc(orb.x, orb.y, pulsedRadius, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        } catch (e) {
          // Skip this orb if gradient creation fails
          return
        }
      })

      // Noise grain overlay
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.012})`
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          1, 1
        )
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className={styles.leftPanel}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Branding overlay */}
      <div className={styles.leftOverlay}>
        {/* Logo */}
        <div className={styles.logo}>
          <img 
            src="/hostkit-logo-text-white.png" 
            alt="HostKit" 
            style={{ height: '40px', width: 'auto' }}
          />
        </div>

        {/* Bottom tagline */}
        <div className={styles.leftBottom}>
          <p className={styles.tagline}>
            Deploy. Debug.<br />
            <span>Dominate.</span>
          </p>
          <p className={styles.subTagline}>
            AI-powered deployment platform
          </p>
        </div>

        {/* Floating badge */}
        <div className={styles.floatingBadge}>
          <div className={styles.badgeDot} />
          <div className={styles.badgeText}>
            <strong>Ready</strong> to deploy in minutes
          </div>
        </div>
      </div>
    </div>
  )
}