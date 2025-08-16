import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";

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
import AdminAdminsPage from "./pages/Admin/AdminAdminsPage";
import AdminSkillsPage from "./pages/Admin/AdminSkillsPage";
import AdminFreelancersPage from "./pages/Admin/AdminFreelancersPage";
import AdminClientsPage from "./pages/Admin/AdminClientsPage";
import AdminRequestsPage from "./pages/Admin/AdminRequestsPage";
import AdminSpecialitiesPage from "./pages/Admin/AdminSpecialitiesPage";

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
import ClientNotificationPage from "./pages/Clients/ClientNotificationPage";
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
import FreelancersNotificationPage from "./pages/Freelancers/FreelancersNotificationPage";
import NotificationPage from "./pages/Freelancers/NotificationPage";
import { UserProvider } from "./contexts/UserContext";
import ClientJobDetailedPage from "./pages/Clients/ClientJobDetailedPage";
import FreelancersProposals from "./pages/Freelancers/FreelancersProposals";
import FreelancersProposalDetails from "./pages/Freelancers/FreelancersProposalDetails";
import OfferSendingPage from "./pages/Clients/OfferSendingPage";
import ClientJobOfferCheckout from "./pages/Clients/ClientJobOfferCheckout";
import ContactPage from "./pages/ContactPage";
import FreelancersJobOfferDetails from "./pages/Freelancers/FreelancersJobOfferDetails";
import BanStatusChecker from "./components/BanStatusChecker";
import RoleBasedRoute from "./components/RoleBasedRoute";

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
        <BanStatusChecker />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <HomePage />
                </ProtectedRoute>
              ) : (
                <HomePage />
              )
            }
          ></Route>

          {/* Freelancers Routing */}
          <Route
            path="/create-profile/welcome"
            element={
              <RoleBasedRoute>
                <CreateProfileWelcome />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-profile/quick-questions"
            element={
              <RoleBasedRoute>
                <QuickQuestions />
              </RoleBasedRoute>
            }
          />
          <Route 
            path="/create-profile/resume-import"
            element={
              <RoleBasedRoute>
                <ResumeImport />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-profile/categories"
            element={
              <RoleBasedRoute>
                <CategorySelection />
              </RoleBasedRoute>
            }
          />
          <Route path="/create-profile/title" element={
            <RoleBasedRoute>
              <UserTitle />
            </RoleBasedRoute>
          } />
          <Route
            path="/create-profile/experience"
            element={
              <RoleBasedRoute>
                <ExperienceSection />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-profile/education"
            element={
              <RoleBasedRoute>
                <EducationSection />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-profile/languages"
            element={
              <RoleBasedRoute>
                <LanguagesSection />
              </RoleBasedRoute>
            }
          />
          <Route path="/create-profile/skills" element={
            <RoleBasedRoute>
              <SkillsSelection />
            </RoleBasedRoute>
          } />
          <Route
            path="/create-profile/overview"
            element={
              <RoleBasedRoute>
                <BiographySection />
              </RoleBasedRoute>
            }
          />
          <Route path="/create-profile/rate" element={
            <RoleBasedRoute>
              <RateSettingSection />
            </RoleBasedRoute>
          } />
          <Route
            path="/create-profile/location"
            element={
              <RoleBasedRoute>
                <PhotoAndLocationSection />
              </RoleBasedRoute>
            }
          />
          <Route path="/create-profile/submit" element={
            <RoleBasedRoute>
              <SubmitProfile />
            </RoleBasedRoute>
          } />
          <Route
            path="/create-profile/finish"
            element={
              <RoleBasedRoute>
                <FinishProfileSection />
              </RoleBasedRoute>
            }
          />

          {/* Admin Routing */}
          <Route path="/ws/admin" element={
            <RoleBasedRoute>
              <AdminDashboard />
            </RoleBasedRoute>
          }>
            <Route path="" element={<AdminAdminsPage />} />
            <Route path="admins" element={<AdminAdminsPage />} />
            <Route path="freelancers" element={<AdminFreelancersPage />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route
              path="requests/review/:freelancerid"
              element={<AdminRequestsReviewPage />}
            />
            <Route path="specialities" element={<AdminSpecialitiesPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
          </Route>

          {/* Client Routing */}
          <Route
            path="/job-post/instant/welcome"
            element={
              <RoleBasedRoute>
                <ClientWelcomePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/title"
            element={
              <RoleBasedRoute>
                <ClientJobTitlePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/skills"
            element={
              <RoleBasedRoute>
                <ClientJobSkillSelectionPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/scope"
            element={
              <RoleBasedRoute>
                <ClientJobScopePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/budget"
            element={
              <RoleBasedRoute>
                <ClientJobBudgetPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/add-description"
            element={
              <RoleBasedRoute>
                <ClientJobDescPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/review"
            element={
              <RoleBasedRoute>
                <ClientJobReviewPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/job-post/instant/verify-email"
            element={
              <RoleBasedRoute>
                <ClientJobVerifyEmail />
              </RoleBasedRoute>
            }
          />

          {/* Job Proposals */}
          <Route
            path="/ws/proposals/job/:jobId"
            element={
              <RoleBasedRoute>
                <JobDetailsNewWindow />
              </RoleBasedRoute>
            }
          >
            <Route path="apply" element={<JobProposalApply />} />
            <Route path="edit" element={<JobProposalEdit />} />
          </Route>

          <Route
            path="/ws/proposals/:proposalId"
            element={
              <RoleBasedRoute>
                <JobProposalSubmit />
              </RoleBasedRoute>
            }
          />

          <Route path="/ws/" element={
            <RoleBasedRoute>
              <FreelancersOverview />
            </RoleBasedRoute>
          }>
            <Route path="find-work" element={<FreelancersDashboard />} />
            <Route path="messages" element={<FreelancerMessagesPage />} />
            <Route path="proposals" element={<FreelancersProposals />} />
            <Route path="notifications" element={<NotificationPage />} />
            <Route path="offers/:jobofferid" element={<FreelancersJobOfferDetails />} />
            <Route
              path="proposals/interview/uid/:jobid"
              element={<FreelancersProposalDetails />}
            />
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
              path="settings/notifications"
              element={<FreelancersNotificationPage />}
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
          <Route
            path="/ws/ai-tools/ai-portfolio-web/create"
            element={<PortfolioBuilderDashboard />}
          />
          <Route
            path="/ws/ai-tools/ai-portfolio-web"
            element={<PortfolioBuilderDashboard />}
          />
          <Route path="/ws/client/" element={
            <RoleBasedRoute>
              <ClientDashboard />
            </RoleBasedRoute>
          }>
            <Route path="dashboard" element={<ClientOverviewPage />} />
            <Route path="messages" element={<ClientMessagesPage />} />
            <Route path="info" element={<ClientInfoPage />} />
            <Route path="deposit-method" element={<ClientBillingPage />} />
            <Route path="security" element={<ClientSecurityPage />} />
            <Route path="notifications" element={<ClientNotificationsPage />} />
            <Route path="notification-alerts" element={<ClientNotificationPage />} />
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
              <Route path="archived" element={<ClientJobDetailedPage />} />
            </Route>
            <Route
              path="offer/job-application/:freelancerId"
              element={<OfferSendingPage />}
            />
            <Route
              path="payments/checkout/:jobofferid"
              element={<ClientJobOfferCheckout />}
            />
          </Route>          
        </Routes>
      </div>
    </UserProvider>
  );
};

export default App;
