import { useEffect, useRef, useSyncExternalStore } from 'react'
import GalleryTunnel, { type TunnelMotion } from './components/originkit/ui/gallery-tunnel'
import FirstSentence from './components/FirstSentence'
import Approach from './components/Approach'
import SelectedWork from './components/SelectedWork'
import SiteNav from './components/SiteNav'
import Tools from './components/Tools'
import About from './components/About'
import MoreWork from './components/MoreWork'
import Contact from './components/Contact'
import useReveal from './components/useReveal'
import useDocumentMeta from './components/useDocumentMeta'
import { Link } from 'react-router-dom'

// The case study pages. DCash and Alifab have no pages, so they go to More
// work (docs/04).
const PROJECTS = [
  { image: 'src', name: 'SRC Tech Impact Platform', href: '/work/src' },
  { image: 'nil', name: 'Nilson Digital Pharmacy', href: '/work/nilson' },
  { image: 'sav', name: 'Savannah Informatics', href: '/work/savannah' },
  { image: 'dc', name: 'DCash Africa', href: '#more' },
  { image: 'ali', name: 'Alifab Solutions', href: '#more' },
]

// The home page's meta description: the hero's supporting copy (draft)
const HOME_DESCRIPTION = 'Great products are built from understanding where people get stuck, not from adding features.'

// How far the page scrolls while the tunnel stays pinned, in viewport heights.
const SCROLL_DISTANCE_VH = 150
// Share of that scroll at which the headline has fully arrived (full size,
// fully opaque, sharp). Nothing about it moves after this point.
const HEADER_SETTLE_PROGRESS = 0.75
// Where the headline ends, as a share of its natural size. It ends smaller
// still if needed to keep HEADER_SIDE_MARGIN clear on both sides and to stay
// clear of the nav.
const HEADER_END_SCALE = 0.8
const HEADER_SIDE_MARGIN = 0.08
// Phones settle at full size, so the headline reads larger than the section
// headings below it (the side padding keeps it inside the margin).
const HEADER_END_SCALE_PHONE = 1
const PHONE = '(width < 701px)'
const NAV_HEIGHT = 72
// The headline starts this many times farther away than where it lands.
const START_DEPTH = 12
// The tunnel drifts forward this many world units over the first part of the scroll.
const DRIFT_DISTANCE = 4
const DRIFT_UNTIL = 0.3

// Tunnel speed, in the component's speed units (the original preset was 100).
const BASE_SPEED = 60
// Where the tunnel ends up once the headline has fully arrived.
const HEADER_TUNNEL_SPEED = BASE_SPEED * 0.25
const HEADER_TUNNEL_OPACITY = 0.35

// The scroll cue is gone by this share of the scroll distance.
const CUE_FADE_BY = 0.05

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

// three.js dropped WebGL 1, so the tunnel needs a WebGL 2 context.
const hasWebGL2 = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
})()

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const smoothstep = (from: number, to: number, v: number) => {
  const t = clamp01((v - from) / (to - from))
  return t * t * (3 - 2 * t)
}

// Below 700px: smaller, and the hero pair shares the row at equal widths, or
// stacks full width when it doesn't fit. The height is divided by the hero's
// end scale so the buttons are still at least 44px tall on screen.
const BUTTON =
  'inline-flex min-h-[max(48px,calc(44px/var(--hero-end-scale,1)))] items-center justify-center rounded-full px-[26px] text-base font-medium no-underline transition-colors duration-200 ease-design max-tablet:min-h-[calc(44px/var(--hero-end-scale,1))] max-tablet:min-w-max max-tablet:flex-[1_1_0] max-tablet:px-5 max-tablet:text-[15px]'

