// Every word on the case study pages. Text describes what the design shows
// and why, as intent: no research, quotes, statistics or results beyond what
// was supplied. The title, number, platform and sector come from
// content/projects.ts. Sketches (public/work/sketches) are shown as
// illustrations, always captioned as such, never as screenshots.

export interface TextBlock {
  text: string
}

export interface ListBlock {
  items: string[]
}

// A block with its own small label, such as "What made it hard"
export interface Labelled {
  label: string
}

export interface Shot {
  src: string
  width: number
  height: number
  alt: string
}

// An illustrative sketch in a frame, shown whole (contained), with a caption.
// 'phone' sketches are portrait (1:2), for mobile screens.
export interface Sketch {
  sketch: string
  width: number
  height: number
  alt: string
  shape?: 'phone'
}

// Every frame has a real image: there are no empty placeholder frames. A
// block without an image simply has no frame.
export type Visual = Shot | Sketch

export const isSketch = (visual: Visual): visual is Sketch => 'sketch' in visual

export const SKETCH_CAPTION = 'Illustrative sketch'

export interface Decision {
  title: string
  decision: string
  why: string
  // Without one, the decision's text runs the full width
  image?: Visual
}

export interface CaseStudy {
  slug: string
  lead: TextBlock
  // Shown after Role, Sector and Platform
  timeline: string
  tools: string
  moreMeta?: [label: string, value: string][]
  hero: Shot
  problem: TextBlock
  problemPoints?: Labelled & ListBlock
  evidence?: Labelled & TextBlock
  decisions: Decision[]
  // One line after the decisions, with its own screen
  decisionsNote?: TextBlock & { image: Visual }
  solutionIntro?: TextBlock
  flow: TextBlock & { frame?: Sketch }
  screens: Visual[]
  // A status line under the solution
  launch?: TextBlock
  // The live product: a pill in the header's meta area and a quieter text
  // link at the end of the closing section, both opening in a new tab
  live?: { url: string; label: string; closingLabel: string }
  closing: {
    title: string
    lists: (Labelled & ListBlock)[]
    note?: TextBlock
  }
}

// The same on every project
export const ROLE = 'Lead product designer'

