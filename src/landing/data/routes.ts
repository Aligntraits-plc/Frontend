/**
 * Link destinations used across the landing page.
 *
 * Destinations that already exist in the app point at their route (internal paths start with
 * "/" and render as react-router <Link>). "#" marks a link with no page behind it yet: replace
 * it with the route, or with a mailto: or absolute URL, when the page exists.
 */
export const ROUTES = {
  home: '/',
  /* The home page is the Students page. */
  students: '/',
  /* The public Community page. The signed-in Community feed stays at /dashboard/community. */
  community: '/community',
  login: '/login',
  checkChances: '/career-recommedation',
  freeSnapshot: '/career-recommedation',
  /* The paid match report starts from the free snapshot. */
  matchReport: '/career-recommedation',
  /* Scholarships first: money a family does not pay back. */
  fundingOptions: '/finances/scholarships',
  forSchools: '/institutions/schools',
  forUniversities: '/institutions/universities',
  tutorialCenters: '/institutions/tutorial-centres',
  requestPilot: '/institutions/request-a-pilot',
  loans: '/finances/loans',
  incomeSharePlan: '/finances/income-share-plan',
  scholarships: '/finances/scholarships',
  forInvestors: '/finances/investors',
  partnerWithAlignTraits: '/institutions/request-a-pilot',
  ambassadors: '/community/ambassadors',
} as const;
