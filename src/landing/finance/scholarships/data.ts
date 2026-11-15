/*
  Words, links and listings for the Scholarships and awards page (/finances/scholarships).
  The scholarships themselves come from src/data/scholarships.ts, the same checked list that
  powers the Scholarship tab on course pages. This file only picks which ones to feature here
  and adds the short card wording.
*/

/* Links */
export const LINKS = {
  seeOpenScholarships: '/login',
  joinFree: '/signup',
  whatsapp: 'https://chat.whatsapp.com/LS7jfa4W5iFLP49rYoR9IX?mode=gi_t',
  forUniversities: '/institutions/universities',
  forInvestors: '/finances/investors',
} as const;

export const PAGE_META = {
  title: 'Scholarships and awards | AlignTraits',
  description:
    'Find scholarships that fit your score, your course and your budget. Real, recurring scholarships for Nigerian undergraduates, with official links and dates.',
} as const;

export const HERO = {
  eyebrow: 'Scholarships and awards',
  titleStart: 'Find scholarships that',
  titleAccent: 'fit your score',
  titleEnd: ', your course and your budget.',
  subtitle:
    'Some of the best students should not have to choose between a dream course and an affordable one. Scholarships and awards from partner universities, sponsors and AlignTraits events help close that gap.',
  cta: 'See open scholarships',
  helperStart: 'Shared first in the Community.',
  helperLink: 'Join free',
  helperEnd: 'to hear as they open.',
  imageAlt: 'A student receiving an award certificate on stage at a university award ceremony',
};

/* Filter chips. "All" is added by the component. */
export const COVER_TYPES = ['Full tuition', 'Part tuition', 'Upkeep', 'One-time award'] as const;
export type CoverType = (typeof COVER_TYPES)[number];

/*
  Featured scholarships, in the order shown. Each `id` matches a row in src/data/scholarships.ts.
  Yearly cash grants are grouped under "Part tuition", because they usually cover part of the fees.
  `window` is the small date chip shown while a round is closed.
*/
export interface FeaturedScholarship {
  id: string;
  funder: string;
  covers: CoverType[];
  whatItCovers: string;
  whoCanApply: string;
  whatYouNeed: string;
  howToApply: string;
  window: string;
}

export const FEATURED: FeaturedScholarship[] = [
  {
    id: 'chevron-jv-standard',
    funder: 'Funded by Chevron Nigeria and NNPC',
    covers: ['Part tuition'],
    whatItCovers: 'A yearly grant until graduation. The amount is not published.',
    whoCanApply: '200 level students in listed courses at any accredited Nigerian university, with a CGPA of 3.5 or above.',
    whatYouNeed: 'Your O’Level result (six credits in one sitting) and CGPA. The full list is on the official page.',
    howToApply: 'Online on Scholastica, then a computer-based test.',
    window: 'Usually mid-year',
  },
  {
    id: 'renaissance-jv-national',
    funder: 'Funded by the NNPC/Renaissance joint venture',
    covers: ['Part tuition'],
    whatItCovers: 'A yearly grant until graduation. The amount is not published.',
    whoCanApply: '200 level students from any state at any accredited Nigerian university.',
    whatYouNeed: 'The document list is on the official page.',
    howToApply: 'Online on Scholastica, then a computer-based test.',
    window: 'Usually April to May',
  },
  {
    id: 'jim-ovia-foundation',
    funder: 'Funded by the Jim Ovia Foundation',
    covers: ['Part tuition'],
    whatItCovers: '₦250,000 a year, renewable to the end of your degree.',
    whoCanApply: 'Admitted Nigerian undergraduates in any course, aged 16 or older.',
    whatYouNeed: 'Proof of admission and a letter from your Head of Department.',
    howToApply: 'Online on the foundation’s website only. No agents.',
    window: 'Usually late November',
  },
  {
    id: 'waaw-foundation',
    funder: 'Funded by the WAAW Foundation',
    covers: ['One-time award'],
    whatItCovers: 'A US$500 award paid in naira, plus mentoring and leadership training.',
    whoCanApply: 'Female STEM students under 32 who need financial help.',
    whatYouNeed: 'The document list is on the official page.',
    howToApply: 'Online on the WAAW Foundation website.',
    window: 'Expected November 2026',
  },
  {
    id: 'oando-jv-national',
    funder: 'Funded by Oando and its joint venture partners',
    covers: ['Part tuition'],
    whatItCovers: 'A yearly scholarship. The amount is not published.',
    whoCanApply: '100 level students in engineering, geology, geosciences or agriculture.',
    whatYouNeed: 'The document list is on the official page.',
    howToApply: 'Online on Scholastica, then an online aptitude test.',
    window: 'Usually March',
  },
  {
    id: 'pau-tuition-aid',
    funder: 'Funded by Pan-Atlantic University',
    covers: ['Full tuition', 'Part tuition'],
    whatItCovers: 'Almost full tuition for about 5% of students, and part tuition for about 10%.',
    whoCanApply: 'Pan-Atlantic University students with strong grades and proven financial need.',
    whatYouNeed: 'Your results and proof of financial need, through the PAU aid process.',
    howToApply: 'Through the PAU financial aid process, alongside admission.',
    window: 'Usually May to June',
  },
  {
    id: 'abuad-agriculture',
    funder: 'Funded by Afe Babalola University, Ado-Ekiti',
    covers: ['Part tuition'],
    whatItCovers: 'Half tuition for all five years, plus a ₦250,000 fund at graduation.',
    whoCanApply: 'Students admitted to a B.Agric programme at ABUAD.',
    whatYouNeed: 'Your ABUAD admission to a B.Agric programme.',
    howToApply: 'Applied when you are admitted to B.Agric.',
    window: 'Always open',
  },
  {
    id: 'lagos-state-scholarship',
    funder: 'Funded by the Lagos State Scholarship Board',
    covers: ['Part tuition'],
    whatItCovers: 'A yearly award for a first degree. The amount is not published.',
    whoCanApply: 'Lagos State indigenes with strong grades, at universities across Nigeria.',
    whatYouNeed: 'Proof that you are a Lagos State indigene, and your results.',
    howToApply: 'Online on the Lagos State Scholarship Board portal.',
    window: 'Usually January to March',
  },
  {
    id: 'lagos-state-bursary',
    funder: 'Funded by the Lagos State Scholarship Board',
    covers: ['Upkeep'],
    whatItCovers: 'A yearly bursary to help with costs while you study.',
    whoCanApply: 'Lagos State indigenes in tertiary institutions.',
    whatYouNeed: 'Proof that you are a Lagos State indigene, and proof of studentship.',
    howToApply: 'Online on the Lagos State Scholarship Board portal.',
    window: 'Usually January to March',
  },
];

