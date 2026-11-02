import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import FirstSentence from './FirstSentence'
import PlaceholderFrame from './PlaceholderFrame'
import { PROJECTS, projectHref, projectKind, projectNumber, type Project } from '../content/projects'

// Selected work as a deck of stacking cards. The projects, their order and
// their text come from content/projects.ts; each card links to its case study
// page (routes in main.tsx).

// How far an earlier card shrinks and dims once the next card fully covers it
// (the scroll-driven keyframes in index.css use the same values).
const COVERED_SCALE = 0.96
const COVERED_DIM = 0.35

const MONO = 'font-mono uppercase'

// The deck falls back to normal flow only from this width, when a screen is too
// short; below it the card layout is built to always fit.
const DESKTOP = '(min-width: 900px)'
// Below this width the cards are sized to their content rather than the screen.
const PHONE = '(max-width: 700px)'

// Every image slot is 16:10 and filled from the top. Two columns from 900px:
// the slot is up to 720px wide, at most 65% of the content, and never taller than
// the content area less 16px, so it keeps at least 64px from the card's top
// and bottom edges (card height minus --strip-pad, the 12px line, 32px above
// the title, 56px bottom padding and 16px: 116px). Below
// 900px it sits on top and shrinks to whatever height the text leaves
// (.stack-frame-slot in index.css).
const FRAME = 'relative aspect-[16/10] w-full overflow-hidden rounded-frame bg-frame shadow-hairline'
const COLUMNS = 'min-[900px]:grid-cols-[minmax(0,1fr)_min(720px,65%,calc((var(--card-h)-var(--strip-pad)-116px)*1.6))]'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const number = projectNumber(index)
  const titleId = `project-${project.slug}-title`
  return (
    <section
      aria-labelledby={titleId}
      className="stack-card group flex origin-top flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[border-color] duration-200 ease-design hover:border-primary-line"
      style={{ '--stack-index': index } as React.CSSProperties}
    >
      {/* Top row: what stays visible as a strip once later cards stack on top.
          --strip-pad is the space above it; --stack-step leaves room for both. */}
      {/* The card's content fades in (opacity only: transform belongs to the stacking).
          From 701px the line is hidden but keeps its box, so nothing below it
          moves; the heading carries its text for screen readers instead. */}
      <div data-reveal="fade" className={`${MONO} flex shrink-0 items-center gap-3 px-6 tablet:invisible pt-(--strip-pad) text-label leading-none text-muted max-tablet:px-7 tablet:px-10 min-[900px]:px-16`}>
        <span>{number}</span>
        <span aria-hidden="true">·</span>
        <span>{projectKind(project)}</span>
      </div>

      {/* Phones: title and descriptor, the image, then the button 28px below it.
          The title reserves two lines, so every card with a one- or two-line
          descriptor has its image at the same height; the descriptor takes its
          own height. From 900px: text on the left (button at the bottom), the
          image on the right, centred against it. */}
      <div
        data-card-content
        data-reveal="fade"
        className={`flex min-h-0 flex-1 flex-col px-6 pt-6 pb-7 max-tablet:px-7 max-tablet:pt-[22px] tablet:px-10 tablet:pt-8 tablet:pb-10 min-[900px]:grid min-[900px]:grid-rows-[auto_1fr_auto] min-[900px]:gap-x-16 min-[900px]:px-16 min-[900px]:pb-14 ${COLUMNS}`}
      >
        <div className="shrink-0 min-[900px]:col-start-1 min-[900px]:row-start-1">
          <h3
            id={titleId}
            className="font-display m-0 text-section-sm font-normal text-balance max-tablet:min-h-[2.1em] max-tablet:text-[28px] min-[1100px]:text-lead-title"
          >
            {project.title}
            <span className="sr-only max-tablet:hidden">{`, ${number}, `}{project.platform}, {project.sector}</span>
          </h3>
          <p className="mt-3 mb-0 max-w-[34ch] text-lead text-pretty text-muted max-tablet:mt-3.5 min-[900px]:mt-7">
            <FirstSentence text={project.descriptor} />
          </p>
        </div>

        <div
          data-card-frame
          className="stack-frame-slot mt-5 max-tablet:mt-6 min-[900px]:col-start-2 min-[900px]:row-span-3 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:self-center"
        >
          {project.image ? (
            <div className={FRAME}>
              <img
                src={project.image.src}
                width={project.image.width}
                height={project.image.height}
                alt={project.image.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top transition-[scale] duration-500 ease-design min-[900px]:group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <PlaceholderFrame label="[PRIMARY PROJECT VISUAL]" note="Mobile · 5:4 · awaiting designs" className={FRAME} />
          )}
        </div>

        <div className="mt-auto shrink-0 pt-5 max-tablet:mt-0 max-tablet:pt-7 min-[900px]:col-start-1 min-[900px]:row-start-3 min-[900px]:pt-12">
          <Link
            to={projectHref(project)}
            aria-label={`View case study: ${project.title}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-strong px-[26px] text-base font-medium text-white no-underline transition-colors duration-200 ease-design hover:bg-primary-strong-hover max-tablet:min-h-11 max-tablet:px-5 max-tablet:text-[15px]"
          >
            View case study <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Dims the card as the next one covers it (opacity only) */}
      <div data-card-dim aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0" />
    </section>
  )
}

// Scroll-driven stacking. The same rule runs for every card: as card i+1
// slides over card i, card i scales down and dims, and once more than
// --stack-depth cards are covered the oldest slide up and tuck away. One fit
// check decides for the whole deck whether it stacks or scrolls normally.
//
// Where the browser supports scroll-driven animations, CSS runs the effect on
// the compositor (index.css) and this hook only measures. Otherwise one
// requestAnimationFrame loop runs while the deck is on screen: it reads the
// scroll position once per frame, works everything else out from
// measurements cached on resize, eases toward the target, and writes only
// transform and opacity.
const SCROLL_DRIVEN = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')
// Share of the remaining distance the eased progress closes each frame.
const EASE = 0.15

function useCardStack(stackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return
    const cards = [...stack.children] as HTMLElement[]
    const dims = cards.map((card) => card.querySelector<HTMLElement>('[data-card-dim]')!)
    const contents = cards.map((card) => card.querySelector<HTMLElement>('[data-card-content]')!)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia(DESKTOP)
    const phone = window.matchMedia(PHONE)

    // Cached on resize; the loop never reads layout.
    let stickyTop: number[] = []
    let natural: number[] = []
    let height = 0
    let step = 0
    let depth = 2
    let stackEnd = 0
    let stacking = true
    let onScreen = false
    let frame = 0
    const eased = cards.map(() => 0)

    const measure = () => {
      const styles = getComputedStyle(stack)
      const top = parseFloat(styles.getPropertyValue('--stack-top'))
      step = parseFloat(styles.getPropertyValue('--stack-step'))
      depth = parseFloat(styles.getPropertyValue('--stack-depth'))
      stickyTop = cards.map((_, i) => top + Math.min(i, depth) * step)
      // Phones: every card takes the height of the tallest card's content, so
      // there is no empty space and the stack stays uniform (--card-fit-h).
      if (phone.matches) {
        stack.dataset.flow = 'measure'
        const tallest = Math.max(...cards.map((card) => card.offsetHeight))
        stack.style.setProperty('--card-fit-h', `${tallest}px`)
      } else {
        stack.style.removeProperty('--card-fit-h')
      }
      // Measure at the shared sticky height; if any card's content overflows
      // it, the screen is too short and the whole deck falls back together.
      // Below 900px the image gives way to the text instead, so it always stacks.
      stack.dataset.flow = 'sticky'
      stacking = !desktop.matches || contents.every((content) => content.scrollHeight <= content.clientHeight + 1)
      stack.dataset.flow = stacking ? 'sticky' : 'static'

      // Unstuck positions in page coordinates: every card before it is one
      // height plus one gap. Card transforms don't affect the stack's own box.
      height = cards[0].offsetHeight
      const gap = parseFloat(getComputedStyle(stack).rowGap)
      const stackTop = stack.getBoundingClientRect().top + window.scrollY
      natural = cards.map((_, i) => stackTop + i * (height + gap))
      stackEnd = stackTop + stack.clientHeight

      // Scroll-driven ranges: card k "arrives" from the moment its top meets
      // the bottom of card k-1 until it docks, given as offsets into its view
      // timeline's cover range, which starts when its top is at the bottom of
      // the screen.
      const viewport = window.innerHeight
      for (let k = 1; k < cards.length; k++) {
        stack.style.setProperty(`--arrive-${k}-start`, `${viewport - (stickyTop[k - 1] + height)}px`)
        stack.style.setProperty(`--arrive-${k}-end`, `${viewport - stickyTop[k]}px`)
      }
      start()
    }

    const render = () => {
      frame = 0
      const animate = stacking && !reduced.matches
      const y = window.scrollY
      // Where each card sits before any transform: stuck at its sticky top,
      // carried by the scroll, or pushed up by the end of the deck.
      const tops = natural.map((n, i) => Math.min(Math.max(stickyTop[i], n - y), stackEnd - y - height))
      let settling = false
      cards.forEach((_, i) => {
        let target = 0
        if (animate && i + 1 < cards.length) {
          const travel = height - (stickyTop[i + 1] - stickyTop[i])
          target = Math.min(1, Math.max(0, (stickyTop[i] + height - tops[i + 1]) / travel))
        }
        const next = eased[i] + (target - eased[i]) * EASE
        eased[i] = Math.abs(target - next) < 0.001 ? target : next
        if (eased[i] !== target) settling = true
      })
      // Only the newest `depth` covered cards keep a strip: from the card after
      // the depth onwards, each arrival slides every earlier card up one step.
      cards.forEach((card, i) => {
        let arrived = 0
        for (let j = Math.max(i + 1, depth + 1); j < cards.length; j++) arrived += eased[j - 1]
        const shift = Math.min(Math.min(i, depth), arrived) * step
        const scale = 1 - (1 - COVERED_SCALE) * eased[i]
        card.style.transform = shift || eased[i] ? `translateY(${-shift}px) scale(${scale})` : ''
        dims[i].style.opacity = String(COVERED_DIM * eased[i])
      })
      if (onScreen || settling) frame = requestAnimationFrame(render)
    }

    function start() {
      if (!SCROLL_DRIVEN && !frame) frame = requestAnimationFrame(render)
    }

    // Only while the deck is on screen: will-change on the cards, and the loop.
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      stack.classList.toggle('is-active', onScreen)
      if (onScreen) start()
    })
    visibility.observe(stack)

    // Keyboard: focusing a card that a later one covers brings it back to the top.
    const onFocus = (event: FocusEvent) => {
      if (!stacking) return
      const index = cards.findIndex((card) => card.contains(event.target as Node))
      const later = cards[index + 1]
      if (index < 0 || !later) return
      if (later.getBoundingClientRect().top >= stickyTop[index] + height) return
      window.scrollTo({ top: natural[index] - stickyTop[index] })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(stack)
    window.addEventListener('resize', measure)
    reduced.addEventListener('change', start)
    stack.addEventListener('focusin', onFocus)
    measure()
    document.fonts.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      observer.disconnect()
      window.removeEventListener('resize', measure)
      reduced.removeEventListener('change', start)
      stack.removeEventListener('focusin', onFocus)
    }
  }, [stackRef])
}

export default function SelectedWork() {
  const stackRef = useRef<HTMLDivElement>(null)
  useCardStack(stackRef)

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="bg-ground pt-(--section-space) font-ui text-body text-paper max-tablet:scroll-mt-8"
    >
      <div className="mx-auto max-w-wide px-gutter-sm tablet:px-gutter">
        <header className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-6">
          <div>
            <div data-reveal className={`${MONO} text-label text-muted`}>
              <span className="text-primary-soft">01</span> — Work
            </div>
            <h2 id="work-title" data-reveal className="font-display mt-3 mb-0 text-section-sm font-normal tablet:text-section max-tablet:text-[30px] max-tablet:leading-[1.1] max-tablet:font-semibold">
              Selected re-design work
            </h2>
          </div>
          {/* Hidden below 700px: it explains the heading */}
          <p
            data-reveal
            className="m-0 max-w-[28ch] text-pretty text-muted max-tablet:hidden tablet:text-right"
          >
            Each one starts as a problem statement. Here’s how I designed my way through it.
          </p>
        </header>

        <div ref={stackRef} data-flow="sticky" className="card-stack mt-14 max-tablet:mt-8">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
