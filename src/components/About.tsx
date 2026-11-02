import { useId, useState } from 'react'

// "03 — About" from design-source/Main.dc.html and docs/04. The lead and
// paragraph are draft copy; the experience rows, tools, courses and
// testimonials are final (quotes verbatim as supplied). The portrait is the
// supplied photo (public/about). Below 700px the paragraph and
// the Tools and Courses columns are hidden, and each quote is clamped to five
// lines with a Read more button.
const EXPERIENCE = [
  { role: 'Freelance product designer', dates: 'Nov 2024 — present' },
  { role: 'Afrihaul Youth Alliance', qualifier: '· part-time', dates: '2026' },
  { role: 'Lead Product Designer, Greenlink', dates: 'Feb — Aug 2024' },
]

const FACTS = [
  { key: 'Tools', value: 'Figma, Framer, Notion, GitHub, Canva' },
  { key: 'Courses', value: 'UX Fundamentals and Figma UI/UX Design, both on Udemy' },
]

const TESTIMONIALS = [
  {
    name: 'Caleb Siambi',
    role: 'Founder, Afrihaul Youth Alliance',
    quote:
      'I’ve worked closely with Kayla as Product & Design Lead at AfriHaul Youth Alliance, where she’s played a key role in shaping both strategy and execution. She thinks in systems, works with urgency and accountability, and consistently turns abstract ideas into clear, user-centered solutions. Reliable, proactive, and highly disciplined, she delivers impactful work beyond her role.',
  },
  {
    name: 'O’Maxwell Gad',
    role: 'Founder, i360',
    quote:
      'Working with Mekdes (Kayla) has been a pleasure. She turns complex ideas into clean, intuitive designs with strong attention to user experience. Thoughtful, collaborative and detail-oriented, she consistently delivers high-quality work.',
  },
]

const MONO = 'font-mono text-label uppercase'

// A testimonial card. Below 700px the quote is clamped to five lines (the full
// text stays in the page for screen readers) and a button expands it.
function Testimonial({ name, role, quote }: (typeof TESTIMONIALS)[number]) {
  const [open, setOpen] = useState(false)
  const quoteId = useId()
  return (
    <figure
      data-reveal
      className="m-0 flex flex-col rounded-frame bg-surface p-6 shadow-hairline tablet:p-9"
    >
      {/* Who said it first, then the quote. No avatar. */}
      <figcaption>
        <span className="font-medium">{name}</span>
        <br />
        <span className="text-[15px] text-muted">{role}</span>
      </figcaption>
      <blockquote
        id={quoteId}
        className={`m-0 mt-5 text-[18px] leading-[1.45] text-muted tablet:mt-6 tablet:text-[20px] ${open ? '' : 'max-tablet:line-clamp-5'}`}
      >
        {quote}
      </blockquote>
      {/* The button's own 44px target sits inside the bottom padding: pulled
          up by the space its text leaves below, so the padding looks the same
          as at the top. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={quoteId}
        onClick={() => setOpen((v) => !v)}
        className="mt-1 -mb-3 inline-flex min-h-11 cursor-pointer items-center self-start border-0 bg-transparent p-0 text-[15px] font-medium text-primary-soft underline underline-offset-4 tablet:hidden"
      >
        {open ? 'Read less' : 'Read more'}
      </button>
    </figure>
  )
}

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="bg-ground pb-(--section-space) font-ui text-body text-paper"
    >
      {/* No top padding: the Tools section's bottom padding is the space above */}
      <div className="mx-auto max-w-content px-gutter-sm tablet:px-gutter">
        <header>
          <h2 id="about-title" data-reveal className={`${MONO} m-0 font-normal text-muted`}>
            <span className="text-primary-soft">03</span> — About
          </h2>
        </header>

        {/* Stacks below 900px */}
        <div className="mt-6 grid grid-cols-1 items-start gap-10 tablet:gap-16 min-[900px]:grid-cols-2">
          {/* The photo is a little taller than the 4:5 frame: a quarter of the
              trim comes off the top, the rest off the bottom, so the face stays
              clear at every width. */}
          <div data-reveal="photo">
            <img
              src="/about/portfolio-profile.webp"
              width={1083}
              height={1452}
              alt="Mekdes Brahanu, product designer"
              loading="lazy"
              decoding="async"
              className="block aspect-[4/5] w-full max-w-[480px] rounded-frame bg-frame object-cover object-[50%_25%]"
            />
          </div>

          <div>
            <p data-reveal className="font-display m-0 text-[24px] leading-[1.25] tracking-[-0.015em] text-pretty tablet:text-[34px] tablet:leading-[1.2]">
              I’m a product designer in Kenya, working where UX/UI design meets product strategy.
            </p>
            {/* Hidden below 700px: it expands on the line above */}
            <p data-reveal className="mt-6 mb-0 max-w-[560px] text-lead text-pretty text-muted max-tablet:hidden">
              I’m drawn to the psychology behind what people do, to accessibility, and to the whole product
              lifecycle, from research to real-world impact. I’m open to product design roles and collaborations.
            </p>

            <ul className="m-0 mt-10 list-none border-t border-line p-0 tablet:mt-14">
              {EXPERIENCE.map((row) => (
                <li key={row.role} data-reveal className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-line py-[18px]">
                  <span className="font-medium">
                    {row.role}
                    {row.qualifier && <span className="font-normal text-muted"> {row.qualifier}</span>}
                  </span>
                  <span className={`${MONO} self-center text-muted`}>{row.dates}</span>
                </li>
              ))}
            </ul>

            {/* Hidden below 700px */}
            <dl data-reveal className="m-0 mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8 max-tablet:hidden">
              {FACTS.map((fact) => (
                <div key={fact.key}>
                  <dt className={`${MONO} text-muted`}>{fact.key}</dt>
                  <dd className="m-0 mt-2">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid grid-cols-1 items-start gap-6 tablet:mt-24 min-[900px]:grid-cols-2 wide:mt-32">
          {TESTIMONIALS.map((person) => (
            <Testimonial key={person.name} {...person} />
          ))}
        </div>
      </div>
    </section>
  )
}
