import { universityLogoUrls } from '../assets/university-logos/index.ts';
import { ROUTES } from './routes.ts';
import type {
  FaqItem,
  FooterColumn,
  LinkItem,
  MatchSnapshot,
  NavEntry,
  PlatformCardContent,
  QuoteContent,
  SocialLink,
  StatContent,
  TrustRow,
  UniversityLogo,
  VideoSource,
} from './types.ts';

/**
 * All landing page copy lives here, typed, so the team can edit text without touching JSX.
 * The words, capitalisation and punctuation are the design's.
 */

/**
 * In the design's paragraphs there is a blank two-space gap where the copy breaks mid-sentence
 * ("meets  shared", "budget  never", ...), with no dash drawn. It is reproduced as designed, with
 * a no-break space so the two spaces are not collapsed. Replace GAP with ", " or " \u2014 " (or
 * whatever punctuation is wanted) to change every one of them at once. The Decision heading and
 * the two quote attributions do show an em dash in the design, and keep it.
 */
export const GAP = '  ';

export const PAGE_META = {
  title: 'AlignTraits: see your real admission chances',
  description:
    'Realistic, explainable admission matching for Nigerian students. See how your scores and budget match current admission rules, with the cost beside every option.',
} as const;

export const SKIP_LINK_LABEL = 'Skip to main content';

/* ------------------------------------------------------------------ Navigation */

export const NAV: readonly NavEntry[] = [
  { kind: 'link', label: 'Students', href: ROUTES.students },
  { kind: 'link', label: 'Community', href: ROUTES.community },
  {
    kind: 'menu',
    label: 'Institutions',
    items: [
      { label: 'For Schools', href: ROUTES.forSchools },
      { label: 'For Universities', href: ROUTES.forUniversities },
      { label: 'Tutorial centers', href: ROUTES.tutorialCenters },
      { label: 'Request a pilot', href: ROUTES.requestPilot },
    ],
  },
  {
    kind: 'menu',
    label: 'Finances',
    items: [
      { label: 'Loans', href: ROUTES.loans },
      { label: 'Income-Share Plan', href: ROUTES.incomeSharePlan },
      { label: 'Scholarships & Awards', href: ROUTES.scholarships },
      { label: 'For Investors', href: ROUTES.forInvestors },
    ],
  },
];

export const NAV_LOGIN: LinkItem = { label: 'Login', href: ROUTES.login };
export const NAV_CTA: LinkItem = { label: 'Check my chances', href: ROUTES.checkChances };

/* ------------------------------------------------------------------ Hero */

export const HERO = {
  headlineLines: ["Don't Let One Small Mistake", 'Cost You a Whole Year.'],
  lead: 'Good WAEC. Decent JAMB. Yet, students still lose admissions to wrong subject combinations, shifting cut-offs, or unaffordable fees. AlignTraits matches your scores and budget against current admission rules, giving you a realistic path before you submit another form.',
  cta: { label: 'Verify My Admission Chances', href: ROUTES.checkChances } satisfies LinkItem,
  microcopy: 'Takes less than 5 minutes.',
  trustItems: [
    'Built on current admission rules',
    'Every match explained',
    'Shareable with parents & tutors',
    'No "guaranteed admission" nonsense',
  ],
} as const;

export interface HeroVideoConfig {
  /** Accessible name for the video. */
  title: string;
  /**
   * Playable files, tried in order. The video starts by itself, muted and looping, which is the
   * only autoplay browsers allow. Put the file in public/videos/ (see INTEGRATION.md).
   */
  sources: readonly VideoSource[];
  /** Poster image shown before the first frame, or null to show the dark frame. */
  posterSrc: string | null;
  /** The shared Google Drive link. Opened in a new tab if none of the sources can play. */
  shareUrl: string;
}

