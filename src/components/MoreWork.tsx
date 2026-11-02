import { MORE_WORK } from '../content/moreWork'

// "04 — More work" from design-source/Main.dc.html and docs/04. The heading
// is draft copy. Non-link articles: these projects have no pages. Each shows
// its image and niche line only (content/moreWork.ts). Below 700px the
// "2 projects" count is hidden.
const MONO = 'font-mono text-label uppercase text-muted'

export default function MoreWork() {
  return (
    <section
      id="more"
      aria-labelledby="more-title"
      className="bg-ground pb-(--section-space) font-ui text-body text-paper"
    >
      {/* No top padding: the About section's bottom padding is the space above */}
      <div className="mx-auto max-w-content px-gutter-sm tablet:px-gutter">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <div>
            <div data-reveal className={MONO}>
              <span className="text-primary-soft">04</span> — More work
            </div>
            <h2
              id="more-title"
              data-reveal
              className="font-display mt-3 mb-0 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] tablet:text-[44px] tablet:leading-[1.05] tablet:font-normal"
            >
              Smaller explorations.
            </h2>
          </div>
          {/* Hidden below 700px */}
          <div data-reveal className={`${MONO} max-tablet:hidden`}>
            {MORE_WORK.length} projects
          </div>
        </header>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] gap-12 tablet:mt-12">
          {MORE_WORK.map((project) => (
            <article key={project.image.src} data-reveal className="group">
              <div className="aspect-[3/2] overflow-hidden rounded-frame bg-frame shadow-hairline">
                <img
                  src={project.image.src}
                  width={project.image.width}
                  height={project.image.height}
                  alt={project.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full object-cover object-top transition-[scale] duration-500 ease-design min-[900px]:group-hover:scale-[1.03]"
                />
              </div>
              {/* The niche line is the article's heading: there is no title */}
              <h3 className={`${MONO} mt-5 mb-0 font-normal`}>{project.niche}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
