import { useEffect } from 'react'

// Appear-on-scroll, the one reveal system for every page: one
// IntersectionObserver for every [data-reveal] element. Each one shows once,
// when 15% of it is visible; the motion itself is CSS (index.css), where
// reduced motion turns it into a short plain fade rather than switching it
// off.
// Siblings stagger 80ms apart in document order within their group: the
// closest [data-reveal-group] or section. When an element comes in, any
// earlier element of its group still hidden comes in with it, so a label
// always leads its heading, and the heading its paragraphs and buttons.
// Observing starts only once the page has loaded and gone idle: a reload
// restores the scroll position, and a reveal fired during the tunnel's
// startup work would finish before anything paints.
const STAGGER = 80
const VISIBLE = 0.15

const groupOf = (el: Element) => el.closest('[data-reveal-group], section')

export default function useReveal() {
  useEffect(() => {
    // Tells main.tsx the reveal system is running, so it keeps content hidden
    // until revealed (otherwise everything shows after 1.5s).
    document.documentElement.dataset.revealReady = ''
    // In document order, so every batch below is too.
    let pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')]
    const reveal = (el: HTMLElement, delay: number) => {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
      el.dataset.revealed = ''
    }

    if (!('IntersectionObserver' in window)) {
      pending.forEach((el) => reveal(el, 0))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // The last element that came in, per group
        const last = new Map<Element | null, number>()
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const group = groupOf(entry.target)
          last.set(group, Math.max(last.get(group) ?? -1, pending.indexOf(entry.target as HTMLElement)))
        }
        if (!last.size) return
        const slots = new Map<Element | null, number>()
        pending = pending.filter((el, i) => {
          const group = groupOf(el)
          if (i > (last.get(group) ?? -1)) return true
          const slot = slots.get(group) ?? 0
          // Elements the layout hides (display: none) take no slot.
          if (el.getClientRects().length) slots.set(group, slot + 1)
          reveal(el, slot * STAGGER)
          observer.unobserve(el)
          return false
        })
      },
      { threshold: VISIBLE },
    )

    const observe = () => pending.forEach((el) => observer.observe(el))
    let idle = 0
    const whenIdle = () => {
      idle = typeof requestIdleCallback === 'function' ? requestIdleCallback(observe, { timeout: 1500 }) : setTimeout(observe, 300)
    }
    if (document.readyState === 'complete') whenIdle()
    else window.addEventListener('load', whenIdle, { once: true })
    return () => {
      window.removeEventListener('load', whenIdle)
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle)
      else clearTimeout(idle)
      observer.disconnect()
    }
  }, [])
}
