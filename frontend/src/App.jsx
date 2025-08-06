import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import CreateProfileWelcome from "./pages/Freelancers/CreateProfileWelcome";
import QuickQuestions from "./pages/Freelancers/QuickQuestions";
import ResumeImport from "./pages/Freelancers/ResumeImport";
import CategorySelection from "./pages/Freelancers/CategorySelection";
import UserTitle from "./pages/Freelancers/UserTitle";
import ExperienceSection from "./pages/Freelancers/ExperienceSection";
import EducationSection from "./pages/Freelancers/EducationSection";
import LanguagesSection from "./pages/Freelancers/LanguagesSection";
import SkillsSelection from "./pages/Freelancers/SkillsSelection";
import BiographySection from "./pages/Freelancers/BiographySection";
import RateSettingSection from "./pages/Freelancers/RateSettingSection";
import PhotoAndLocationSection from "./pages/Freelancers/PhotoAndLocationSection";
import SubmitProfile from "./pages/Freelancers/SubmitProfile";
import FinishProfileSection from "./pages/Freelancers/FinishProfileSection";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSkillsPage from "./pages/Admin/AdminSkillsPage";
import AdminFreelancersPage from "./pages/Admin/AdminFreelancersPage";
import AdminClientsPage from "./pages/Admin/AdminClientsPage";
import AdminRequestsPage from "./pages/Admin/AdminRequestsPage";
import AdminSpecialitiesPage from "./pages/Admin/AdminSpecialitiesPage";
import AdminOverviewPage from "./pages/Admin/AdminOverviewPage";
import AdminRequestsReviewPage from "./pages/Admin/AdminRequestsReviewPage";
import ClientWelcomePage from "./pages/Clients/ClientWelcomePage";
import ClientJobTitlePage from "./pages/Clients/ClientJobTitlePage";
import ClientJobSkillSelectionPage from "./pages/Clients/ClientJobSkillSelectionPage";
import ClientJobScopePage from "./pages/Clients/ClientJobScopePage";
import ClientJobBudgetPage from "./pages/Clients/ClientJobBudgetPage";
import ClientJobDescPage from "./pages/Clients/ClientJobDescPage";
import ClientJobReviewPage from "./pages/Clients/ClientJobReviewPage";
import ClientJobVerifyEmail from "./pages/Clients/ClientJobVerifyEmail";
import ClientDashboard from "./pages/Clients/ClientDashboard";
import JobDetailsNewWindow from "./pages/Freelancers/JobDetailsNewWindow";
import JobProposalApply from "./pages/Freelancers/JobProposalApply";
import JobProposalSubmit from "./pages/Freelancers/JobProposalSubmit";
import JobProposalEdit from "./pages/Freelancers/JobProposalEdit";
import axios from "axios";
import { RefreshHandler } from "./RefreshHandler";
import ProtectedRoute from "./ProtectedRoute";
import FreelancersDashboard from "./pages/Freelancers/FreelancersDashboard";
import ClientOverviewPage from "./pages/Clients/ClientOverviewPage";
import ClientMessagesPage from "./pages/Clients/ClientMessagesPage";
import ClientInfoPage from "./pages/Clients/ClientInfoPage";
import ClientBillingPage from "./pages/Clients/ClientBillingPage";
import ClientSecurityPage from "./pages/Clients/ClientSecurityPage";
import ClientNotificationsPage from "./pages/Clients/ClientNotificationsPage";
import ClientPasswordAndSecurityPage from "./pages/Clients/ClientPasswordAndSecurityPage";
import FreelancerMessagesPage from "./pages/Freelancers/FreelancerMessagesPage";
import AiToolsOverview from "./pages/Freelancers/AiToolsOverview";
import FreelancersOverview from "./pages/Freelancers/FreelancersOverview";
import ResumeBuilderDashboard from "./pages/Freelancers/Resume-Builder/ResumeBuilderDashboard";
import PortfolioBuilderDashboard from "./pages/Freelancers/PortfolioWeb-Builder/PortfolioBuilderDashboard";
import ResumeBuilderEditor from "./pages/Freelancers/Resume-Builder/ResumeBuilderEditor";
import TarzDashboard from "./pages/TARZ/TarzDashboard";
import FreelancersContactInfo from "./pages/Freelancers/FreelancersContactInfo";
import BillingAndPaymentsPage from "./pages/Freelancers/BillingAndPaymentsPage";
import FreelancersProfileSettings from "./pages/Freelancers/FreelancersProfileSettings";
import PasswordAndSecurityPage from "./pages/Freelancers/PasswordAndSecurityPage";
import FreelancersProfilePage from "./pages/Freelancers/FreelancersProfilePage";
import { UserProvider } from "./contexts/UserContext";
import ClientJobDetailedPage from "./pages/Clients/ClientJobDetailedPage";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify/",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <UserProvider>
      <div>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardPage />
              </ProtectedRoute>
            ) : (
              <HomePage />
            )
          }
        ></Route>

        {/* Freelancers Routing */}
        <Route
          path="/create-profile/welcome"
          element={<CreateProfileWelcome />}
        />
        <Route
          path="/create-profile/quick-questions"
          element={<QuickQuestions />}
        />
        <Route
          path="/create-profile/resume-import"
          element={<ResumeImport />}
        />
        <Route
          path="/create-profile/categories"
          element={<CategorySelection />}
        />
        <Route path="/create-profile/title" element={<UserTitle />} />
        <Route
          path="/create-profile/experience"
          element={<ExperienceSection />}
        />
        <Route
          path="/create-profile/education"
          element={<EducationSection />}
        />
        <Route
          path="/create-profile/languages"
          element={<LanguagesSection />}
        />
        <Route path="/create-profile/skills" element={<SkillsSelection />} />
        <Route path="/create-profile/overview" element={<BiographySection />} />
        <Route path="/create-profile/rate" element={<RateSettingSection />} />
        <Route
          path="/create-profile/location"
          element={<PhotoAndLocationSection />}
        />
        <Route path="/create-profile/submit" element={<SubmitProfile />} />
        <Route
          path="/create-profile/finish"
          element={<FinishProfileSection />}
        />

        {/* Admin Routing */}
        <Route path="/ws/admin" element={<AdminDashboard />}>
          <Route path="" element={<AdminOverviewPage />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="freelancers" element={<AdminFreelancersPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
          <Route
            path="requests/review/:userId"
            element={<AdminRequestsReviewPage />}
          />
          <Route path="specialities" element={<AdminSpecialitiesPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
        </Route>

        {/* Client Routing */}
        <Route
          path="/job-post/instant/welcome"
          element={<ClientWelcomePage />}
        />
        <Route
          path="/job-post/instant/title"
          element={<ClientJobTitlePage />}
        />
        <Route
          path="/job-post/instant/skills"
          element={<ClientJobSkillSelectionPage />}
        />
        <Route
          path="/job-post/instant/scope"
          element={<ClientJobScopePage />}
        />
        <Route
          path="/job-post/instant/budget"
          element={<ClientJobBudgetPage />}
        />
        <Route
          path="/job-post/instant/add-description"
          element={<ClientJobDescPage />}
        />
        <Route
          path="/job-post/instant/review"
          element={<ClientJobReviewPage />}
        />
        <Route
          path="/job-post/instant/verify-email"
          element={<ClientJobVerifyEmail />}
        />
        

        {/* Job Proposals */}
        <Route
          path="/ws/proposals/job/:jobId"
          element={<JobDetailsNewWindow />}
        >
          <Route path="apply" element={<JobProposalApply />} />
          <Route path="edit" element={<JobProposalEdit />} />
        </Route>

        <Route
          path="/ws/proposals/:proposalId"
          element={<JobProposalSubmit />}
        />

        <Route path="/ws/" element={<FreelancersOverview />}>
          <Route path="find-work" element={<FreelancersDashboard />} />
          <Route path="messages" element={<FreelancerMessagesPage />} />
          <Route path="ai-tools" element={<AiToolsOverview />}>
            <Route path="ai-resume" element={<ResumeBuilderDashboard />} />
            <Route
              path="ai-resume/:resumeId"
              element={<ResumeBuilderEditor />}
            />
            <Route
              path="ai-portfolio-web"
              element={<PortfolioBuilderDashboard />}
            />
          </Route>
          <Route path="apps/tarz" element={<TarzDashboard />} />
          <Route
            path="settings/contact-info"
            element={<FreelancersContactInfo />}
          />
          <Route
            path="settings/profile"
            element={<FreelancersProfileSettings />}
          />
          <Route
            path="settings/password-and-security"
            element={<PasswordAndSecurityPage />}
          />
          <Route
            path="payments/billing-methods"
            element={<BillingAndPaymentsPage />}
          />
          <Route
            path="freelancers/:freelancerId"
            element={<FreelancersProfilePage />}
          />
        </Route>
        <Route path="/ws/client/" element={<ClientDashboard />}>
          <Route path="dashboard" element={<ClientOverviewPage />} />
          <Route path="messages" element={<ClientMessagesPage />} />
          <Route path="info" element={<ClientInfoPage />} />
          <Route path="deposit-method" element={<ClientBillingPage />} />
          <Route path="security" element={<ClientSecurityPage />} />
          <Route path="notifications" element={<ClientNotificationsPage />} />
          <Route path="applicants/:jobid" element={<ClientJobDetailedPage />}>
            <Route path="job-details" element={<ClientJobDetailedPage />} />
            <Route path="suggested" element={<ClientJobDetailedPage />} />
            <Route path="invites" element={<ClientJobDetailedPage />} />
            <Route path="hires" element={<ClientJobDetailedPage />} />     
            <Route path="proposals" element={<ClientJobDetailedPage />} />
                          <Route path="shortlisted" element={<ClientJobDetailedPage />} />
              <Route path="messaged" element={<ClientJobDetailedPage />} />
              <Route path="offers" element={<ClientJobDetailedPage />} />
              <Route path="hired" element={<ClientJobDetailedPage />} />
          </Route>
        </Route>
      </Routes>
      </div>
    </UserProvider>
  );
};

export default App;
