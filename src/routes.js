/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Agences from "layouts/agences";
import Guides from "layouts/guides";
import AgencyPacksAdmin from "layouts/admin-agency-packs";
import AdminPackUmrahDetail from "layouts/admin-pack-umrah-detail";
import AdminFinance from "layouts/admin-finance";
import Profile from "layouts/profile";
import Messages from "layouts/messages";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/forgot-password";
import VerifyOtp from "layouts/authentication/verify-otp";
import ResetPassword from "layouts/authentication/reset-password";
import Landing from "layouts/landing";
import LandingHowItWorks from "layouts/landing/how-it-works";
import AdminReclamations from "layouts/admin-reclamations";
import AgencySettings from "layouts/agency/settings";
import Notifications from "layouts/notifications";

import TwoFactor from "layouts/authentication/2fa";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    name: "Landing",
    key: "landing",
    route: "/",
    component: <Landing />,
  },
  {
    name: "How It Works",
    key: "how-it-works",
    route: "/how-it-works",
    component: <LandingHowItWorks />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Agences",
    key: "agences",
    icon: <Icon fontSize="small">storefront</Icon>,
    route: "/tables",
    component: <Agences />,
    permission: "Gestion des Agences",
  },
  {
    type: "collapse",
    name: "Guides",
    key: "guides",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/guides",
    component: <Guides />,
    permission: "Gestion des Guides",
  },
  {
    type: "collapse",
    name: "Messages",
    key: "messages",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/messages",
    component: <Messages />,
  },
  {
    type: "collapse",
    name: "Wallet & Finances",
    key: "admin-finance",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>,
    route: "/admin/finance",
    component: <AdminFinance />,
    permission: "Voir Wallet & Finances",
  },
  {
    type: "collapse",
    name: "Réclamations",
    key: "reclamations",
    icon: <Icon fontSize="small">report_problem</Icon>,
    route: "/reclamations",
    component: <AdminReclamations />,
    permission: "Gestion des Agences",
  },
  {
    key: "admin-agency-packs",
    route: "/admin/agences/:agencyId/packs",
    component: <AgencyPacksAdmin />,
  },
  {
    key: "admin-pack-umrah-detail",
    route: "/admin/packs/:packId",
    component: <AdminPackUmrahDetail />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Paramètres",
    key: "settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/settings",
    component: <AgencySettings />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  // Déconnexion route removed from main routes (logout available in sidenav)
  // Hidden authentication routes (not shown in sidebar)
  {
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    name: "Forgot Password",
    key: "forgot-password",
    route: "/authentication/forgot-password",
    component: <ForgotPassword />,
  },
  {
    name: "Verify OTP",
    key: "verify-otp",
    route: "/authentication/verify-otp",
    component: <VerifyOtp />,
  },
  {
    name: "Reset Password",
    key: "reset-password",
    route: "/authentication/reset-password",
    component: <ResetPassword />,
  },
  {
    name: "Verify 2FA",
    key: "verify-2fa",
    route: "/authentication/verify-2fa",
    component: <TwoFactor />,
  },
];

export default routes;