const CS = '/work/case-studies'
const SK = '/work/sketches'
// Every sketch is 1600 × 1000, or 780 × 1560 for phone screens
const sketch = (name: string, alt: string): Sketch => ({ sketch: `${SK}/${name}.webp`, width: 1600, height: 1000, alt })
const phoneSketch = (name: string, alt: string): Sketch => ({
  sketch: `${SK}/${name}.webp`,
  width: 780,
  height: 1560,
  alt,
  shape: 'phone',
})
const HERO = '/work/heroes'
// Hero visuals are 2496 wide (2x the widest hero), each at its own ratio
const hero = (slug: string, height: number, alt: string): Shot => ({ src: `${HERO}/hero-${slug}.webp`, width: 2496, height, alt })
const TRADE_OFFS = 'Trade-offs and what I’d measure next'

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'luxecard',
    lead: {
      text: 'LuxeCard sold premium NFC cards almost entirely over WhatsApp, so every sale needed a salesperson, and no one could see which marketing worked.',
    },
    timeline: '4 weeks',
    tools: 'Claude, GitHub, Vercel, Supabase, Figma',
    // From luxecard-case-study.md
    moreMeta: [
      ['Client', 'LuxeCard Africa (LuxeCard Limited), Nairobi, Kenya'],
      ['Scope', 'Marketing site, order and cart flow, affiliate program page, growth and content strategy'],
      ['Stack', 'React, TypeScript, Vite, Tailwind CSS, Supabase (Postgres), Paystack, Vercel'],
      ['Status', 'Launched late September 2026'],
    ],
    hero: hero(
      'luxecard',
      1122,
      'LuxeCard homepage: the headline Your business card, upgraded. on a black background beside a brushed gold Samson & Associates NFC business card',
    ),
    problem: {
      text: 'LuxeCard sold premium NFC business cards almost entirely through WhatsApp conversations, so every sale depended on a salesperson being available, and the business had no reliable way to see which marketing brought in customers.',
    },
    problemPoints: {
      label: 'What made it hard',
      items: [
        'The site undersold the product. Metal and wood cards were being judged on a page that looked generic.',
        'Two different buyers. An individual wants one card quickly. A company wants a batch for a team, often with a quotation and a tax invoice.',
        'Unanswered questions became support messages. How does it work without an app? Who pays for delivery? What happens after I pay?',
        'Local requirements. M-Pesa and card payments, WhatsApp as the main contact channel, and KRA eTIMS invoicing for businesses.',
      ],
    },
    decisions: [
      {
        title: 'One order flow, two audiences',
        decision:
          'One order modal with a For Myself / For My Team toggle. The button a visitor clicks pre-selects the tab, one order can mix finishes, and a 10% bulk discount applies above 3 cards.',
        why: 'Both buyer types can order in minutes without talking to sales first, and switching tabs costs them nothing.',
        image: sketch(
          'luxecard-order-modal',
          'Sketch of the order modal showing both tabs, For Myself and For My Team, with finish rows, a bulk discount note and Add to cart',
        ),
      },
      {
        title: 'The cart sets expectations',
        decision:
          'A short note in the cart says what happens next: the team reaches out within 24 hours for logo and design details, and cards are ready in 3 days.',
        why: 'It answers the biggest source of post-purchase anxiety before it becomes a message.',
        image: sketch(
          'luxecard-cart',
          'Sketch of the cart with the timeline note: a What happens next panel, within 24 hours for logo and design details and 3 days to cards ready, above Checkout',
        ),
      },
      {
        title: 'Referrals on real tracking',
        decision:
          'An affiliate page where visitors pick a finish and a monthly volume and watch their 10% commission update. A ?ref= code is captured on landing and carried through to checkout.',
        why: 'A referral can be traced to an order, so the business can see which channels bring in customers.',
        image: sketch(
          'luxecard-affiliate',
          'Sketch of the affiliate calculator in action: a finish choice, a monthly volume slider at 40 cards, a 10% commission panel, and a ?ref= code carried through to checkout',
        ),
      },
    ],
    flow: {
      text: 'Pick a finish, choose For Myself or For My Team, pay by M-Pesa or card, then hear from the team within 24 hours.',
      frame: sketch(
        'flow-luxecard',
        'Sketch of the LuxeCard order flow in four steps: pick a finish, For Myself or For My Team, pay by M-Pesa or card, hear from the team within 24 hours',
      ),
    },
    screens: [
      sketch(
        'luxecard-finish-carousel',
        'Sketch of the finish carousel: Plastic, Wood, Metallic and Chairman’s Card side by side, each with its own Order button',
      ),
      sketch(
        'luxecard-reviews',
        'Sketch of the reviews section: two rows of review cards with star ratings, and a crossed-out someone just bought ticker',
      ),
    ],
    launch: {
      text: 'Launched September 2026. Live payments verified with a launch test payment.',
    },
    live: { url: 'https://luxecard.co.ke', label: 'Visit live site', closingLabel: 'See it live' },
    closing: {
      title: TRADE_OFFS,
      lists: [
        {
          label: 'Trade-offs I’d flag',
          items: [
            'The affiliate link generator was held back until it could run on real tracking, so the first referral links were issued by hand.',
            'No “someone just bought” ticker: with no verified order feed behind it, it would have been invented proof.',
          ],
        },
        {
          label: 'What I’d measure',
          items: [
            'Orders in the first 30 days.',
            'The share of team versus individual orders.',
            'Checkout completion rate.',
            'Affiliate sign-ups.',
          ],
        },
      ],
    },
  },
  {
    slug: 'src',
    lead: {
      text: 'Visitors couldn’t tell how SRC’s specialist support applied to their value chain.',
    },
    timeline: '2 weeks',
    tools: 'Mobbin, Figma, ChatGPT',
    hero: hero(
      'src',
      1161,
      'SRC Tech Impact Platform homepage: the serif headline Empowering Arid Land Enterprises & Agricultural Value Chains Across Kenya beside a photograph of milk being poured into a steel tank',
    ),
    problem: {
      text: 'Corporate clients and agricultural enterprises exploring SRC’s platform met a fragmented experience. The site gave no structured way to browse specialist categories or see technical proof, so visitors had to work out for themselves how the firm’s support applied to their own value chain.',
    },
    decisions: [
      {
        title: 'An interactive solutions matrix',
        decision:
          'Structured category cards cover Dairy Technology, Poultry Production & Processing, Financial Management, and Food Processing & Quality Assurance. Each has a direct Request Specialist path.',
        why: 'Visitors choose their own category instead of guessing.',
      },
      {
        title: 'Proof beside the choice',
        decision:
          'Targeted agricultural and SME value chains are shown with real operating context, such as work across Northern Kenya.',
        why: 'Credibility sits next to the decision, not on a separate page.',
      },
      {
        title: 'A support model you can see',
        decision: 'The delivery framework, Diagnose, Coach, Embed, appears on the homepage.',
        why: 'Visitors see what working together looks like before they enquire.',
      },
    ],
    flow: {
      text: 'Choose a category, then see proof for that value chain, then request a specialist.',
      frame: sketch(
        'flow-src',
        'Sketch of the SRC product flow in three steps: choose a category, see proof for that value chain, request a specialist',
      ),
    },
    screens: [],
    closing: {
      title: TRADE_OFFS,
      lists: [
        {
          label: 'Trade-offs I’d flag',
          items: [
            'The homepage has three jobs: categories, proof and process. I led with categories because they answer the visitor’s first question.',
          ],
        },
        {
          label: 'What I’d measure',
          items: [
            'Request Specialist clicks by category.',
            'Enquiry form completion.',
            'Which category visitors open first.',
          ],
        },
      ],
    },
  },
  {
    slug: 'nilson',
    lead: {
      text: 'Ordering medicine online meant juggling branches and manual inquiries. One place now takes the prescription and returns a private quote.',
    },
    timeline: '2 weeks',
    tools: 'Mobbin, Figma, ChatGPT',
    hero: hero(
      'nilson',
      1161,
      'Nilson Digital Pharmacy homepage: the headline Your Health, Delivered with Precision Across Kenya beside a prescription upload card offering a quote by WhatsApp or SMS',
    ),
    problem: {
      text: 'Customers ordering prescription medicines, vitamins and health products online faced a fragmented experience. Several physical branches, no single catalogue and no clear prescription-upload workflow pushed them into manual inquiries instead of a seamless digital storefront.',
    },
    decisions: [
      {
        title: 'One branch locator',
        decision:
          'A single hub directs customers to the right branch, with opening hours and delivery times beside a map with the delivery radius.',
        why: 'Customers find the right branch without calling around.',
        image: {
          src: `${CS}/x-nil-branches.webp`,
          width: 2580,
          height: 1080,
          alt: 'Nilson branch finder: a list of three branches with opening hours and delivery times beside a map with a delivery radius',
        },
      },
      {
        title: 'Clear categories',
        decision:
          'Prescription medicines, over-the-counter essentials, vitamins and supplements, and health and beauty are separated visually, with a supervising-pharmacist trust bar above them.',
        why: 'Customers see where their need lives, and why they can trust it.',
        image: {
          src: `${CS}/x-nil-trust.webp`,
          width: 2580,
          height: 1640,
          alt: 'Nilson trust bar and category cards: a supervising pharmacist panel with four safeguards, four assurances, and quick-order categories with starting prices',
        },
      },
      {
        title: 'A short path to ordering',
        decision: 'Upload a prescription, get a private quote by WhatsApp or SMS, and set refill reminders.',
        why: 'It connects the patient’s need directly to the pharmacy’s support and WhatsApp routing.',
        image: {
          src: `${CS}/x-nil-refill.webp`,
          width: 2580,
          height: 1080,
          alt: 'Nilson automatic refill module: a reminder timeline on the left and a form for supply length, reminders and delivery preference on the right',
        },
      },
    ],
    flow: {
      text: 'Upload the prescription, receive a private quote on WhatsApp or SMS, choose branch pickup or delivery, set refill reminders.',
      frame: sketch(
        'flow-nilson',
        'Sketch of the Nilson product flow in four steps: upload the prescription, private quote by WhatsApp or SMS, branch pickup or delivery, set refill reminders',
      ),
    },
    screens: [],
    closing: {
      title: TRADE_OFFS,
      lists: [
        {
          label: 'Trade-offs I’d flag',
          items: [
            'Routing quotes through WhatsApp keeps a pharmacist in the loop, but that human step is the part that will strain first as order volume grows.',
          ],
        },
        {
          label: 'What I’d measure',
          items: [
            'Prescription uploads started versus completed.',
            'Quote-to-order conversion.',
            'WhatsApp versus SMS use.',
            'Refill sign-ups.',
          ],
        },
      ],
    },
  },
  {
    slug: 'savannah',
    lead: {
      text: 'Four equal buttons asked visitors to guess which one was theirs. Each audience now gets its own way in.',
    },
    timeline: '2 weeks',
    tools: 'Mobbin, Figma, ChatGPT',
    hero: hero(
      'savannah',
      1161,
      'Savannah Informatics homepage: a deep purple hero with the headline Run your facility and get paid faster, on one platform, and a Schedule a 30-minute demo button beside a photograph of a smiling nurse',
    ),
    problem: {
      text: 'Savannah’s homepage serves facility owners, insurers, patients, developers and donors at once. Its hero offered four equal-weight, ambiguously labelled buttons, and nothing in the page body led facility owners to the product page where the demo, pricing and proof live.',
    },
    evidence: {
      label: 'Evidence',
      text: 'I audited the live homepage before designing. The hero buttons overlapped in meaning and pointed to different hosts, the header call to action opened a generic form, and no link in the page body reached the product page.',
    },
    decisions: [
      {
        title: 'One primary journey',
        decision:
          'One headline for facilities, ‘Run your facility and get paid faster, on one platform’, and one primary action, Schedule a 30-minute demo, repeated in the header, hero and closing band.',
        why: 'Facility owners always know the next step.',
      },
      {
        title: 'An audience router',
        decision:
          'Four equal cards with unambiguous labels send clinics and hospitals to the HMIS, insurers and providers to e-claims, patients to Be.Well, and developers to the APIs.',
        why: 'Each visitor recognises their own card at a glance.',
        image: {
          src: `${CS}/x-sav-roles.webp`,
          width: 2560,
          height: 1240,
          alt: 'Savannah role-based routing: four cards for clinics, insurers, patients and developers, each with its own product link',
        },
      },
      {
        title: 'A bridge to the product',
        decision:
          'A short revenue-cycle snapshot, registration, pre-authorisation, claims, reconciliation, links to the product page.',
        why: 'The page that converts was previously reachable only from the nav.',
        image: {
          src: `${CS}/x-sav-hmis.webp`,
          width: 2560,
          height: 920,
          alt: 'Savannah product section: the heading From first visit to final reconciliation beside a four-step list covering registration, pre-authorisation, claims and reconciliation',
        },
      },
    ],
    decisionsNote: {
      text: 'Institutional work, the Global Health Institute and the County Joint Learning Platform, sits in a compact band so it doesn’t crowd the commercial path.',
      image: {
        src: `${CS}/x-sav-inst.webp`,
        width: 2560,
        height: 680,
        alt: 'Savannah institutional work: two purple cards for the Global Health Institute and the County Joint Learning Platform',
      },
    },
    flow: {
      text: 'Pick your audience, land on the right product, and for facility owners, book a demo.',
      frame: sketch(
        'flow-savannah',
        'Sketch of the Savannah product flow in three steps: pick your audience, land on the right product, facility owners book a demo',
      ),
    },
    screens: [],
    closing: {
      title: TRADE_OFFS,
      lists: [
        {
          label: 'Trade-offs I’d flag',
          items: [
            'Moving the core-values icons and leadership grid off the homepage serves the main visitor, but job seekers and institutional readers now find them on About and Careers.',
          ],
        },
        {
          label: 'What I’d measure',
          items: [
            'Click-through from the homepage to the HMIS page.',
            'Demo bookings by source.',
            'Which audience card is chosen first.',
          ],
        },
      ],
    },
  },
  {
    slug: 'mila-kids',
    lead: {
      text: 'Helping the next generation reconnect with their roots, one word at a time.',
    },
    timeline: '4 weeks',
    tools: 'Mobbin, Figma, ChatGPT',
    hero: hero(
      'mila-kids',
      1161,
      'Mila Kids app screens on a coral background: onboarding with an illustrated map of Kenya, a child profile with age and avatar, the home screen with lessons and rewards, and settings',
    ),
    problem: {
      text: 'Children are increasingly losing touch with their Kenyan mother tongues, yet accessible and engaging digital learning experiences that make these languages approachable for young learners remain limited.',
    },
    decisions: [
      {
        title: 'Audio-led learning',
        decision: 'Children may struggle with text-heavy instructions, so lessons are guided by audio.',
        why: 'Instructions shouldn’t depend on reading.',
        image: phoneSketch('mila-audio-led', 'Phone sketch of an audio-led lesson: a picture, a large Listen button with a speaker icon, and no reading needed'),
      },
      {
        title: 'Short lessons, one action per screen',
        decision:
          'Young learners have limited attention spans and may struggle with complex navigation, so each lesson is short and each screen asks for one primary action, with larger touch targets for developing motor skills.',
        why: 'The path is obvious and small hands can follow it.',
        image: phoneSketch('mila-one-action', 'Phone sketch of a short lesson screen: a progress bar, one picture and a single large Next button'),
      },
      {
        title: 'Feedback and rewards',
        decision:
          'Language learning can feel repetitive, so visual feedback and rewards, with familiar illustrations and playful interactions, keep it approachable.',
        why: 'Progress feels visible and fun.',
        image: phoneSketch('mila-feedback-rewards', 'Phone sketch of feedback and rewards: a large star, the word Great!, a progress bar, star rating and a Next button'),
      },
    ],
    solutionIntro: {
      text: 'Mila Kids is a child-friendly language-learning platform that introduces Kenyan mother tongues through bite-sized lessons, interactive activities, visual storytelling and audio-led guidance, making cultural language learning more engaging and accessible.',
    },
    flow: {
      text: 'Onboarding, language selection, lessons, practice, feedback, progress.',
      frame: sketch(
        'flow-mila',
        'Sketch of the Mila Kids flow in six steps: onboarding, language selection, lessons, practice, feedback, progress',
      ),
    },
    screens: [],
    closing: {
      title: 'What I’d explore next',
      lists: [
        {
          label: 'Questions to explore',
          items: [
            'Could lessons adapt to each child’s proficiency?',
            'Could speech recognition support pronunciation practice?',
            'How might the app spot when a child struggles with a word?',
            'What would a progress view for parents need to show?',
            'How can storytelling make new vocabulary memorable?',
            'How can it encourage regular learning without unhealthy screen time?',
          ],
        },
      ],
      note: {
        text: 'Its effect on learning is not yet validated; the next step is testing the lessons with children and parents.',
      },
    },
  },
]

export const caseStudy = (slug: string | undefined) => CASE_STUDIES.find((study) => study.slug === slug)
