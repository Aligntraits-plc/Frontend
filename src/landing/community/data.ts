/*
  Words, links and photos for the Community page (/community).
  The copy follows the Community design. Links marked '#' have no page behind them yet:
  replace them when the page or form exists.
*/
import { ROUTES } from '../data/routes';

import ambassadorsTile from './assets/hero/ambassadors.webp';
import applicationCheck from './assets/hero/application-check.webp';
import bookClub from './assets/hero/book-club.webp';
import careerNews from './assets/hero/career-news.webp';
import careersTalk from './assets/hero/careers-talk.webp';
import codingCourse from './assets/hero/coding-course.webp';
import deadlineReminder from './assets/hero/deadline-reminder.webp';
import debatePrep from './assets/hero/debate-prep.webp';
import examPrep from './assets/hero/exam-prep.webp';
import goodNews from './assets/hero/good-news.webp';
import interschoolMeet from './assets/hero/interschool-meet.webp';
import interschoolOlympics from './assets/hero/interschool-olympics.webp';
import jambPrep from './assets/hero/jamb-prep.webp';
import openDay from './assets/hero/open-day.webp';
import planningTogether from './assets/hero/planning-together.webp';
import scholarshipAlert from './assets/hero/scholarship-alert.webp';
import sharingNews from './assets/hero/sharing-news.webp';
import studyCircle from './assets/hero/study-circle.webp';
import subjectPrep from './assets/hero/subject-prep.webp';
import techCourse from './assets/hero/tech-course.webp';

export const LINKS = {
  join: '/signup',
  forSchools: ROUTES.forSchools,
  applyAmbassador: ROUTES.ambassadors,
  /* The Insider plan has no page of its own yet, so this opens the plans. */
  insiders: '/select-payment',
  /* The WhatsApp group used for enquiries (same link as the flyers and the Scholarships page). */
  whatsapp: 'https://chat.whatsapp.com/LS7jfa4W5iFLP49rYoR9IX?mode=gi_t',
} as const;

export const PAGE_META = {
  title: 'Community | AlignTraits',
  description:
    'Free for every student. Scholarships, competitions, debates, the AlignTraits Interschool Olympics and free courses, each posted once with its deadline and source.',
} as const;

/*
  Photos for the moving tiles in the hero. Any of them can appear in any tile, in a random order,
  so each caption describes its own photo. To add a photo, crop it square (256 x 256 WebP is
  plenty) and add a line here.
*/
export const HERO_PHOTOS = [
  { src: interschoolOlympics, caption: 'Interschool Olympics' },
  { src: jambPrep, caption: 'JAMB prep' },
  { src: techCourse, caption: 'Free tech course' },
  { src: examPrep, caption: 'Exam prep' },
  { src: codingCourse, caption: 'Free coding course' },
  { src: interschoolMeet, caption: 'Interschool meet' },
  { src: openDay, caption: 'University open day' },
  { src: scholarshipAlert, caption: 'Scholarship alert' },
  { src: studyCircle, caption: 'Study circle' },
  { src: debatePrep, caption: 'Debate prep' },
  { src: bookClub, caption: 'Book club' },
  { src: deadlineReminder, caption: 'Deadline reminder' },
  { src: sharingNews, caption: 'Sharing the news' },
  { src: goodNews, caption: 'Good news at home' },
  { src: planningTogether, caption: 'Planning together' },
  { src: applicationCheck, caption: 'Application check' },
  { src: subjectPrep, caption: 'Subject prep' },
  { src: careersTalk, caption: 'Careers talk' },
  { src: ambassadorsTile, caption: 'Ambassadors' },
  { src: careerNews, caption: 'Career news' },
] as const;

export const HERO = {
  titleStart: 'Know what is coming',
  titleAccent: 'before',
  titleEnd: 'other students do.',
  subtitle:
    'Insiders get access to conferences, education and career news, debates, the AlignTraits Interschool Olympics and free courses, shared as they happen. Not buried in a group chat you will scroll past.',
  cta: 'Join the Community',
  helper: 'No Match Report needed.',
  pills: ['Welcome to all students', 'It’s always free', 'No spam, ever', 'Safe by design'],
};

export const WHY = {
  title: 'Why a community',
  imageAlt: 'Three secondary school students on a bench, laughing at something on a phone',
  badges: ['Olympics', 'Debates', 'Free courses'],
  body: 'Students told us how they really decide. They ask parents, tutors and older students, then cross-check what they hear in WhatsApp groups. They use those groups for alerts, not as final truth.',
  quote: '“For alerts, not as final truth.”',
  quoteSource: 'How students describe their WhatsApp groups',
  body2:
    'The AlignTraits Community keeps that human network and gives it a proper home. Each opportunity is posted once, with its deadline and its source, so you can check it before you act.',
  /* CONFIRM BEFORE LAUNCH: keep only if this matches a study you can share. */
  source: 'Source: AlignTraits research, 100 participants',
};