export const HERO_VIDEO: HeroVideoConfig = {
  title: 'AlignTraits introduction video',
  sources: [
    // 1. Your own copy of the video. Add the file at public/videos/aligntraits-intro.mp4
    //    (H.264 + AAC, and optionally a .webm beside it).
    { src: '/videos/aligntraits-intro.webm', type: 'video/webm' },
    { src: '/videos/aligntraits-intro.mp4', type: 'video/mp4' },
    // 2. Best-effort fallback straight from the shared Drive file, so the page already plays it
    //    while the file above is missing. Drive can refuse this (quota, large files), so move to
    //    option 1 before launch.
    {
      src: 'https://drive.google.com/uc?export=download&id=1cQ732oMmFQHmQyYVH25RKGvXwnHPmMt4',
      type: 'video/mp4',
    },
  ],
  posterSrc: null,
  shareUrl: 'https://drive.google.com/file/d/1cQ732oMmFQHmQyYVH25RKGvXwnHPmMt4/view?usp=sharing',
};

export const LOGO_STRIP_CAPTION = 'Your gateway to 3,000+ courses at 276 universities.';

/**
 * The six logos in the design come first, in the design's order, then the rest of the supplied
 * set. Names are used for the image alt text.
 */
export const UNIVERSITY_LOGOS: readonly UniversityLogo[] = [
  { id: 'covenant', name: 'Covenant University', logoSrc: universityLogoUrls.covenant },
  { id: 'ibadan', name: 'University of Ibadan', logoSrc: universityLogoUrls.ibadan },
  { id: 'babcock', name: 'Babcock University', logoSrc: universityLogoUrls.babcock },
  { id: 'ajayi-crowther', name: 'Ajayi Crowther University', logoSrc: universityLogoUrls.ajayiCrowther },
  { id: 'lagos', name: 'University of Lagos', logoSrc: universityLogoUrls.lagos },
  { id: 'landmark', name: 'Landmark University', logoSrc: universityLogoUrls.landmark },
  { id: 'abu', name: 'Ahmadu Bello University', logoSrc: universityLogoUrls.ahmaduBello },
  { id: 'oau', name: 'Obafemi Awolowo University', logoSrc: universityLogoUrls.awolowo },
  { id: 'futminna', name: 'Federal University of Technology, Minna', logoSrc: universityLogoUrls.futMinna },
  { id: 'unilorin', name: 'University of Ilorin', logoSrc: universityLogoUrls.ilorin },
  { id: 'light-blue', name: '', logoSrc: universityLogoUrls.lightBlue },
  { id: 'unn', name: 'University of Nigeria, Nsukka', logoSrc: universityLogoUrls.nsukka },
  { id: 'uniosun', name: 'Osun State University', logoSrc: universityLogoUrls.osun },
];

/* ------------------------------------------------------------------ Platform */

export const PLATFORM = {
  headingLines: ["You're Not Just Getting a Report.", "You're Joining a Platform."],
  intro: `AlignTraits starts with admission matching because that's the most urgent problem first${GAP}but the platform doesn't stop at the match.`,
  cards: [
    {
      id: 'community',
      icon: 'community',
      title: 'Community',
      body: `Conferences, debates, the yearly AlignTraits Interschool Olympics, free courses, games, and interschool meets${GAP}shared as they happen, not buried in a WhatsApp group you'll scroll past.`,
      link: { label: 'Explore the Community', href: ROUTES.community },
    },
    {
      id: 'schools',
      icon: 'schools',
      title: 'For Schools',
      body: "A course-recommendation tool your SS students can use before JAMB even starts, free access to our community's opportunities, and subsidized pricing across AlignTraits products.",
      link: { label: 'Partner as a School', href: ROUTES.forSchools },
    },
    {
      id: 'universities',
      icon: 'universities',
      title: 'For Universities',
      body: `Visibility to students actively choosing their next step, and automated screening that checks both admission fit and ability to pay${GAP}so every lead is worth your team's time.`,
      link: { label: 'Partner as a University', href: ROUTES.forUniversities },
    },
    {
      id: 'finances',
      icon: 'finances',
      title: 'Finances',
      body: `Loans through trusted financing partners, an income-share plan for strong academic performers, and scholarships${GAP}because getting admitted shouldn't be where the story ends over money.`,
      link: { label: 'See Your Funding Options', href: ROUTES.fundingOptions },
    },
  ] satisfies readonly PlatformCardContent[],
} as const;

