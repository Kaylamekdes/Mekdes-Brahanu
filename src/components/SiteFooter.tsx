// The footer row shared by the home page's Contact band (cream: dark text, no
// rule above) and the case study pages (dark, with a rule). External links
// open in a new tab.
const BEHANCE_URL = 'https://www.behance.net/mekdes'
const LINKEDIN_URL = 'https://www.linkedin.com/in/mekdes-brahanu-157b60299'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' }

const TONES = {
  dark: { footer: 'border-t border-paper-line text-paper-muted', link: 'text-paper hover:text-primary-soft' },
  cream: { footer: 'text-cream-muted', link: 'text-cream-ink hover:text-primary-strong' },
}

export default function SiteFooter({ className = '', tone = 'dark' }: { className?: string; tone?: keyof typeof TONES }) {
  const link = `inline-flex min-h-11 items-center underline-offset-4 transition-colors duration-200 ease-design hover:underline ${TONES[tone].link}`
  return (
    <footer
      data-reveal
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-6 text-[15px] ${TONES[tone].footer} ${className}`}
    >
      <span>© 2026 Mekdes Brahanu</span>
      <span className="flex flex-wrap items-center gap-x-6">
        <a href={BEHANCE_URL} {...EXTERNAL} aria-label="Behance profile (opens in a new tab)" className={link}>
          Behance
        </a>
        <a href={LINKEDIN_URL} {...EXTERNAL} aria-label="LinkedIn profile (opens in a new tab)" className={link}>
          LinkedIn
        </a>
        <a href="#top" className={link}>
          Back to top ↑
        </a>
      </span>
    </footer>
  )
}