export const INSIDE = {
  title: 'What is inside',
  olympics: {
    pill: 'Opens',
    title: 'The AlignTraits Interschool Olympics',
    bodyStart: 'Our yearly competition for schools, academic and otherwise. Teams compete, win and get seen. Entries open on',
    /* CONFIRM BEFORE LAUNCH: the entry date. */
    date: '[Date]',
    bodyEnd: '. Bring your team.',
    imageAlt: 'A school team in matching shirts in a huddle on a sports field',
  },
  board: {
    pill: 'Live',
    title: 'The Opportunity Board',
    body: 'Scholarships, competitions, internships and events, posted the moment we know about them. Every post names who can apply and the deadline.',
    exampleLabel: 'Example of how every post looks',
    example: {
      type: 'Scholarship',
      title: 'Undergraduate merit scholarship',
      rows: [
        { label: 'Who can apply', value: 'SS3 students and school leavers' },
        { label: 'Deadline', value: '30 November' },
        { label: 'Source', value: 'Organiser’s official page' },
      ],
    },
  },
  columns: [
    {
      title: 'Conferences and debates',
      body: 'Real stages for students who want to think out loud. Debates and panel-style conferences on the choices in front of you: course, career, country and campus life.',
      pill: { tone: 'info' as const, label: 'Opens', dot: false },
    },
    {
      title: 'Free courses',
      body: 'Short, practical courses outside the classroom: study skills, writing a scholarship application, personal finance basics and subject prep. Each one is shared as it goes live.',
      pill: { tone: 'success' as const, label: 'Live', dot: true },
    },
    {
      title: 'Games and interschool meets',
      body: 'Not everything here is about admission. Games and meets bring students from different schools together, so nobody climbs alone.',
      pill: { tone: 'neutral' as const, label: 'Coming soon', dot: false },
    },
  ],
};

export const AMBASSADORS = {
  eyebrow: 'AlignTraits Ambassadors',
  title: 'Represent AlignTraits at your school.',
  body: 'We are recruiting young minds from schools across Nigeria to work with us as ambassadors. As an ambassador, you represent AlignTraits among the students around you.',
  strong: 'For secondary school students who want to lead.',
  cta: 'Apply to be an ambassador',
  /* CONFIRM BEFORE LAUNCH: the date applications open. */
  helper: 'Under 18? A parent or guardian must agree. Applications open [Date].',
  points: ['Open to many schools', 'Consent first for students under 18', 'Honest about what AlignTraits does and does not do'],
  imageAlt: 'Secondary school students in white shirts talking in a school courtyard, one holding a phone',
};

export const WAYS = {
  title: 'What is inside',
  body: 'Five ways to take part, all in one place. Some are live today, others open soon, and every one is announced in your feed the moment it does.',
  cards: [
    {
      icon: 'mic',
      pill: { tone: 'gold' as const, label: 'Recurring' },
      title: 'Conferences and debates',
      body: 'Real stages for students who want to think out loud. Debates and panel-style conferences on the choices in front of you: course, career, country and campus life.',
    },
    {
      icon: 'trophy',
      pill: { tone: 'gold' as const, label: 'Entries opening soon' },
      title: 'The AlignTraits Interschool Olympics',
      body: 'Our yearly competition for schools, academic and otherwise. Teams compete, win and get seen. Bring your team.',
    },
    {
      icon: 'book',
      pill: { tone: 'gold' as const, label: 'Coming soon' },
      title: 'Free courses',
      body: 'Short, practical courses outside the classroom: study skills, writing a scholarship application, personal finance basics and subject prep. Each one is shared as it goes live.',
    },
    {
      icon: 'games',
      pill: { tone: 'neutral' as const, label: 'Coming soon' },
      title: 'Games and interschool meets',
      body: 'Not everything here is about admission. Games and meets bring students from different schools together, so nobody climbs alone.',
    },
    {
      icon: 'board',
      pill: { tone: 'success' as const, label: 'Live' },
      title: 'The Opportunity Board',
      body: 'Scholarships, competitions, internships and events, posted the moment we know about them. Every post names who can apply and the deadline.',
      wide: true,
    },
  ],
} as const;