/* ------------------------------------------------------------------ Decision */

export const DECISION = {
  // The design's heading has a real, visible em dash here (unlike the paragraphs).
  heading: 'Built for the Whole Decision \u2014 Not Just the Student',
  intro:
    "This was never going to be a solo decision, and we didn't design it like one. Every report is written to hold up when the real questions come:",
  quotes: [
    { quote: '“Can we actually afford this?”', attribution: 'A parent' },
    { quote: '“Is this subject combination even correct?”', attribution: 'A tutorial teacher' },
  ] satisfies readonly QuoteContent[],
  closing: "That's the bar every match has to clear before it reaches you.",
  callout: {
    lead: 'Run a tutorial center, or counsel students through JAMB?',
    body: ' Give every student you advise the same accuracy edge.',
    cta: { label: 'Partner With AlignTraits', href: ROUTES.partnerWithAlignTraits } satisfies LinkItem,
  },
  photoAlt: 'A parent and a student reading admission options together at a table',
} as const;

/* ------------------------------------------------------------------ Trust */

export const TRUST = {
  heading: 'Why Students (and Parents) Trust US',
  rows: [
    {
      id: 'show-our-work',
      title: 'We show our work.',
      body: 'Every result comes with the reasoning behind it, not a mysterious match score.',
    },
    {
      id: 'cost-is-part',
      title: 'Cost is part of the match, not an afterthought.',
      body: `Full fees and payment realism, shown next to every option${GAP}not just "you can get in."`,
    },
    {
      id: 'never-sponsored',
      title: 'Never sponsored placement.',
      body: `Matches are ranked by your fit score, subjects, budget${GAP}never by who's paying us. If a school is ever shown as a\u00A0sponsored option, it's clearly labelled as one, apart from your matches.`,
    },
    {
      id: 'built-to-be-checked',
      title: 'Built to be checked.',
      body: "Every recommendation links back to its source. We'd rather you double check us than take our word for it.",
    },
    {
      id: 'no-guarantees',
      title: 'No guarantees, no gimmicks.',
      body: 'We\'ll tell you plainly when a course is a stretch. Realistic beats "guaranteed," every time.',
    },
  ] satisfies readonly TrustRow[],
  badge: 'Every match explained',
  photos: {
    leaverAlt: 'A smiling school leaver holding a portfolio',
    studentAlt: 'A smiling student at a desk with an open notebook',
  },
  snapshot: {
    eyebrow: 'Your match snapshot',
    utmeScore: 262,
    budgetPerYear: 400000,
    rows: [
      { level: 'reach', tag: 'Reach', course: 'Medicine & Surgery', feePerYear: 235000 },
      { level: 'realistic', tag: 'Realistic match', course: 'Nursing Science', feePerYear: 310000 },
      { level: 'safety', tag: 'Safety net', course: 'Microbiology', feePerYear: 145000 },
    ],
  } satisfies MatchSnapshot,
} as const;

/* ------------------------------------------------------------------ Research */

export const RESEARCH = {
  heading: 'What Nigerian students and admissions staff actually told us',
  intro:
    'From our research with 100 participants JAMB candidates, school leavers, and university admissions staff across Nigeria.',
  stats: [
    {
      id: 'accuracy',
      figure: '100 of 100',
      text: 'named accuracy against current admission rules as the one non-negotiable feature ahead of dashboards, AI, or anything else.',
    },
    {
      id: 'denied',
      figure: 'Nearly all',
      text: `could describe someone denied admission despite a solid JAMB score${GAP}a wrong subject combination, a shifted cut-off, or a post-UTME change was almost always the reason.`,
    },
    {
      id: 'ability-to-pay',
      figure: '90 of 100',
      text: 'flagged "ability to pay" as something that has to shape a recommendation, not just qualify it after the fact.',
    },
  ] satisfies readonly StatContent[],
} as const;

/* ------------------------------------------------------------------ FAQ */

