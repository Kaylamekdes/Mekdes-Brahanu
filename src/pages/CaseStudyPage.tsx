import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import useDocumentMeta from '../components/useDocumentMeta'
import useReveal from '../components/useReveal'
import {
  ROLE,
  SKETCH_CAPTION,
  caseStudy,
  isSketch,
  type CaseStudy,
  type Visual,
} from '../content/caseStudies'
import { projectHref, projectKind, projectPlace, type Project } from '../content/projects'

// One case study page (/work/:slug), from the project layouts in
// design-source (Project-*.dc.html) in the site's dark theme: a header with
// the hero image, the problem, three decisions, the solution, then trade-offs
// and measures (or questions to explore), then the next project. The page text comes from
// content/caseStudies.ts; the title, kind line, number and next project from
// content/projects.ts.

// A case study with its place in the work order
type Page = { study: CaseStudy; project: Project; number: string; next: Project }

const WRAP = 'mx-auto max-w-content px-gutter-sm tablet:px-gutter'
const WIDE = 'mx-auto max-w-wide px-gutter-sm tablet:px-gutter'
// Each section opens with the site's spacing token; phones get a shorter one.
const SECTION = 'pt-16 tablet:pt-(--section-space)'
const H2 =
  'font-display m-0 text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance tablet:text-[40px] tablet:font-normal'
const MONO = 'font-mono uppercase'
// A real screen sits in a clipping frame, so its reveal can settle the image
// inside from a slight overscale (index.css)
const SHOT_FRAME = 'overflow-hidden rounded-frame bg-frame shadow-hairline'

// An arrow pointing up and right, for links that open the live product
function ExternalArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  )
}

// The live product, opening in a new tab
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' }

// A real screen, or a sketch shown whole inside a frame at the given ratio and
// captioned as a sketch. There is no empty frame: without an image it renders
// nothing, so a placeholder can't appear on the page.
function Screen({ shot, eager = false, aspect = 'aspect-[16/10]' }: { shot?: Visual; eager?: boolean; aspect?: string }) {
  if (!shot) return null
  if (isSketch(shot)) {
    return (
      <figure className="m-0">
        <div className={`${aspect} overflow-hidden rounded-frame bg-frame shadow-hairline`}>
          <img
            src={shot.sketch}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-contain"
          />
        </div>
        <figcaption className={`${MONO} mt-3 text-label-sm text-muted`}>{SKETCH_CAPTION}</figcaption>
      </figure>
    )
  }
  return (
    <div className={SHOT_FRAME}>
      <img
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  )
}

