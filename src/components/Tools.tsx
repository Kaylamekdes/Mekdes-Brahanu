import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { siClaude, siFigma, siGithub, siJira, siNotion } from 'simple-icons'
import openaiSvg from '@lobehub/icons-static-svg/icons/openai.svg?raw'
import mobbinMark from '../assets/mobbin-mark.png'

// Brand marks come from simple-icons (CC0) and, for ChatGPT, the OpenAI mark
// from @lobehub/icons-static-svg (MIT), which simple-icons no longer carries.
// Neither package has Mobbin; its mark is the supplied PNG, used as a mask so
// it takes the same colour as the other marks. Every mark is the muted
// --tool-purple at rest and lifts to --primary-soft on hover or focus. The subtitle is draft copy.
const OPENAI = openaiSvg.match(/ d="([^"]+)"/)![1]

interface Tool {
  name: string
  path?: string
  evenOdd?: boolean
  // A one-colour image mark, drawn in the current mark colour
  mask?: { src: string; ratio: number }
}

const TOOLS: Record<string, Tool> = {
  Claude: { name: 'Claude', path: siClaude.path },
  Figma: { name: 'Figma', path: siFigma.path },
  ChatGPT: { name: 'ChatGPT', path: OPENAI, evenOdd: true },
  GitHub: { name: 'GitHub', path: siGithub.path },
  Jira: { name: 'Jira', path: siJira.path },
  Notion: { name: 'Notion', path: siNotion.path },
  Mobbin: { name: 'Mobbin', mask: { src: mobbinMark, ratio: 342 / 162 } },
}
const NAMES = ['Claude', 'Figma', 'ChatGPT', 'GitHub', 'Jira', 'Notion', 'Mobbin']

// Muted until hovered or focused, when the logo turns the primary colour.
const MARK = 'h-7 transition-[fill,color,border-color,background-color] duration-200 ease-design motion-reduce:transition-none tablet:h-9'

// Each mark's view box is cropped to its own outline, so every logo renders at
// the same height regardless of the padding in its source artwork. Measured
// once per tool, from whichever copy is on screen.
const viewBoxes = new Map<string, string>()

function Mark({ tool }: { tool: Tool }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [viewBox, setViewBox] = useState(() => viewBoxes.get(tool.name) ?? '0 0 24 24')

  useLayoutEffect(() => {
    const box = pathRef.current!.getBBox()
    if (box.width > 0) viewBoxes.set(tool.name, `${box.x} ${box.y} ${box.width} ${box.height}`)
    const known = viewBoxes.get(tool.name)
    if (known) setViewBox(known)
  }, [tool.name])

  return (
    <svg role="img" aria-label={tool.name} viewBox={viewBox} className={`${MARK} w-auto max-w-16 fill-current text-tool-purple group-hover:text-primary-soft group-focus-visible:text-primary-soft`}>
      <path ref={pathRef} d={tool.path} fillRule={tool.evenOdd ? 'evenodd' : undefined} />
    </svg>
  )
}

// An image mark: its shape masks a block of the mark colour, so it matches the
// SVG marks at rest and on hover. Mobbin's mark is a solid, wide shape, so it
// is capped narrower than the outline marks to carry the same visual weight;
// its box keeps their height, so the names below stay level.
function MaskMark({ tool }: { tool: Tool }) {
  const { src, ratio } = tool.mask!
  return (
    <span
      role="img"
      aria-label={tool.name}
      className={`${MARK} block max-w-10 bg-tool-purple group-hover:bg-primary-soft group-focus-visible:bg-primary-soft tablet:max-w-[50px]`}
      style={{
        aspectRatio: ratio,
        mask: `url(${src}) center / contain no-repeat`,
        WebkitMask: `url(${src}) center / contain no-repeat`,
      }}
    />
  )
}

function Placeholder({ name }: { name: string }) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`${MARK} flex w-24 items-center justify-center rounded-md border border-dashed border-paper/40 font-mono text-[10px] tracking-[0.04em] text-paper uppercase group-hover:border-primary-soft group-hover:text-primary-soft`}
    >
      [{name}]
    </div>
  )
}

// No container: the logo mark with its name beneath, nothing behind them.
const TILE = 'group flex shrink-0 flex-col items-center justify-center gap-3 px-2 py-3 tablet:gap-4'

function TileBody({ tool }: { tool: Tool }) {
  return (
    <>
      {tool.path ? <Mark tool={tool} /> : tool.mask ? <MaskMark tool={tool} /> : <Placeholder name={tool.name} />}
      <span aria-hidden="true" className="text-[12px] leading-none text-muted tablet:text-[13px]">
        {tool.name}
      </span>
    </>
  )
}