export const LIST = {
  title: 'Open and recurring scholarships',
  body: 'Real scholarships, checked on each funder’s official page. Most open once a year, so each card shows when to expect the next round.',
  viewDetails: 'View details',
  empty: 'No scholarship in this group right now. Try another filter.',
};

export const SOURCES = {
  title: 'Where scholarships come from',
  cards: [
    {
      title: 'Partner universities',
      body: 'They post scholarships directly to students in the AlignTraits Community, often before those students have applied anywhere.',
    },
    {
      title: 'Investors and sponsors',
      body: 'They fund awards and prizes through AlignTraits, including at Community events.',
    },
    {
      title: 'AlignTraits events',
      body: 'Conferences, debates and the yearly AlignTraits Interschool Olympics carry their own prizes and awards for taking part.',
    },
  ],
};

export const ANATOMY = {
  title: 'What every listing tells you',
  body: 'Each scholarship shows the same six things, so you can compare quickly and never hunt for the deadline.',
  items: [
    { title: 'Name and funder', body: 'Who is offering it, by name.' },
    { title: 'What it covers', body: 'Full tuition, part tuition, upkeep or a one-time award.' },
    { title: 'Who can apply', body: 'The criteria, in plain words.' },
    { title: 'Deadline', body: 'The closing date, always visible.' },
    { title: 'What you need', body: 'The documents to prepare.' },
    { title: 'How to apply', body: 'Where and how to send it.' },
  ],
};

export const STEPS = {
  title: 'How to apply',
  items: [
    { title: 'Join the Community, free', body: 'Scholarships are shared there first.' },
    {
      title: 'Read who can apply',
      body: 'If you do not fit the criteria, move on to the next one. If you do, note the deadline.',
    },
    { title: 'Gather what you need', body: 'Each listing says what to prepare.' },
    { title: 'Apply before the deadline', body: 'Closing dates are usually fixed, so apply early.' },
  ],
};

export const STAY_SAFE = {
  title: 'Stay safe',
  body: "Real scholarships do not ask you to pay to apply. Check the funder's name and the deadline. If something feels wrong, message us on WhatsApp before you send money or documents.",
  button: 'Message us on WhatsApp',
};

export const OFFERING = {
  title: 'Offering a scholarship?',
  cards: [
    {
      title: 'Universities',
      body: 'Partner universities can post scholarships to students who have not applied anywhere yet.',
      link: 'For Universities',
    },
    {
      title: 'Sponsors and investors',
      body: 'You can fund awards and prizes through AlignTraits.',
      link: 'For Investors',
    },
  ],
};

/*
  FAQ. The first answer comes from the design. Answers marked `draft: true` were written
  for this page and need review before launch.
*/
export const FAQ = {
  title: 'Questions students and parents ask',
  body: 'Straight answers about who can apply, what scholarships cover and how to stay safe.',
  items: [
    {
      q: 'Who can apply?',
      a: 'It depends on the scholarship. Each listing says who can apply, so check the criteria first.',
      draft: false,
    },
    {
      q: 'Do I have to be at a partner school?',
      a: 'No. Most scholarships on this page are open to students at any accredited Nigerian university. A few belong to one university, such as a university’s own aid, and the listing says so.',
      draft: true,
    },
    {
      q: 'Do I have to repay a scholarship?',
      a: 'No. A scholarship or award is not a loan, so you do not pay it back. Some ask you to keep a minimum grade to renew it each year.',
      draft: true,
    },
    {
      q: 'Will a scholarship cover everything?',
      a: 'Not always. Some cover full tuition, many cover part of it, and some help with upkeep or give a one-time award. Check what each one covers, and plan the rest of your costs with your family.',
      draft: true,
    },
    {
      q: 'Can I apply for more than one?',
      a: 'Yes, you can usually apply for several. Some funders do not let you hold two awards at once, especially oil and gas scholarships, so check each listing before you accept an offer.',
      draft: true,
    },
    {
      q: 'Is there a fee to apply?',
      a: 'No. Genuine scholarships do not charge you to apply or to receive an award. If anyone asks you to pay, stop and message us on WhatsApp first.',
      draft: true,
    },
  ],
};

export const CTA = {
  titleStart: 'Do not miss a deadline because',
  titleAccent: 'you heard late',
  button: 'See open scholarships',
};
