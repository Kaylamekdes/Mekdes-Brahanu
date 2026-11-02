// "02 — Approach" from design-source/Main.dc.html and docs/04 (all draft copy
// there; the heading is new draft copy). Below 700px only the label, heading and principle titles show.
// The principles sit quieter than the heading (72% white) with no rules between
// them: 28px apart on phones, 36px from 701px, in one column and then a 2×2 grid
// from 900px. The section's own padding is the space below the last one.
const PRINCIPLES = [
  {
    title: 'Start with behaviour.',
    body: 'What people do, and why, comes before what the screen should look like.',
  },
  {
    title: 'Name the friction.',
    body: 'The problem gets written down in one sentence before any layout begins.',
  },
  {
    title: 'Clear before clever.',
    body: 'Hierarchy, language and flow that remove steps instead of adding features.',
  },
  {
    title: 'Accessible by default.',
    body: 'Contrast, touch targets and plain language belong in the first draft, not the final pass.',
  },
]

// A band: a slightly lifted near-black surface with a hairline above it.
export default function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="border-t border-line bg-band py-(--section-space) font-ui text-body text-paper"
    >
      <div className="mx-auto max-w-content px-gutter-sm tablet:px-gutter">
        <header>
          <div data-reveal className="font-mono text-label text-paper-muted uppercase">
            <span className="text-primary-soft">02</span> — Approach
          </div>
          <h2
            id="approach-title"
            data-reveal
            className="font-display mt-4 mb-0 max-w-[880px] text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance tablet:mt-5 tablet:text-[64px] tablet:leading-[1.04] tablet:font-normal"
          >
            {/* Draft copy awaiting approval */}
            Problems before pixels.
          </h2>
        </header>

        <ul
          className="m-0 mt-17 grid list-none grid-cols-1 gap-x-16 gap-y-7 p-0 tablet:mt-23 tablet:gap-y-9 min-[900px]:grid-cols-2"
        >
          {PRINCIPLES.map((principle) => (
            <li key={principle.title} data-reveal>
              <h3 className="font-display m-0 text-[28px] leading-[1.15] font-normal tracking-[-0.01em] text-white/72">
                {principle.title}
              </h3>
              {/* Hidden below 700px: it explains the title */}
              <p className="mt-3 mb-0 max-w-[440px] text-pretty text-paper-muted max-tablet:hidden">{principle.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