export const POSTS = {
  title: 'Every opportunity, posted once.',
  body: 'Who can apply, the deadline and where it came from, on every post. Check it once, then act.',
  tag: 'Sample preview',
  whoLabel: 'Who can apply',
  deadlineLabel: 'Deadline',
  source: 'Source: verified',
  items: [
    {
      type: 'Scholarship',
      tone: 'blue' as const,
      title: 'Undergraduate Merit Scholarship 2026/27',
      by: 'A Lagos-based education foundation',
      who: '100-level students in any federal university, JAMB score 250+',
      deadline: '14 December 2026',
    },
    {
      type: 'Competition',
      tone: 'gold' as const,
      title: 'National Secondary Schools Essay Prize',
      by: 'A national literacy trust',
      who: 'SS2 and SS3 students in any Nigerian secondary school',
      deadline: '30 November 2026',
    },
    {
      type: 'Internship',
      tone: 'green' as const,
      title: 'Holiday Software Internship, Yaba',
      by: 'A Lagos tech company',
      who: 'University students in 200 level and above, any course',
      deadline: '8 January 2027',
    },
  ],
};

export const WHO_FOR = {
  title: 'Who it is for',
  body: 'If you are choosing what comes next, you belong here.',
  groups: ['SS1 to SS3 students', 'JAMB candidates', 'School leavers', 'University students rethinking a course'],
};

export const ACCESS = {
  title: 'Free for everyone, more for partner schools',
  free: {
    title: 'Free for everyone',
    body: 'Joining is free for every student. You do not need a Match Report, and if you already have one, you are already in.',
    link: 'Join the Community, free',
  },
  partner: {
    title: 'Priority for partner schools',
    body: 'Students at a partner school get priority access. They hear first about scholarships, Interschool Olympics entries and events, before these open to everyone else.',
    link: 'See how schools partner with AlignTraits',
  },
};

export const STEPS = {
  title: 'How it works',
  items: [
    { title: 'Join free', body: 'Sign up with your email or phone number.' },
    { title: 'Pick what you care about', body: 'Debates, courses, scholarships, or all of them.' },
    {
      title: 'Take part',
      body: 'Register for an event, start a course or apply for an opportunity from your Community feed.',
    },
  ],
};

export const MORE = {
  insider: {
    title: 'The Insider Community',
    body: 'Want to hear first? A paid monthly plan with a quarterly email on opportunities and news, premium information before other students do, a members-only circle and priority. The Community itself stays free.',
    cta: 'See what Insiders get',
  },
  ambassador: {
    title: 'Become an AlignTraits ambassador',
    body: 'We are recruiting young minds from schools across Nigeria to represent AlignTraits. If you want to work with us at your school, apply to be an ambassador.',
    cta: 'Become an ambassador',
  },
};

export const SAFE = {
  title: 'Safe by design',
  lead: 'Most of our students are under 18, and their safety comes before any photo.',
  body: 'We never publish a student’s full name with their face without written consent from a parent or guardian and from the school. Parents can ask us to remove an image at any time, by messaging us on WhatsApp.',
  link: 'Reach out to support on WhatsApp',
};

export const CTA = {
  titleStart: 'Help your classmates',
  titleAccent: 'find what comes next',
  button: 'Apply to be an ambassador',
  helper: 'Under 18? A parent or guardian must agree.',
};

/*
  FAQ. The first answer comes from the design. Answers marked `draft: true` were written
  for this page from what the page already says, and need your review before launch.
*/
export const FAQ = {
  title: 'Common Questions',
  body: 'Straight answers for students and parents.',
  items: [
    {
      q: 'Do I need a Match Report to join?',
      a: 'No. The Community is free for every student. If you already have a Match Report, you are already in.',
      draft: false,
    },
    {
      q: 'Is this just another WhatsApp group?',
      a: 'No. Each opportunity is posted once on the Opportunity Board, with who can apply, the deadline and where it came from. Nothing gets buried in a chat you have to scroll past, and you can check the source before you act.',
      draft: true,
    },
    {
      q: 'What do students at partner schools get that others do not?',
      a: 'Priority access. Students at a partner school hear first about scholarships, Interschool Olympics entries and events, before these open to everyone else. The Community itself stays free for every student.',
      draft: true,
    },
    {
      q: 'Can my school enter the Interschool Olympics if it is not a partner?',
      a: 'Yes. Partner schools hear about entries first, and entries then open to every school. We announce the entry date in the Community feed.',
      draft: true,
    },
    {
      q: 'Will anything cost money?',
      a: 'Joining the Community is free, and it stays free. The Insider Community is an optional paid monthly plan. If an event or course run by someone else has a fee, the post says so before you sign up.',
      draft: true,
    },
    {
      q: 'What is the Insider Community?',
      a: 'An optional paid monthly plan for students who want to hear first. It includes a quarterly email on opportunities and news, premium information before other students get it, a members-only circle and priority.',
      draft: true,
    },
    {
      q: 'Do I have to be an Insider to use the Community?',
      a: 'No. Every student can join, follow the Opportunity Board and take part without paying. Insider is an extra for students who want to hear first.',
      draft: true,
    },
    {
      q: 'Who can become an ambassador?',
      a: 'Secondary school students who want to lead and to represent AlignTraits at their school. If you are under 18, a parent or guardian must agree before you start.',
      draft: true,
    },
  ],
};
