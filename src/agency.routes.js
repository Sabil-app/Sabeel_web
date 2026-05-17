/**
  Agency-specific routes for the Sabeel Platform.
*/
import Icon from "@mui/material/Icon";

import AgencyDashboard from "layouts/agency/dashboard";
import AgencyPacks from "layouts/agency/packs";
import AgencyGuides from "layouts/agency/guides";
import AgencyGroupes from "layouts/agency/groupes";
import AgencyDepenses from "layouts/agency/depenses";
import AgencySosAlerts from "layouts/agency/sos-alerts";
import AgencyMessages from "layouts/agency/messages";
import AgencyProfile from "layouts/agency/profile";
import AgencySettings from "layouts/agency/settings";
import Notifications from "layouts/notifications";
import SignIn from "layouts/authentication/sign-in";

const agencyRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "agency-dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/agency/dashboard",
    component: <AgencyDashboard />,
  },
  {
    type: "collapse",
    name: "Packs Umrah",
    key: "agency-packs",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/agency/packs",
    component: <AgencyPacks />,
  },
  {
    type: "collapse",
    name: "Guides",
    key: "agency-guides",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/agency/guides",
    component: <AgencyGuides />,
  },
  {
    type: "collapse",
    name: "Messages & Réservations",
    key: "agency-messages",
    icon: <Icon fontSize="small">email</Icon>,
    route: "/agency/messages",
    component: <AgencyMessages />,
  },
  {
    type: "collapse",
    name: "Groupes",
    key: "agency-groupes",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/agency/groupes",
    component: <AgencyGroupes />,
  },
  {
    type: "collapse",
    name: "Dépenses",
    key: "agency-depenses",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/agency/depenses",
    component: <AgencyDepenses />,
  },
  {
    type: "collapse",
    name: "SOS Alerts",
    key: "agency-sos-alerts",
    icon: <Icon fontSize="small">report</Icon>,
    route: "/agency/sos-alerts",
    component: <AgencySosAlerts />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "agency-notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/agency/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Paramètres",
    key: "agency-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/agency/settings",
    component: <AgencySettings />,
  },
  {
    type: "collapse",
    name: "Profil",
    key: "agency-profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/agency/profile",
    component: <AgencyProfile />,
  },
  // logout route removed from agency sidebar (logout is available in the sidenav button)
];

export default agencyRoutes;
