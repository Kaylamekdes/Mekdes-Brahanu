import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Links from the design source (Main.dc.html), plus Contact and "Send me a
// message". More work stays on the page without a link.
const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Approach', href: '#approach' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]
// WhatsApp opens in a new tab.
const MESSAGE = {
  href: 'https://wa.me/254716658786',
  target: '_blank',
  rel: 'noopener noreferrer',
  'aria-label': 'Send Mekdes a message on WhatsApp (opens in a new tab)',
}

// A link to a section of the home page: a plain anchor on the home page
// itself, a route link to the home page and that section from anywhere else
// (ScrollManager in main.tsx scrolls to it).
function SectionLink({ hash, ...props }: { hash: string } & Omit<ComponentProps<'a'>, 'href'>) {
  const { pathname } = useLocation()
  return pathname === '/' ? <a href={hash} {...props} /> : <Link to={`/${hash}`} {...props} />
}

// The bar turns to glass once the top of this section reaches the nav's bottom
// edge. Pages without it (the case studies) have the glass from the start.
const GLASS_SECTION_ID = 'work'
const NAV_HEIGHT = 72
// Taller than any page, so the observed area reaches the top of the document
const ABOVE = 1_000_000

// The inline links show from this width; below it they move into the menu.
const INLINE_LINKS = '(min-width: 900px)'

const FADE = 'transition-opacity duration-250 ease-design motion-reduce:transition-none'

function useGlass() {
  const [glass, setGlass] = useState(false)

  useEffect(() => {
    const section = document.getElementById(GLASS_SECTION_ID)
    if (!section) {
      setGlass(true)
      return
    }
    let observer: IntersectionObserver | undefined

    // The root runs from far above the page down to the nav's bottom edge, so
    // the section intersects it from the moment its top passes that edge and
    // for as long as the page is scrolled past it. An observer only reports
    // changes, so a root that also covers everything above means a jump
    // straight past the section (a nav link, a reload) still switches it on.
    const observe = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(([entry]) => setGlass(entry.isIntersecting), {
        rootMargin: `${ABOVE}px 0px ${NAV_HEIGHT - window.innerHeight}px 0px`,
      })
      observer.observe(section)
    }

    observe()
    window.addEventListener('resize', observe)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', observe)
    }
  }, [])

  return glass
}

export default function SiteNav() {
  const glass = useGlass()
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const panelId = useId()
  const close = () => setOpen(false)

  // The menu only exists below 900px; widening the window closes it.
  useEffect(() => {
    const wide = window.matchMedia(INLINE_LINKS)
    const onChange = () => wide.matches && setOpen(false)
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) buttonRef.current?.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true

    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    panelRef.current?.querySelector('a')?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      // Keep focus on the bar and the panel while the menu is open.
      const items = [...headerRef.current!.querySelectorAll<HTMLElement>('a[href], button')].filter(
        (el) => el.getClientRects().length > 0,
      )
      const first = items[0]
      const last = items[items.length - 1]
      const inside = items.includes(document.activeElement as HTMLElement)
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = overflow
    }
  }, [open])

  const line = 'absolute left-0 h-0.5 w-full rounded-full bg-current duration-200 ease-design motion-reduce:transition-none'

  return (
    <header ref={headerRef} data-glass={glass || undefined} className="fixed inset-x-0 top-0 z-50 text-paper">
      {/* Over the hero: the faint top gradient. Over the projects: glass. Both are
          background layers only, so the links never fade. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-linear-to-b from-[#0a0a0a]/80 to-transparent ${FADE} ${glass ? 'opacity-0' : 'opacity-100'}`}
      />
      <div aria-hidden="true" className={`nav-glass pointer-events-none absolute inset-0 ${FADE} ${glass ? 'opacity-100' : 'opacity-0'}`} />

      {/* Full-screen menu below 900px, solid so the links stay readable. It
          becomes visible at once when opening, so focus can move into it, and
          hidden only after the fade when closing. */}
      <div
        id={panelId}
        ref={panelRef}
        className={`fixed inset-0 flex flex-col overflow-y-auto bg-ground px-5 pt-24 pb-[max(32px,env(safe-area-inset-bottom))] duration-200 ease-design motion-reduce:transition-none tablet:px-12 min-[900px]:hidden ${open ? 'visible opacity-100 transition-opacity' : 'invisible opacity-0 transition-[opacity,visibility]'}`}
      >
        <ul className="m-0 list-none border-t border-line p-0">
          {LINKS.map((link) => (
            <li key={link.href} className="border-b border-line">
              <SectionLink
                hash={link.href}
                onClick={close}
                className="font-display flex min-h-18 items-center text-[36px] leading-none font-normal tracking-[-0.02em] no-underline transition-colors duration-200 ease-design hover:text-primary-soft"
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
        </ul>
        <a
          {...MESSAGE}
          onClick={close}
          className="mt-8 inline-flex min-h-[52px] items-center justify-center self-start rounded-full bg-primary-strong px-7 text-[17px] font-medium text-white no-underline transition-[color,background-color,translate] duration-200 ease-design hover:-translate-y-0.5 hover:bg-primary-strong-hover"
        >
          Send me a message
        </a>
      </div>

      <nav
        aria-label="Primary"
        className="nav-halo relative mx-auto flex min-h-[72px] max-w-[1200px] items-center justify-between gap-x-6 px-5 min-[701px]:px-12"
      >
        <SectionLink
          hash="#top"
          onClick={close}
          className="font-display flex min-h-11 items-center text-[22px] font-medium tracking-[-0.01em] no-underline"
        >
          Mekdes Brahanu
        </SectionLink>
        <div className="flex items-center gap-x-6 text-[15px] font-medium max-[900px]:hidden min-[1100px]:gap-x-8">
          {LINKS.map((link) => (
            <SectionLink key={link.href} className="py-3 no-underline decoration-primary-soft decoration-2 underline-offset-[6px] hover:underline" hash={link.href}>
              {link.label}
            </SectionLink>
          ))}
          <a
            {...MESSAGE}
            className="inline-flex h-9 items-center rounded-full bg-primary-strong px-4 text-[14px] font-medium text-white no-underline transition-[color,background-color,translate] duration-200 ease-design hover:-translate-y-0.5 hover:bg-primary-strong-hover"
          >
            Send me a message
          </a>
        </div>
        <button
          ref={buttonRef}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2.5 flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-paper min-[900px]:hidden"
        >
          <span aria-hidden="true" className="relative block h-3.5 w-[22px]">
            <span className={`${line} top-0 transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`${line} top-[6px] transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`${line} top-3 transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>
    </header>
  )
}
