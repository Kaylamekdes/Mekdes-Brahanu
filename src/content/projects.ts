// The selected work, in the order the cards stack. Everything that depends on
// that order comes from here: the card numbers, the number on each case study
// page and its "Next project" link (the last loops back to the first). Titles
// and sectors come from design-source/Main.dc.html, docs/06 and the
// supplied meta rows.

export interface CardImage {
  src: string
  width: number
  height: number
  alt: string
}

export interface Project {
  slug: string
  title: string
  descriptor: string
  platform: string
  sector: string
  image?: CardImage
}

// The card tag and case study eyebrow: "Web · Healthtech"
export const projectKind = (project: Project) => `${project.platform} · ${project.sector}`

export const PROJECTS: Project[] = [
  {
    slug: 'luxecard',
    title: 'LuxeCard Africa',
    descriptor: 'Every sale needed someone free on WhatsApp. A self-serve store now takes the order and tracks referrals.',
    platform: 'Web',
    sector: 'E-commerce / B2B2C',
    image: {
      src: '/work/covers/cover-luxecard.webp',
      width: 1440,
      height: 910,
      alt: 'LuxeCard homepage: the headline Your business card, upgraded. on a black background beside a brushed gold NFC business card.',
    },
  },
  {
    slug: 'src',
    title: 'SRC Tech Impact Platform',
    descriptor:
      'Enterprises don’t know which specialist can help them. A searchable directory tells them.',
    platform: 'Web',
    sector: 'Business services',
    image: {
      src: '/work/covers/cover-src.webp',
      width: 1440,
      height: 910,
      alt: 'SRC Tech Impact Platform homepage: the serif headline Empowering Arid Land Enterprises & Agricultural Value Chains Across Kenya beside a photograph of milk being poured into a steel tank.',
    },
  },
  {
    slug: 'nilson',
    title: 'Nilson Digital Pharmacy',
    descriptor:
      'A prescription shouldn’t need a trip to the branch. Upload it and get a private quote by WhatsApp or SMS.',
    platform: 'Web',
    sector: 'Healthtech',
    image: {
      src: '/work/covers/cover-nilson.webp',
      width: 1440,
      height: 910,
      alt: 'Nilson Digital Pharmacy homepage: the headline Your Health, Delivered with Precision Across Kenya beside a prescription upload card offering a quote by WhatsApp or SMS.',
    },
  },
  {
    slug: 'savannah',
    title: 'Savannah Informatics',
    descriptor:
      'Clinics, insurers, patients and developers need different things from one homepage. Now each gets its own way in.',
    platform: 'Web',
    sector: 'Healthtech',
    image: {
      src: '/work/covers/cover-savannah.webp',
      width: 1440,
      height: 910,
      alt: 'Savannah Informatics homepage: a deep purple hero with the headline Run your facility and get paid faster, on one platform, beside a photograph of a smiling nurse in green scrubs.',
    },
  },
  {
    slug: 'mila-kids',
    title: 'Mila Kids',
    descriptor: 'Children are losing touch with their Kenyan mother tongues. Mila Kids makes relearning them play.',
    platform: 'Mobile',
    sector: 'Ed-tech',
    image: {
      src: '/work/covers/cover-mila-kids.webp',
      width: 1440,
      height: 910,
      alt: 'Mila Kids app screens: an onboarding screen with an illustrated map of Kenya and the line A fun way to learn your native language, beside home screens with rewards, stories, games, songs and a Greetings & Manners lesson.',
    },
  },
]

export const projectHref = (project: Project) => `/work/${project.slug}`

// "01" for the first card, and so on
export const projectNumber = (index: number) => String(index + 1).padStart(2, '0')

// A project's number and the one after it, for its case study page
export function projectPlace(slug: string) {
  const index = PROJECTS.findIndex((project) => project.slug === slug)
  if (index < 0) return undefined
  return {
    project: PROJECTS[index],
    number: projectNumber(index),
    next: PROJECTS[(index + 1) % PROJECTS.length],
  }
}

// Parked: taken off the site (no card, route or link) and kept here so
// nothing is lost. Not rendered anywhere.
export const PARKED_PROJECTS: Project[] = [
  {
    slug: 'greenlink',
    title: 'Greenlink',
    descriptor: 'Lead product design for a sustainability-focused mobile app.',
    platform: 'Mobile',
    sector: 'Agri-tech',
  },
]
