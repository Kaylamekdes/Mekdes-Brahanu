import SiteFooter from './SiteFooter'

// "05 — Contact" from design-source/Main.dc.html and docs/04, as a cream band
// with dark text and a hard edge against the dark section above. Purple is
// --primary-strong here, including the focus ring, for contrast on cream. The
// heading is draft copy. External links open in a new tab.
const WHATSAPP_URL = 'https://wa.me/254716658786'
const EMAIL = 'mekkayla2@gmail.com'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' }

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-cream pt-(--section-space) pb-8 font-ui text-body text-cream-ink [&_:focus-visible]:outline-primary-strong"
    >
      <div className="mx-auto max-w-content px-gutter-sm tablet:px-gutter">
        <header>
          <div data-reveal className="font-mono text-label text-cream-muted uppercase">
            <span className="text-primary-strong">05</span> — Contact
          </div>
          <h2
            id="contact-title"
            data-reveal
            className="font-display mt-4 mb-0 max-w-[900px] text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance tablet:text-section tablet:font-normal wide:text-[72px] wide:leading-[1.02] wide:tracking-[-0.03em]"
          >
            Have a product that needs a clearer way through?
          </h2>
        </header>

        {/* The message button and a round email button, side by side; on phones
            the message button fills the rest of the row. Both 48px tall. */}
        <div data-reveal className="mt-10 flex items-center gap-3 tablet:mt-12">
          <a
            href={WHATSAPP_URL}
            {...EXTERNAL}
            aria-label="Send Mekdes a message on WhatsApp (opens in a new tab)"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary-strong px-7 text-[17px] font-medium text-white no-underline transition-[color,background-color,translate] duration-200 ease-design hover:-translate-y-0.5 hover:bg-primary-strong-hover max-tablet:flex-1"
          >
            Send me a message
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="Email Mekdes"
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-cream-line text-cream-ink transition-colors duration-200 ease-design hover:bg-primary-tint"
          >
            {/* A plain envelope: the outline and the flap */}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5.5" width="18" height="13" rx="2" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
          </a>
        </div>

        <SiteFooter tone="cream" className="mt-20 tablet:mt-32" />
      </div>
    </section>
  )
}
