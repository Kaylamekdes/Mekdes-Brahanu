// The "More work" section: smaller explorations, shown as an image and a
// niche line only (no titles). The niche lines are draft wording describing
// what each image shows.

export interface MoreWorkItem {
  niche: string
  image: {
    src: string
    width: number
    height: number
    alt: string
  }
}

export const MORE_WORK: MoreWorkItem[] = [
  {
    niche: 'Web · Crypto exchange',
    image: {
      src: '/work/more/more-dexo.webp',
      width: 1056,
      height: 703,
      alt: 'DEXO crypto exchange website: the headline The Future of Decentralized Perpetual Exchange on a purple and navy page, surrounded by token price, liquidity pool, swap and leaderboard panels.',
    },
  },
  {
    niche: 'Mobile · Digital wallet',
    image: {
      src: '/work/more/more-wallet.webp',
      width: 1056,
      height: 703,
      alt: 'Mobile wallet app on two phones against an orange background: a home screen with a $1,740.20 balance and recent transactions, and a card screen with a Visa card and transfer and fund buttons.',
    },
  },
]

// Parked: the cards these replaced, taken off the site and kept here so
// nothing is lost. Not rendered anywhere. (Their images still appear in the
// hero tunnel, which is unchanged.)
export const PARKED_MORE_WORK = [
  {
    title: 'DCash Africa',
    descriptor: 'Moving money across African payment rails at market speed.',
    kind: 'Web · Fintech',
    image: {
      src: '/work/cards/w-dc.webp',
      width: 1280,
      height: 860,
      alt: 'DCash Africa homepage in a near-black theme: a cross-border transfer card beside the headline Move money at the speed of markets',
    },
  },
  {
    title: 'Alifab Solutions',
    descriptor: 'Turning a fabricator’s track record into a quote request.',
    kind: 'Web · Landing page',
    image: {
      src: '/work/cards/w-ali.webp',
      width: 1280,
      height: 860,
      alt: 'Alifab Solutions landing page in black and gold: the headline Master Craftsmanship in Aluminium and Glass above a photograph of a villa with glass sliding doors',
    },
  },
]
