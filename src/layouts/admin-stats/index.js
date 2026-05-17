import { useMemo } from "react";

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

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

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

function AdminStats() {
  const kpis = useMemo(
    () => ({
      agencesActives: 24,
      guidesActifs: 56,
      reservations: 281,
      revenus: 34250,
      commissions: 1712,
    }),
    []
  );

  const formatMoney = (amount) => `${amount.toLocaleString("fr-FR")} TND`;

  const monthlyChart = useMemo(
    () => ({
      labels: [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ],
      datasets: [
        {
          label: "Réservations",
          data: [120, 98, 140, 160, 190, 220, 240, 210, 195, 260, 275, 300],
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.12)",
          tension: 0.35,
        },
      ],
    }),
    []
  );

  const revenueChart = useMemo(
    () => ({
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
    }),
    []
  );

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Agences actives
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {kpis.agencesActives}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Guides actifs
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {kpis.guidesActifs}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Réservations
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {kpis.reservations}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Revenus générés
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatMoney(kpis.revenus)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Commissions gagnées
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatMoney(kpis.commissions)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Statistiques mensuelles
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Évolution des réservations (Chart.js)
                </MDTypography>
                <MDBox mt={2}>
                  <Line data={monthlyChart} options={commonOptions} />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Revenus & commissions
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Comparaison sur 6 mois (Chart.js)
                </MDTypography>
                <MDBox mt={2}>
                  <Bar data={revenueChart} options={commonOptions} />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminStats;