export const FAQ = {
  headingLines: ['Common', 'Questions'],
  intro: 'Straight answers to what students and parents ask us most.',
  // The design shows five questions and the answer to the first one only. Answer 1 is the design's.
  // Answer 3 is the answer supplied for the same question. Answers 2, 4 and 5 are drafted from
  // the design's own copy and need approval before launch.
  items: [
    {
      id: 'guarantee',
      question: 'Will this guarantee my admission?',
      answer: `No honest tool can promise that, and we won't pretend to. What we will do is tell you plainly which combinations are realistic, which are a stretch, and which backup keeps your year safe${GAP}a decision you can defend, not a guess.`,
    },
    {
      id: 'sponsored',
      question: 'Is this sponsored by the schools you recommend?',
      answer:
        "No. Matches are ranked by your fit score, subjects and budget, never by who's paying us. If a school is ever shown as a sponsored option, it's clearly labelled as one, apart from your matches.",
    },
    {
      id: 'know-my-course',
      question: 'I already know my course. Why do I need this?',
      answer:
        "We still check that your subjects and score genuinely qualify you for it. A mismatch here is one of the most common, avoidable reasons students lose admission. You'll also get two or three backups close to your goal, in case your first choice gets too competitive or too costly.",
    },
    {
      id: 'share',
      question: 'Can I show this to my parents or tutorial teacher?',
      answer:
        'Yes, that is what it is built for. Every result comes with the reasoning behind it and the full fees beside every option, so the people helping you decide can check it for themselves.',
    },
    {
      id: 'cost',
      question: "Why does this cost anything? Can't I find this myself?",
      answer:
        'You can start with the free snapshot. The full Match Report does the slow part for you: it checks your scores, subjects and budget against current admission rules and shows the reasoning behind every match.',
    },
  ] satisfies readonly FaqItem[],
} as const;

/* ------------------------------------------------------------------ Final CTA */

export const FINAL_CTA = {
  headingLead: "Another Form Won't Fix a Choice That Was ",
  headingHighlight: 'Already Wrong.',
  intro: 'See your real chances before you spend another naira, or another year, on a guess.',
  cta: { label: 'See My Real Chances', href: ROUTES.checkChances } satisfies LinkItem,
  microcopy: 'Takes less than 5 minutes.',
} as const;

/* ------------------------------------------------------------------ Footer */

export const FOOTER = {
  tagline: `Realistic, explainable admission matching for Nigerian students${GAP}checked against current rules, with cost beside every option.`,
  columns: [
    {
      heading: 'Students',
      links: [
        { label: 'Free snapshot', href: ROUTES.freeSnapshot },
        { label: 'Match Report', href: ROUTES.matchReport },
        { label: 'Community', href: ROUTES.community },
        { label: 'Funding options', href: ROUTES.fundingOptions },
      ],
    },
    {
      heading: 'Institutions',
      links: [
        { label: 'For Schools', href: ROUTES.forSchools },
        { label: 'For Universities', href: ROUTES.forUniversities },
        { label: 'Tutorial centers', href: ROUTES.tutorialCenters },
        { label: 'Request a pilot', href: ROUTES.requestPilot },
      ],
    },
    {
      heading: 'Finances',
      links: [
        { label: 'Loans', href: ROUTES.loans },
        { label: 'Income-Share Plan', href: ROUTES.incomeSharePlan },
        { label: 'Scholarships & Awards', href: ROUTES.scholarships },
        { label: 'For Investors', href: ROUTES.forInvestors },
      ],
    },
  ] satisfies readonly FooterColumn[],
  social: [
    /* Only accounts with a real address are listed. Add LinkedIn, Instagram and Facebook
       here once their addresses are confirmed; an entry with '#' is not shown. */
    { platform: 'linkedin', label: 'AlignTraits on LinkedIn', href: '#' },
    { platform: 'instagram', label: 'AlignTraits on Instagram', href: '#' },
    { platform: 'tiktok', label: 'AlignTraits on TikTok', href: 'https://www.tiktok.com/@aligntraits' },
    { platform: 'facebook', label: 'AlignTraits on Facebook', href: '#' },
  ] satisfies readonly SocialLink[],
  bottomLine: 'Matches are never ranked by who pays us.',
} as const;
