import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useNavigate } from "react-router-dom";

import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";
import {
  fetchAgencyPackUmrah,
  fetchAgencyGuides,
  fetchGroups,
  fetchConfirmedPilgrims,
  fetchWalletTransactions,
} from "auth/adminAgenceAuth";
import { fetchAgencyReservations, fetchMyConversations } from "api/reservationMessagingApi";
import { fetchAgencySosAlerts } from "api/sosApi";

ChartJS.register(ArcElement, Tooltip, Legend);

function AgencyDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activePacks: 0,
    guides: 0,
    assignedGuides: 0,
    registeredPilgrims: 0,
    pendingPilgrims: 0,
    conversations: 0,
    walletPending: 0,
    openSosAlerts: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [packs, guides, groups, confirmed, reservations, conversations, walletTx, sosAlerts] =
        await Promise.all([
          fetchAgencyPackUmrah().catch(() => []),
          fetchAgencyGuides().catch(() => []),
          fetchGroups().catch(() => []),
          fetchConfirmedPilgrims().catch(() => []),
          fetchAgencyReservations().catch(() => []),
          fetchMyConversations().catch(() => []),
          fetchWalletTransactions(100, 0).catch(() => ({ items: [] })),
          fetchAgencySosAlerts().catch(() => []),
        ]);

      if (!mounted) return;

      const packsArr = Array.isArray(packs) ? packs : packs?.packs || [];
      const guidesArr = Array.isArray(guides) ? guides : guides?.guides || [];
      const groupsArr = Array.isArray(groups) ? groups : [];
      const confirmedArr = Array.isArray(confirmed) ? confirmed : [];
      const reservationsArr = Array.isArray(reservations) ? reservations : [];
      const conversationsArr = Array.isArray(conversations) ? conversations : [];
      const walletItems = Array.isArray(walletTx?.items) ? walletTx.items : [];

      const activePacks = packsArr.filter((p) => p?.status === "approved" && !p?.isArchived).length;

      const assignedGuides = new Set(
        groupsArr.filter((g) => g?.guideId && g?.status !== "archived").map((g) => g.guideId)
      ).size;

      const pendingPilgrims = reservationsArr.filter((r) => r?.status === "pending").length;

      const walletPending = walletItems.filter(
        (t) => t?.type === "WITHDRAWAL_REQUEST" && t?.status === "PENDING"
      ).length;

      const sosArr = Array.isArray(sosAlerts) ? sosAlerts : [];
      const openSosAlerts = sosArr.filter(
        (a) => a?.status === "nouveau" || a?.status === "en_cours"
      ).length;

      setStats({
        activePacks,
        guides: guidesArr.length,
        assignedGuides,
        registeredPilgrims: confirmedArr.length,
        pendingPilgrims,
        conversations: conversationsArr.length,
        walletPending,
        openSosAlerts,
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const kpiStats = useMemo(() => {
    const raw = [
      {
        title: "Packs Actifs",
        value: stats.activePacks,
        color: "#0b8f55",
        bg: "rgba(27,94,32,0.09)",
        icon: "inventory_2",
      },
      {
        title: "Nombre de Guides",
        value: stats.guides,
        color: "#1e88e5",
        bg: "rgba(46,125,50,0.09)",
        icon: "badge",
      },
      {
        title: "Guides Assignés",
        value: stats.assignedGuides,
        color: "#8e24aa",
        bg: "rgba(30,142,62,0.09)",
        icon: "support_agent",
      },
      {
        title: "Pèlerins Inscrits",
        value: stats.registeredPilgrims,
        color: "#fb8c00",
        bg: "rgba(67,160,71,0.09)",
        icon: "group",
      },
      {
        title: "Pèlerins en demande",
        value: stats.pendingPilgrims,
        color: "#e53935",
        bg: "rgba(25,118,210,0.09)",
        icon: "pending_actions",
      },
    ];
    const total = raw.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
    return raw.map((s) => ({
      ...s,
      percent: total > 0 ? Math.round((s.value / total) * 100) : 0,
    }));
  }, [stats]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const quickActions = [
    {
      title: "Créer un Pack",
      desc: "Lancer une nouvelle offre Umrah",
      icon: "add_box",
      bg: "linear-gradient(135deg, #1b5e20 0%, #43a047 100%)",
      route: "/agency/packs",
    },
    {
      title: "Nouveau Groupe",
      desc: "Organiser vos pèlerins",
      icon: "group_add",
      bg: "linear-gradient(135deg, #0f3d14 0%, #1b5e20 100%)",
      route: "/agency/pelerins",
    },
    {
      title: "Valider un Dossier",
      desc: "Finaliser les inscriptions",
      icon: "verified",
      bg: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
      route: "/agency/pelerins",
    },
  ];

  const totalPilgrims = stats.registeredPilgrims + stats.pendingPilgrims;

  const doughnutData = {
    labels: kpiStats.map((s) => s.title),
    datasets: [
      {
        data: kpiStats.map((s) => (Number.isFinite(s.percent) ? s.percent : 0)),
        backgroundColor: kpiStats.map((s) => s.color),
        borderColor: "rgba(255,255,255,0.95)",
        borderWidth: 5,
        spacing: 5,
        borderRadius: 12,
        hoverOffset: 2,
        cutout: "56%",
      },
    ],
  };

  const segmentLabelsPlugin = {
    id: "segmentLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      meta.data.forEach((arc, i) => {
        const stat = kpiStats[i];
        if (!stat) return;
        const { startAngle, endAngle, innerRadius, outerRadius } = arc;
        const midAngle = (startAngle + endAngle) / 2;
        const midRadius = (innerRadius + outerRadius) / 2;
        const cx = arc.x + Math.cos(midAngle) * midRadius;
        const cy = arc.y + Math.sin(midAngle) * midRadius;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 3;

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 14px Inter, system-ui, Segoe UI, Roboto, Arial";
        ctx.fillText(`${stat.value}`, cx, cy - 8);

        ctx.font = "600 10px Inter, system-ui, Segoe UI, Roboto, Arial";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(`${stat.percent}%`, cx, cy + 8);

        ctx.restore();
      });
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 650 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    rotation: -90,
  };

  return (
    <AgencyPageShell>
      {/* ---------- Premium Hero ---------- */}
      <MDBox className="agency-hero reveal-up" mb={4}>
        <MDBox
          display="flex"
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDBox className="agency-icon-chip">
              <Icon sx={{ color: "white !important", fontSize: "24px !important" }}>dashboard</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                className="agency-hero__title"
                variant="h4"
                color="white"
                sx={{ textTransform: "capitalize" }}
              >
                Bienvenue sur votre Espace Agence
              </MDTypography>
              <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                {today} &nbsp;·&nbsp; Supervision en temps réel de votre activité Umrah
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card className="reveal-up" sx={{ height: "100%" }}>
            <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold" color="dark">
                  Statistiques
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Un seul aperçu, 5 indicateurs essentiels
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDBox
              px={3}
              pb={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ minHeight: { xs: 280, md: 320 } }}
            >
              <MDBox
                position="relative"
                sx={{
                  width: { xs: 230, md: 270 },
                  height: { xs: 230, md: 270 },
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(67,160,71,0.14), rgba(0,0,0,0.02) 55%, rgba(0,0,0,0.00) 70%)",
                }}
              >
                <MDBox
                  position="absolute"
                  left={0}
                  top={0}
                  width="100%"
                  height="100%"
                  sx={{ p: 1.2 }}
                >
                  <Doughnut
                    data={doughnutData}
                    options={doughnutOptions}
                    plugins={[segmentLabelsPlugin]}
                  />
                </MDBox>

                <MDBox
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{
                    transform: "translate(-50%, -50%)",
                    width: "48%",
                    textAlign: "center",
                  }}
                >
                  <MDTypography variant="button" fontWeight="medium" color="text">
                    Total pèlerins
                  </MDTypography>
                  <MDTypography variant="h3" fontWeight="bold" color="dark" sx={{ lineHeight: 1 }}>
                    {totalPilgrims}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>

            <MDBox px={3} pb={3}>
              <Grid container spacing={1.5}>
                {kpiStats.map((stat) => (
                  <Grid item xs={12} sm={6} key={stat.title}>
                    <MDBox
                      display="flex"
                      alignItems="center"
                      gap={1.25}
                      px={1.5}
                      py={1}
                      borderRadius="xl"
                      sx={{
                        background: stat.bg,
                        border: `1px solid ${stat.color}22`,
                        minHeight: 56,
                      }}
                    >
                      <MDBox
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          backgroundColor: stat.color,
                          flexShrink: 0,
                          boxShadow: `0 0 0 4px ${stat.color}1a`,
                        }}
                      />
                      <MDBox>
                        <MDTypography variant="caption" color="text" display="block">
                          {stat.title}
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="bold" color="dark">
                          {stat.value} · {stat.percent}%
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="reveal-up" sx={{ height: "100%" }}>
            <MDBox
              p={3}
              pb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              gap={2}
            >
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold">
                  Priorités du jour
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Accès rapide aux zones sensibles
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDBox px={3} pb={3} display="flex" flexDirection="column" gap={1.25}>
              <MDBox
                onClick={() => navigate("/agency/sos-alerts")}
                sx={{
                  p: 1.6,
                  borderRadius: "16px",
                  cursor: "pointer",
                  border: "1px solid rgba(239, 83, 80, 0.14)",
                  background:
                    "linear-gradient(180deg, rgba(239, 83, 80, 0.10), rgba(239, 83, 80, 0.03))",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 34px rgba(239,83,80,0.14)",
                  },
                }}
              >
                <MDBox display="flex" alignItems="center" gap={1.25}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(239, 83, 80, 0.16)",
                    }}
                  >
                    <Icon sx={{ color: "#ef5350 !important" }}>report_problem</Icon>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="dark" display="block">
                      SOS & Réclamations
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Traiter les alertes en attente
                    </MDTypography>
                  </MDBox>
                  <MDBox ml="auto" display="flex" alignItems="center" gap={0.75}>
                    <MDBox
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: "20px",
                        backgroundColor: "rgba(239,83,80,0.10)",
                      }}
                    >
                      <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#ef5350" }}>
                        {stats.openSosAlerts}
                      </MDTypography>
                    </MDBox>
                    <Icon sx={{ color: "#ef5350 !important" }}>chevron_right</Icon>
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox
                onClick={() => navigate("/agency/depenses")}
                sx={{
                  p: 1.6,
                  borderRadius: "16px",
                  cursor: "pointer",
                  border: "1px solid rgba(27,94,32,0.12)",
                  background:
                    "linear-gradient(180deg, rgba(27, 94, 32, 0.08), rgba(27, 94, 32, 0.02))",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 34px rgba(27,94,32,0.12)",
                  },
                }}
              >
                <MDBox display="flex" alignItems="center" gap={1.25}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(27, 94, 32, 0.12)",
                    }}
                  >
                    <Icon sx={{ color: "#1b5e20 !important" }}>account_balance_wallet</Icon>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="dark" display="block">
                      Wallet & Dépenses
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Suivre les avances & retraits
                    </MDTypography>
                  </MDBox>
                  <MDBox ml="auto" display="flex" alignItems="center" gap={0.75}>
                    <MDBox
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: "20px",
                        backgroundColor: "rgba(27,94,32,0.10)",
                      }}
                    >
                      <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#1b5e20" }}>
                        {stats.walletPending}
                      </MDTypography>
                    </MDBox>
                    <Icon sx={{ color: "#1b5e20 !important" }}>chevron_right</Icon>
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox
                onClick={() => navigate("/agency/messages")}
                sx={{
                  p: 1.6,
                  borderRadius: "16px",
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.01))",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <MDBox display="flex" alignItems="center" gap={1.25}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Icon sx={{ color: "#1a1a1a !important" }}>chat</Icon>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="dark" display="block">
                      Messages
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Répondre aux demandes
                    </MDTypography>
                  </MDBox>
                  <MDBox ml="auto" display="flex" alignItems="center" gap={0.75}>
                    <MDBox
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: "20px",
                        backgroundColor: "rgba(0,0,0,0.07)",
                      }}
                    >
                      <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
                        {stats.conversations}
                      </MDTypography>
                    </MDBox>
                    <Icon sx={{ color: "#1a1a1a !important" }}>chevron_right</Icon>
                  </MDBox>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        {quickActions.map((action, idx) => (
          <Grid item xs={12} md={4} key={action.title}>
            <Card
              className={`reveal-up reveal-up-${idx + 1}`}
              onClick={() => navigate(action.route)}
              sx={{
                p: 2.2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                userSelect: "none",
                transition: "transform 220ms ease, box-shadow 220ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 18px 38px rgba(0,0,0,0.08)",
                },
              }}
            >
              <MDBox
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: action.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 22px -10px rgba(27,94,32,0.5)",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ color: "white !important", fontSize: "24px !important" }}>
                  {action.icon}
                </Icon>
              </MDBox>
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold">
                  {action.title}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  {action.desc}
                </MDTypography>
              </MDBox>
              <MDBox ml="auto">
                <Icon sx={{ color: "#1b5e20 !important" }}>chevron_right</Icon>
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AgencyPageShell>
  );
}

export default AgencyDashboard;