// A slim line across the top of the screen showing how far down the page you
// are. Transform only; hidden with reduced motion.
function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      barRef.current!.style.transform = `scaleX(${progress})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 origin-left scale-x-0 bg-primary will-change-transform motion-reduce:hidden"
    />
  )
}

function Header({ study, project, number }: Page) {
  const meta: [string, string][] = [
    ['Role', ROLE],
    ['Sector', project.sector],
    ['Platform', project.platform],
    ['Timeline', study.timeline],
    ['Tools', study.tools],
    ...(study.moreMeta ?? []),
  ]
  return (
    <section aria-labelledby="case-title" className="pt-[136px] tablet:pt-[152px]">
      <div className={WRAP}>
        <Link
          to="/#work"
          data-reveal
          className="inline-flex min-h-11 items-center text-[15px] font-medium text-paper no-underline transition-colors duration-200 ease-design hover:text-primary-soft"
        >
          <span aria-hidden="true">←&nbsp;</span>All work
        </Link>
        <div data-reveal className={`${MONO} mt-8 text-label text-muted tablet:mt-12`}>
          <span className="text-primary-soft">{number}</span> — {projectKind(project)}
        </div>
        <h1
          id="case-title"
          data-reveal
          className="font-display mt-4 mb-0 max-w-[1000px] text-[44px] leading-[1.02] font-normal tracking-[-0.03em] text-balance tablet:mt-5 tablet:text-[72px] wide:text-[96px] wide:leading-[0.98] wide:tracking-[-0.035em]"
        >
          {project.title}
        </h1>
        <div data-reveal className="mt-6 tablet:mt-8">
          <p className="m-0 max-w-[640px] text-[20px] leading-[1.4] text-pretty text-muted tablet:text-[24px]">
            {study.lead.text}
          </p>
        </div>
        {/* The title, lead and each meta row come in one after another */}
        <dl className="m-0 mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-6 tablet:mt-14 tablet:grid-cols-3 wide:grid-cols-5">
          {meta.map(([key, value]) => (
            <div key={key} data-reveal>
              <dt className={`${MONO} text-label-sm text-muted`}>{key}</dt>
              <dd className="m-0 mt-1.5 text-pretty">{value}</dd>
            </div>
          ))}
        </dl>
        {study.live && (
          <div data-reveal className="mt-8">
            <a
              href={study.live.url}
              {...NEW_TAB}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-line px-5 text-[15px] font-medium text-primary-soft no-underline transition-colors duration-200 ease-design hover:bg-primary-tint"
            >
              {study.live.label}
              <ExternalArrow />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>
      {/* Its own reveal group, so the hero starts with the title rather than
          after every meta row */}
      <div data-reveal-group className={`${WIDE} mt-12 tablet:mt-20`}>
        <div data-reveal="hero">
          <Screen shot={study.hero} eager />
        </div>
      </div>
    </section>
  )
}

// A small mono heading
function Label({ text, as: Tag = 'h3' }: { text: string; as?: 'h3' | 'div' }) {
  return <Tag className={`${MONO} m-0 text-label font-normal text-muted`}>{text}</Tag>
}

// One bordered line per item
function Items({ items }: { items: string[] }) {
  return (
    <ul className="m-0 mt-5 list-none p-0">
      {items.map((item) => (
        <li key={item} className="border-t border-line py-4 text-pretty last:pb-0">
          {item}
        </li>
      ))}
    </ul>
  )
}

function Problem({ study }: { study: CaseStudy }) {
  const { problemPoints: points, evidence } = study
  return (
    <section aria-labelledby="problem-title" className={SECTION}>
      <div className={`${WRAP} grid gap-5 min-[900px]:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] min-[900px]:gap-12`}>
        <h2 id="problem-title" data-reveal className={H2}>
          The problem
        </h2>
        <div className="grid gap-10 tablet:gap-12">
          <div data-reveal>
            <p className="m-0 max-w-[34em] text-[20px] leading-[1.5] text-pretty tablet:text-[24px] tablet:leading-[1.45]">
              {study.problem.text}
            </p>
          </div>
          {points && (
            <div data-reveal className="max-w-[46em]">
              <Label text={points.label} />
              <Items items={points.items} />
            </div>
          )}
          {evidence && (
            <div data-reveal className="max-w-[46em]">
              <Label text={evidence.label} />
              <p className="m-0 mt-4 text-pretty tablet:text-[18px] tablet:leading-[1.5]">{evidence.text}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Image and text side by side from 900px, the image alternating left and
// right; stacked below that, image first. Without an image the text runs the
// full width.
function Row({ index, image, children }: { index: number; image?: Visual; children: React.ReactNode }) {
  if (!image) {
    return (
      <div data-reveal-group>
        <div data-reveal>{children}</div>
      </div>
    )
  }
  const flip = index % 2 === 1
  const phone = isSketch(image) && image.shape === 'phone'
  return (
    <div
      data-reveal-group
      className={`grid items-center gap-6 min-[900px]:gap-16 ${flip ? 'min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'}`}
    >
      <div
        data-reveal="frame"
        className={`${flip ? 'min-[900px]:order-2' : ''} ${phone ? 'mx-auto w-full max-w-[240px] tablet:max-w-[280px]' : ''}`}
      >
        <Screen shot={image} aspect={phone ? 'aspect-[1/2]' : undefined} />
      </div>
      <div data-reveal>{children}</div>
    </div>
  )
}

function Decisions({ study }: { study: CaseStudy }) {
  const note = study.decisionsNote
  return (
    <section aria-labelledby="decisions-title" className={SECTION}>
      <div className={WRAP}>
        <h2 id="decisions-title" data-reveal className={H2}>
          Decisions
        </h2>
        <ol className="m-0 mt-10 grid list-none gap-16 p-0 tablet:mt-16 tablet:gap-20 wide:gap-24">
          {study.decisions.map((row, i) => (
            <li key={i}>
              <Row index={i} image={row.image}>
                <Label as="div" text={`Decision ${String(i + 1).padStart(2, '0')}`} />
                <h3 className="font-display m-0 mt-3 text-[26px] leading-[1.15] font-normal tracking-[-0.015em] text-balance tablet:text-[32px]">
                  {row.title}
                </h3>
                <p className="m-0 mt-4 text-pretty tablet:text-[18px] tablet:leading-[1.5]">{row.decision}</p>
                <dl className="m-0 mt-5 border-t border-line pt-4">
                  <dt className={`${MONO} text-label-sm text-muted`}>Why</dt>
                  <dd className="m-0 mt-1.5 text-pretty tablet:text-[18px] tablet:leading-[1.5]">{row.why}</dd>
                </dl>
              </Row>
            </li>
          ))}
        </ol>
        {note && (
          <div className="mt-16 tablet:mt-20 wide:mt-24">
            <Row index={study.decisions.length} image={note.image}>
              <p className="m-0 text-pretty tablet:text-[18px] tablet:leading-[1.5]">{note.text}</p>
            </Row>
          </div>
        )}
      </div>
    </section>
  )
}

function Solution({ study }: { study: CaseStudy }) {
  const { solutionIntro: intro, flow, screens, launch } = study
  return (
    <section aria-labelledby="solution-title" className={SECTION}>
      <div className={WRAP}>
        <h2 id="solution-title" data-reveal className={H2}>
          The solution
        </h2>
        {intro && (
          <div data-reveal className="mt-8 tablet:mt-10">
            <p className="m-0 max-w-[40em] text-[18px] leading-[1.5] text-pretty tablet:text-[20px]">{intro.text}</p>
          </div>
        )}
        <div data-reveal className="mt-10 tablet:mt-14">
          <Label text="Flow" />
          <p className="font-display m-0 mt-4 max-w-[30em] text-[22px] leading-[1.3] text-balance tablet:text-[28px]">
            {flow.text}
          </p>
        </div>
        {flow.frame && (
          <div data-reveal="frame" className="mt-8 tablet:mt-10">
            <Screen shot={flow.frame} aspect="aspect-[4/3] tablet:aspect-[21/8]" />
          </div>
        )}
        {screens.length > 0 && (
          <div className={`mt-6 grid items-start gap-6 ${screens.length > 1 ? 'min-[900px]:grid-cols-2' : 'min-[900px]:w-2/3'}`}>
            {screens.map((shot, i) => (
              <div key={i} data-reveal="frame">
                <Screen shot={shot} />
              </div>
            ))}
          </div>
        )}
        {launch && (
          <p data-reveal className="mt-10 mb-0 text-pretty tablet:mt-14 tablet:text-[18px]">
            {launch.text}
          </p>
        )}
      </div>
    </section>
  )
}

// Things to measure or explore, never results.
function Closing({ study }: { study: CaseStudy }) {
  const { title, lists, note } = study.closing
  return (
    <section aria-labelledby="closing-title" className={SECTION}>
      <div className={WRAP}>
        <h2 id="closing-title" data-reveal className={`${H2} max-w-[16ch]`}>
          {title}
        </h2>
        <div
          className={`mt-10 grid gap-12 tablet:mt-16 min-[900px]:gap-16 ${lists.length > 1 ? 'min-[900px]:grid-cols-2' : 'max-w-[46em]'}`}
        >
          {lists.map((list) => (
            <div key={list.label} data-reveal>
              <Label text={list.label} />
              <Items items={list.items} />
            </div>
          ))}
        </div>
        {note && (
          <p data-reveal className="mt-10 mb-0 max-w-[46em] text-pretty text-muted tablet:mt-12 tablet:text-[18px] tablet:leading-[1.5]">
            {note.text}
          </p>
        )}
        {study.live && (
          <p data-reveal className="mt-10 mb-0 tablet:mt-12">
            <a
              href={study.live.url}
              {...NEW_TAB}
              className="inline-flex min-h-11 items-center gap-1.5 text-paper-muted underline decoration-paper-line underline-offset-4 transition-colors duration-200 ease-design hover:text-primary-soft hover:decoration-primary-soft"
            >
              {study.live.closingLabel}
              <ExternalArrow />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
      </div>
    </section>
  )
}

function NextProject({ next }: { next: Project }) {
  return (
    <section
      aria-label="Next project"
      className="mt-16 border-t border-line bg-band pt-16 pb-8 tablet:mt-(--section-space) tablet:pt-24"
    >
      <div className={WRAP}>
        <div data-reveal className={`${MONO} text-label text-paper-muted`}>
          Next project
        </div>
        <Link
          to={projectHref(next)}
          data-reveal
          className="group mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 text-paper no-underline"
        >
          <span className="font-display text-[40px] leading-none tracking-[-0.03em] text-balance transition-colors duration-200 ease-design group-hover:text-primary-soft tablet:text-[72px]">
            {next.title}
          </span>
          <span className="text-[18px] font-medium tablet:text-[20px]">
            View case study{' '}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-400 ease-design group-hover:translate-x-1.5 motion-reduce:transition-none"
            >
              →
            </span>
          </span>
        </Link>
        <Link
          to="/#work"
          data-reveal
          className="mt-10 inline-flex min-h-11 items-center font-medium text-paper no-underline transition-colors duration-200 ease-design hover:text-primary-soft tablet:mt-14"
        >
          <span aria-hidden="true">←&nbsp;</span>All work
        </Link>
        <SiteFooter className="mt-16 tablet:mt-24" />
      </div>
    </section>
  )
}

function CaseStudyContent(page: Page) {
  const { study, project, next } = page
  useDocumentMeta(`${project.title} — Mekdes Brahanu`, study.lead.text)
  useReveal()

  return (
    <>
      <ReadingProgress />
      <SiteNav />
      <main id="top" className="bg-ground font-ui text-body text-paper">
        <Header {...page} />
        <Problem study={study} />
        <Decisions study={study} />
        <Solution study={study} />
        <Closing study={study} />
        <NextProject next={next} />
      </main>
    </>
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const study = caseStudy(slug)
  const place = study && projectPlace(study.slug)
  // Pages not built yet go back to the work section.
  if (!study || !place) return <Navigate to="/#work" replace />
  // Keyed by slug, so moving to the next project starts the page afresh.
  return <CaseStudyContent key={study.slug} study={study} {...place} />
}