// Hero copy from the design source. The decorative copy is the blurred layer
// the headline sharpens out of, so it stays out of the outline.
function HeroCopy({ decorative = false }: { decorative?: boolean }) {
  const Heading = decorative ? 'div' : 'h1'
  return (
    <div className="mx-auto max-w-[960px] text-center text-paper">
      <Heading className="font-display m-0 text-[38px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance min-[701px]:text-[46px] min-[701px]:leading-[1.04] min-[701px]:font-normal min-[1100px]:text-[62px]">
        Design that starts with <em className="text-primary-soft">why</em>{' '}
        <br className="hidden min-[1100px]:inline" />
        people do what they do.
      </Heading>
      <p className="mx-auto mt-5 mb-0 max-w-[480px] text-[17px] leading-normal text-pretty text-paper-muted">
        {/* Draft statement awaiting approval */}
        <FirstSentence text="Great products are built from understanding where people get stuck, not from adding features." />
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#work" className={`${BUTTON} bg-primary-strong text-white hover:bg-primary-strong-hover`}>
          See selected work
        </a>
        <a
          href="#contact"
          className={`${BUTTON} text-paper shadow-[inset_0_0_0_1px_var(--color-paper)] hover:text-primary-soft hover:shadow-[inset_0_0_0_1px_var(--color-primary-soft)]`}
        >
          Get in touch
        </a>
      </div>
    </div>
  )
}

// Case studies are routes; #more is a section of this page.
function LinkTo({ href, ...props }: React.ComponentProps<'a'> & { href: string }) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />
}

function ProjectRow() {
  return (
    <ul className="m-0 flex w-full snap-x scroll-px-4 gap-4 overflow-x-auto px-4 py-8 sm:justify-center">
      {PROJECTS.map((project) => (
        <li key={project.image} className="w-48 shrink-0 list-none snap-start sm:w-56">
          <LinkTo
            href={project.href}
            className="block overflow-hidden rounded-lg outline-offset-4"
          >
            <img
              src={`/work/${project.image}-floor.webp`}
              alt={project.name}
              className="aspect-[1/2] w-full"
            />
          </LinkTo>
        </li>
      ))}
    </ul>
  )
}

// "Scroll" with a line beneath it; fades out over the first part of the scroll.
function ScrollCue() {
  const cueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cue = cueRef.current
    if (!cue) return

    let maxScroll = 0
    let frame = 0

    const render = () => {
      frame = 0
      const fadeBy = CUE_FADE_BY * (SCROLL_DISTANCE_VH / 100) * window.innerHeight
      const opacity = maxScroll > 0 ? 1 - smoothstep(0, fadeBy, window.scrollY) : 0
      cue.style.opacity = String(opacity)
      cue.style.visibility = opacity > 0 ? 'visible' : 'hidden'
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight
      schedule()
    }

    // Page height changes as images load, so watch the body rather than only resize.
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div
      ref={cueRef}
      className="pointer-events-none fixed inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] z-40 flex justify-center opacity-0"
    >
      <div className="flex flex-col items-center gap-3">
        <p className="m-0 pl-[0.24em] text-[11px] leading-none font-medium tracking-[0.24em] text-paper uppercase">
          Scroll
        </p>
        <span aria-hidden="true" className="scroll-cue-line relative block h-10 w-px overflow-hidden bg-paper/45" />
      </div>
    </div>
  )
}

