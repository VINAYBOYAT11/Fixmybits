import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App";
import { LoginPage } from "./app/pages/LoginPage";
import { RegisterPage } from "./app/pages/RegisterPage";
import { ForgotPasswordPage } from "./app/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./app/pages/ResetPasswordPage";
import { ContactPage } from "./app/pages/ContactPage";

import { StartupDashboard } from "./app/pages/startup/StartupDashboard";
import { ProjectsList } from "./app/pages/startup/ProjectsList";
import { NewProject } from "./app/pages/startup/NewProject";
import { ProjectDetail as StartupProjectDetail } from "./app/pages/startup/ProjectDetail";
import { AllReports as StartupAllReports } from "./app/pages/startup/AllReports";
import { StartupProfile } from "./app/pages/startup/StartupProfile";

import { TesterDashboard } from "./app/pages/tester/TesterDashboard";
import { OpenProjects } from "./app/pages/tester/OpenProjects";
import { MyProjects } from "./app/pages/tester/MyProjects";
import { TesterProjectDetail } from "./app/pages/tester/TesterProjectDetail";
import { MyReports } from "./app/pages/tester/MyReports";
import { TesterProfilePage } from "./app/pages/tester/TesterProfile";

import { AdminDashboard } from "./app/pages/admin/AdminDashboard";
import { AdminUsers } from "./app/pages/admin/AdminUsers";
import { AdminProjects } from "./app/pages/admin/AdminProjects";
import { AdminApplications } from "./app/pages/admin/AdminApplications";
import { AdminReports } from "./app/pages/admin/AdminReports";

import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Startup Routes */}
      <Route path="/startup/dashboard" element={<StartupDashboard />} />
      <Route path="/startup/projects" element={<ProjectsList />} />
      <Route path="/startup/projects/new" element={<NewProject />} />
      <Route path="/startup/projects/:id" element={<StartupProjectDetail />} />
      <Route path="/startup/reports" element={<StartupAllReports />} />
      <Route path="/startup/profile" element={<StartupProfile />} />

      {/* Tester Routes */}
      <Route path="/tester/dashboard" element={<TesterDashboard />} />
      <Route path="/tester/projects/open" element={<OpenProjects />} />
      <Route path="/tester/projects/mine" element={<MyProjects />} />
      <Route path="/tester/projects/:id" element={<TesterProjectDetail />} />
      <Route path="/tester/reports" element={<MyReports />} />
      <Route path="/tester/profile" element={<TesterProfilePage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/projects" element={<AdminProjects />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/reports" element={<AdminReports />} />

    </Routes>
  </BrowserRouter>
);