// The marquee row: the seven tools, then the same set again, sliding by -50%
// so the loop is seamless. A set is at least as wide as the screen (slot
// widths in index.css), so a logo's copy only arrives as the logo leaves. The
// first copy holds the real, focusable list items; the second is hidden from
// assistive tech and not focusable. Two edge layers blur and fade logos as
// they leave and arrive.
function Row({ names }: { names: string[] }) {
  return (
    <div role="none" className="marquee-row">
      <div role="none" className="marquee-track">
        {[0, 1].map((copy) =>
          names.map((name) => {
            const real = copy === 0
            return (
              <div key={`${copy}-${name}`} role="none" className="marquee-slot">
                <div
                  role={real ? 'listitem' : undefined}
                  aria-hidden={real ? undefined : true}
                  tabIndex={real ? 0 : undefined}
                  className={TILE}
                >
                  <TileBody tool={TOOLS[name]} />
                </div>
              </div>
            )
          }),
        )}
      </div>
      <div aria-hidden="true" className="marquee-edge marquee-edge-left" />
      <div aria-hidden="true" className="marquee-edge marquee-edge-right" />
    </div>
  )
}

export default function Tools() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Keyboard focus pauses the rows (CSS) and first moves the focused row the
  // least distance that puts the focused tile fully on screen. The real tiles
  // are the first copy, so any offset the loop can reach (0 to -50%) keeps
  // them where they are measured.
  useEffect(() => {
    const marquee = marqueeRef.current
    if (!marquee) return
    const onFocus = (event: FocusEvent) => {
      const tile = event.target as HTMLElement
      const track = tile.closest<HTMLElement>('.marquee-track')
      const animation = track?.getAnimations()[0]
      if (!track || !animation) return
      const row = track.parentElement!.getBoundingClientRect()
      const box = tile.getBoundingClientRect()
      const half = track.scrollWidth / 2
      const margin = 16
      const offset = new DOMMatrix(getComputedStyle(track).transform).m41
      const start = box.left - row.left - offset // tile position within the track
      // Offsets that keep the tile inside the row (its left edge sets the
      // lowest, its right edge the highest), within what the loop reaches
      const lowest = Math.max(-half, margin - start)
      const highest = Math.min(0, row.width - margin - box.width - start)
      const target = Math.min(Math.max(offset, lowest), highest)
      const duration = Number(animation.effect!.getTiming().duration)
      // The row runs from 0 to -half over the loop.
      const progress = -target / half
      animation.currentTime = Math.min(Math.max(progress, 0), 1) * duration
    }
    marquee.addEventListener('focusin', onFocus)
    return () => marquee.removeEventListener('focusin', onFocus)
  }, [])

  return (
    <section
      id="tools"
      aria-labelledby="tools-title"
      className="overflow-x-clip py-(--section-space) font-ui text-body text-paper"
    >
      <div className="mx-auto max-w-content px-gutter-sm tablet:px-gutter">
        <header
          className="flex flex-col gap-3 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-6"
        >
          <h2
            id="tools-title"
            data-reveal
            className="font-display m-0 text-section-sm font-normal text-balance max-tablet:text-[30px] max-tablet:leading-[1.1] max-tablet:font-semibold tablet:text-section"
          >
            Tools and collaboration
          </h2>
          {/* Draft copy */}
          <p data-reveal className="m-0 max-w-[28ch] text-pretty text-muted tablet:text-right">
            From first question to final handoff.
          </p>
        </header>
      </div>

      {/* One full-width row on the page background, no lines: the real list of
          the seven tools inside it */}
      <div
        ref={marqueeRef}
        role="list"
        aria-labelledby="tools-title"
        className="tools-marquee mt-10 motion-reduce:hidden tablet:mt-14"
      >
        <div role="none" data-reveal className="py-4 tablet:py-6">
          <Row names={NAMES} />
        </div>
      </div>

      {/* Reduced motion: the seven logos as a still, wrapped grid instead */}
      <div className="mx-auto hidden max-w-content px-gutter-sm motion-reduce:block tablet:px-gutter">
        <ul
          aria-labelledby="tools-title"
          className="m-0 mt-10 flex list-none flex-wrap justify-center gap-y-6 p-0 py-4 tablet:mt-14 tablet:py-6"
        >
          {NAMES.map((name) => (
            <li
              key={name}
              tabIndex={0}
              className={`${TILE} w-1/3 tablet:w-1/4 wide:w-1/7`}
            >
              <TileBody tool={TOOLS[name]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
