import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboardLayout from "./layouts/admin/AdminDashboardLayout";
import Root from "./layouts/Root";
import AnalyticsTracker from "./components/AnalyticsTracker";

import SettingsLayout from "./layouts/SettingsLayout";
import WaitlistUser from "./pages/Waitlist";
import RequireRole from "./components/Admin/RequireRole";
import { ADMINS, CONTENT_TEAM, PANEL } from "./services/roles";
// Lazy imports for code splitting

const ErrorPage = lazy(() => import("./pages/ErrorPage"));
// const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Pathfinder = lazy(() => import("./pages/dashboard/Pathfinder"));
const Community = lazy(() => import("./pages/dashboard/Community"));
const CommunityHome = lazy(() => import("./components/community/CommunityHome"));
const ChannelView = lazy(() => import("./components/community/ChannelView"));
const TeamChat = lazy(() => import("./components/community/TeamChat"));
const EventsView = lazy(() => import("./components/community/EventsView"));
const Admin = lazy(() => import("./pages/admin/Index"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const Schools = lazy(() => import("./pages/admin/Schools"));
const CreateCourse = lazy(() => import("./pages/admin/CreateCourse"));
const EditSchool = lazy(() => import("./pages/admin/EditSchool"));
const SchoolCourses = lazy(() => import("./pages/admin/SchoolCourses"));
const AddCourse = lazy(() => import("./pages/admin/AddCourse"));
const CourseDetails = lazy(() => import("./pages/admin/CourseDetails"));
const DataManagement = lazy(() => import("./pages/admin/DataManagement"));
const Loans = lazy(() => import("./pages/admin/Loans"));
const BulkCenter = lazy(() => import("./pages/admin/BulkCenter"));
const ProfileManagement = lazy(() => import("./pages/admin/ProfileManagement"));
const SchoolCodes = lazy(() => import("./pages/admin/SchoolCodes"));
const CommunityAdmin = lazy(() => import("./pages/admin/CommunityAdmin"));
const Team = lazy(() => import("./pages/admin/Team"));
const PartnerSchools = lazy(() => import("./pages/admin/PartnerSchools"));
const Ambassadors = lazy(() => import("./pages/admin/Ambassadors"));
const Requests = lazy(() => import("./pages/admin/Requests"));
const AcceptInvite = lazy(() => import("./pages/invite/AcceptInvite"));
const ParentReport = lazy(() => import("./pages/ParentReport"));
const PortalLayout = lazy(() => import("./pages/school-portal/PortalLayout"));
const PortalStudents = lazy(() => import("./pages/school-portal/Students"));
const PortalInvite = lazy(() => import("./pages/school-portal/Invite"));
const PortalSeats = lazy(() => import("./pages/school-portal/Seats"));
const PortalSurvey = lazy(() => import("./pages/school-portal/Survey"));
const PortalChannel = lazy(() => import("./pages/school-portal/SchoolChannel"));
const PortalEvents = lazy(() => import("./pages/school-portal/PortalEvents"));
const PortalAccount = lazy(() => import("./pages/school-portal/PortalAccount"));
const PrintReport = lazy(() => import("./pages/school-portal/PrintReport"));
const Workshop = lazy(() => import("./pages/dashboard/Workshop"));
const AmbassadorPage2 = lazy(() => import("./pages/dashboard/Ambassador"));
const MySchool = lazy(() => import("./pages/dashboard/MySchool"));
const Classmates = lazy(() => import("./components/community/Classmates"));
const DirectChat = lazy(() => import("./components/community/DirectChat"));
const HomeSearch = lazy(() => import("./pages/HomeSearch"));
const OnboardingPage = lazy(() => import("./pages/auth/OnboardingPage"));
const GoogleAuthSuccess = lazy(() => import("./pages/auth/GoogleAuthSuccess"));
const Recommendation = lazy(() => import("./pages/Recommendation"));
const Questionaire = lazy(() => import("./pages/Questionaire"));
const CheckEligibility = lazy(() => import("./pages/CheckEligibility"));
const SelectPayment = lazy(() => import("./pages/SelectPayment"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const CareerPath = lazy(() => import("./pages/dashboard/CareerPath"));
const SchoolPage = lazy(() => import("./pages/dashboard/SchoolPage"));
const AccountSettings = lazy(() => import("./pages/dashboard/AccountSettings"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const AccountRecords = lazy(() => import("./pages/dashboard/AccountRecords"));
const SecurityManagement = lazy(
  () => import("./pages/dashboard/SecurityManagement"),
);
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const SignUpTwo = lazy(() => import("./pages/auth/RegisterTwo"));
const Subscription = lazy(() => import("./pages/dashboard/Subscription"));
const Page404 = lazy(() => import("./pages/404"));
const SetupPassword = lazy(() => import("./pages/auth/SetupPassword"));
const UsersList = lazy(() => import("./pages/admin/Users"));
const Waitlist = lazy(() => import("./pages/admin/Waitlist"));
const TermsAndCondtion = lazy(() => import("./pages/TermsAndCondiotion"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const LandingPage = lazy(() => import("./landing/LandingPage"));
const LoanPage = lazy(() => import("./landing/loan/LoanPage"));
const ScholarshipsPage = lazy(() => import("./landing/finance/scholarships/ScholarshipsPage"));
const IncomeSharePage = lazy(() => import("./landing/finance/income-share/IncomeSharePage"));
const InvestorsPage = lazy(() => import("./landing/finance/investors/InvestorsPage"));
const CommunityPage = lazy(() => import("./landing/community/CommunityPage"));
const AmbassadorPage = lazy(() => import("./landing/community/ambassador/AmbassadorPage"));
const SchoolsPage = lazy(() => import("./landing/institutions/schools/SchoolsPage"));
const UniversitiesPage = lazy(() => import("./landing/institutions/universities/UniversitiesPage"));
const TutorialCentresPage = lazy(() => import("./landing/institutions/tutorial-centres/TutorialCentresPage"));
const PilotPage = lazy(() => import("./landing/institutions/pilot/PilotPage"));

// The landing page lives at "/". Anyone already signed in (the session lasts 30 days)
// goes straight to their dashboard, as the old home page did.
function LandingOrDashboard() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/signup-two", element: <SignUpTwo /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/email-verify", element: <VerifyEmail /> },
  {
    path: "/reset-password",
    element: <ResetPassword title="Reset password" />,
  },
  {
    path: "/setup-password",
    element: <SetupPassword title="Setup password" />,
  },
  { path: "/auth/success", element: <GoogleAuthSuccess /> },
  { path: "/search", element: <HomeSearch /> },
  { path: "/waitlist", element: <WaitlistUser /> },
  { path: "/career-recommedation", element: <Recommendation /> },
  { path: "/questionaire", element: <Questionaire /> },
  { path: "/invite/:token", element: <AcceptInvite /> },
  { path: "/report/:token", element: <ParentReport /> },
  {
    path: "/school-portal",
    element: <PortalLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PortalStudents /> },
      { path: "students/:id", element: <PortalStudents /> },
      { path: "students/:id/report", element: <PrintReport /> },
      { path: "invite", element: <PortalInvite /> },
      { path: "seats", element: <PortalSeats /> },
      { path: "survey", element: <PortalSurvey /> },
      { path: "community", element: <PortalChannel /> },
      { path: "events", element: <PortalEvents /> },
      { path: "account", element: <PortalAccount /> },
    ],
  },
  { path: "/make-payment", element: <PaymentPage /> },
  { path: "/select-payment", element: <SelectPayment /> },
  { path: "/payment/callback", element: <PaymentCallback /> },
  { path: "/check-eligibility/:courseId", element: <CheckEligibility /> },
  { path: "/terms-and-conditions", element: <TermsAndCondtion /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/refund-policy", element: <RefundPolicy /> },
  // { path: "/not-found", element: <Page404 /> },
  // Public course details (protected inside component)
  // { path: "/course-details/:courseId", element: <CourseDetailsPage /> },
  { path: "/landing", element: <Navigate to="/" replace /> },
  { path: "/finances/loans", element: <LoanPage /> },
  { path: "/finances/scholarships", element: <ScholarshipsPage /> },
  { path: "/finances/income-share-plan", element: <IncomeSharePage /> },
  { path: "/finances/investors", element: <InvestorsPage /> },
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/ambassadors", element: <AmbassadorPage /> },
  { path: "/institutions/schools", element: <SchoolsPage /> },
  { path: "/institutions/universities", element: <UniversitiesPage /> },
  { path: "/institutions/tutorial-centres", element: <TutorialCentresPage /> },
  { path: "/institutions/request-a-pilot", element: <PilotPage /> },
  { index: true, element: <LandingOrDashboard /> },

  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [{ path: "onboarding-form", element: <OnboardingPage /> }],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "pathfinder", element: <Pathfinder /> },
      {
        path: "community",
        element: <Community />,
        children: [
          { index: true, element: <CommunityHome /> },
          { path: "c/:slug", element: <ChannelView /> },
          { path: "team", element: <TeamChat /> },
          { path: "events", element: <EventsView /> },
          { path: "classmates", element: <Classmates /> },
          { path: "dm/:id", element: <DirectChat /> },
        ],
      },
      { path: "career-pathway", element: <CareerPath /> },
      { path: "progres-tracker", element: <Navigate to="/dashboard" replace /> },
      { path: "school", element: <SchoolPage /> },
      { path: "skill-roadmap", element: <Navigate to="/dashboard/workshop" replace /> },
      { path: "workshop", element: <Workshop /> },
      { path: "ambassador", element: <AmbassadorPage2 /> },

      {
        path: "settings",
        element: <SettingsLayout />, // <-- Add this line
        children: [
          { index: true, element: <AccountSettings /> }, // /dashboard/settings
          { path: "profile", element: <Profile /> }, // /dashboard/settings/profile
          { path: "records", element: <AccountRecords /> }, // /dashboard/settings/records
          { path: "security", element: <SecurityManagement /> }, // /dashboard/settings/security
          { path: "subscription", element: <Subscription /> },
          { path: "school", element: <MySchool /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <AdminDashboardLayout />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <RequireRole roles={ADMINS}><Admin /></RequireRole> },
          { path: "accounts", element: <RequireRole roles={PANEL}><ProfileManagement /></RequireRole> },
          { path: "requests", element: <RequireRole roles={ADMINS}><Requests /></RequireRole> },
          { path: "team", element: <RequireRole roles={["SUPER_ADMIN"]}><Team /></RequireRole> },
          { path: "partner-schools", element: <RequireRole roles={ADMINS}><PartnerSchools /></RequireRole> },
          { path: "ambassadors", element: <RequireRole roles={ADMINS}><Ambassadors /></RequireRole> },
          { path: "bulk-center", element: <RequireRole roles={CONTENT_TEAM}><BulkCenter /></RequireRole> },
          { path: "loans", element: <RequireRole roles={ADMINS}><Loans /></RequireRole> },
          { path: "data-management", element: <RequireRole roles={PANEL}><DataManagement /></RequireRole> },
          { path: "waitlist", element: <RequireRole roles={ADMINS}><Waitlist /></RequireRole> },
          { path: "school-codes", element: <RequireRole roles={ADMINS}><SchoolCodes /></RequireRole> },
          { path: "community", element: <RequireRole roles={CONTENT_TEAM}><CommunityAdmin /></RequireRole> },
          { path: "users", element: <RequireRole roles={ADMINS}><UsersList /></RequireRole> },
          { path: "schools", element: <RequireRole roles={CONTENT_TEAM}><Schools /></RequireRole> },
          { path: "schools/:schoolId/courses", element: <RequireRole roles={CONTENT_TEAM}><SchoolCourses /></RequireRole> },
          { path: "schools/:schoolId/add-course", element: <RequireRole roles={CONTENT_TEAM}><AddCourse /></RequireRole> },
          {
            path: "schools/:schoolId/course-details/:courseId",
            element: <RequireRole roles={CONTENT_TEAM}><CourseDetails /></RequireRole>,
          },
          { path: "schools/create-course", element: <RequireRole roles={CONTENT_TEAM}><CreateCourse /></RequireRole> },
          { path: "schools/edit-school", element: <RequireRole roles={CONTENT_TEAM}><EditSchool /></RequireRole> },
        ],
      },
      { path: "login", element: <AdminLogin /> },
      { path: "forgot-password", element: <ForgotPassword fromAdmin={true} /> },
    ],
  },
  {
    path: "*",
    element: <Page404 />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f8fb]">
            <svg
              className="animate-spin h-12 w-12 text-[#004085] mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-[#004085] text-lg font-semibold animate-pulse">
              Loading, please wait...
            </span>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <AnalyticsTracker router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