// Tunnel pinned full-screen while the headline travels out of the vanishing point.
function TunnelHero() {
  const blockRef = useRef<HTMLDivElement>(null)
  const sharpRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const tunnelRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const motion = useRef<TunnelMotion>({ drift: 0, speed: BASE_SPEED, boost: true })

  useEffect(() => {
    const block = blockRef.current
    const sharp = sharpRef.current
    const blur = blurRef.current
    const tunnel = tunnelRef.current
    const section = sectionRef.current
    if (!block || !sharp || !blur || !tunnel || !section) return

    let maxScroll = 1
    let endScale = HEADER_END_SCALE
    let frame = 0

    const measure = () => {
      maxScroll = Math.max(1, section.offsetHeight - window.innerHeight)
      // offsetWidth/Height ignore the transform, so this is the natural size.
      const fitWidth = (window.innerWidth * (1 - 2 * HEADER_SIDE_MARGIN)) / block.offsetWidth
      const fitHeight = (window.innerHeight - 2 * (NAV_HEIGHT + 16)) / block.offsetHeight
      const largest = window.matchMedia(PHONE).matches ? HEADER_END_SCALE_PHONE : HEADER_END_SCALE
      endScale = Math.min(largest, fitWidth, fitHeight)
      block.style.setProperty('--hero-end-scale', String(endScale))
    }

    const render = () => {
      frame = 0
      const progress = clamp01(window.scrollY / maxScroll)
      const t = clamp01(progress / HEADER_SETTLE_PROGRESS)

      // Perspective-style approach: scale is endScale / depth, depth eases in to 1.
      const depth = 1 + (START_DEPTH - 1) * (1 - t) ** 2
      block.style.transform = `scale(${endScale / depth})`
      block.style.opacity = String(0.15 + 0.85 * smoothstep(0, 0.7, t))
      block.style.pointerEvents = t >= 1 ? 'auto' : 'none'

      const sharpness = smoothstep(0.35, 0.9, t)
      sharp.style.opacity = String(sharpness)
      blur.style.opacity = String(1 - sharpness)

      // Focus shifts to the headline: the canvas fades and the tunnel slows
      // (the component eases the speed change), boost is off once it has landed.
      const focus = smoothstep(0, 1, t)
      tunnel.style.opacity = String(1 - (1 - HEADER_TUNNEL_OPACITY) * focus)
      const d = clamp01(progress / DRIFT_UNTIL)
      motion.current.drift = DRIFT_DISTANCE * (1 - (1 - d) ** 3)
      motion.current.speed = BASE_SPEED + (HEADER_TUNNEL_SPEED - BASE_SPEED) * focus
      motion.current.boost = t < 1
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const onResize = () => {
      measure()
      schedule()
    }
    // Tabbing into the buttons before they have arrived brings the headline in.
    const onFocus = () => {
      if (window.scrollY < maxScroll * HEADER_SETTLE_PROGRESS) window.scrollTo({ top: maxScroll })
    }

    // The tunnel stops drawing once the hero has scrolled away.
    const visibility = new IntersectionObserver(([entry]) => {
      motion.current.paused = !entry.isIntersecting
    })
    visibility.observe(section)

    measure()
    render()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)
    sharp.addEventListener('focusin', onFocus)
    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      sharp.removeEventListener('focusin', onFocus)
    }
  }, [])

  return (
      <section
        ref={sectionRef}
        aria-label="Introduction and selected project gallery"
        className="relative"
        style={{ height: `calc(100svh + ${SCROLL_DISTANCE_VH}svh)` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          <div ref={tunnelRef} className="absolute inset-0">
            <GalleryTunnel motion={motion} />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 max-tablet:px-[8vw]">
            <div
              ref={blockRef}
              className="relative w-fit max-w-full will-change-[transform,opacity]"
            >
              <div ref={blurRef} aria-hidden="true" inert className="absolute inset-0 blur-[16px] select-none">
                <HeroCopy decorative />
              </div>
              <div ref={sharpRef} className="relative">
                <HeroCopy />
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

// No WebGL or reduced motion: headline in place, then the projects as a static row.
function StaticHero() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 pt-24 pb-8">
      <div className="w-full px-5">
        <HeroCopy />
      </div>
      <ProjectRow />
    </div>
  )
}

function App() {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion)
  useReveal()
  useDocumentMeta('Mekdes Brahanu', HOME_DESCRIPTION)

  return (
    <>
      <SiteNav />
      <main id="top">
        {hasWebGL2 && !reducedMotion ? <TunnelHero /> : <StaticHero />}
        <SelectedWork />
        <Approach />
        <Tools />
        <About />
        <MoreWork />
        <Contact />
      </main>
      <ScrollCue />
    </>
  )
}

export default App
