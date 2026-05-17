/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data (removed unused campaign/task chart data)

// Dashboard components
// removed Projects and OrdersOverview per design: simplified dashboard

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  // Show number of users per app as requested
  const kpis = {
    usersSabeel: 12450,
    usersSabeelGuide: 3820,
    usersAgences: 240,
  };

  const monthlyChart = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"],
    datasets: [
      {
        label: "Réservations",
        data: [120, 98, 140, 160, 190, 220, 240, 210, 195, 260, 275, 300],
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.12)",
        tension: 0.35,
      },
    ],
  };

  const revenueChart = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
    datasets: [
      {
        label: "Revenus",
        data: [22000, 25500, 27000, 34250, 31000, 36500],
        backgroundColor: "rgba(25, 118, 210, 0.35)",
        borderColor: "#1976d2",
        borderWidth: 1,
      },
      {
        label: "Commissions (5%)",
        data: [1100, 1275, 1350, 1712, 1550, 1825],
        backgroundColor: "rgba(46, 125, 50, 0.35)",
        borderColor: "#2e7d32",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const formatMoney = (amount) => `${amount.toLocaleString("fr-FR")} TND`;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="people"
                title="Utilisateurs - Sabeel"
                count={kpis.usersSabeel}
                percentage={{
                  color: "success",
                  amount: "+2%",
                  label: "sur 30 jours",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="support_agent"
                title="Utilisateurs - Sabeel Guide"
                count={kpis.usersSabeelGuide}
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "sur 30 jours",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="apartment"
                title="Agences"
                count={kpis.usersAgences}
                percentage={{
                  color: "success",
                  amount: "+0%",
                  label: "ce mois",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        {/* Removed campaign/site view cards and tasks charts per request */}
        <MDBox mt={1.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Statistiques mensuelles
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Évolution des réservations (Chart.js)
                    </MDTypography>
                    <MDBox mt={2}>
                      <Line data={monthlyChart} options={chartOptions} />
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            </Grid>
            <Grid item xs={12} lg={5}>
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Revenus & commissions
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Comparaison sur 6 mois (Chart.js)
                    </MDTypography>
                    <MDBox mt={2}>
                      <Bar data={revenueChart} options={chartOptions} />
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        {/* Projects and OrdersOverview removed from dashboard as requested */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
