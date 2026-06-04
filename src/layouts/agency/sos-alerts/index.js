import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";
import {
  fetchAgencySosAlerts,
  updateAgencySosAlertStatus,
  addAgencySosAlertNote,
} from "api/sosApi";

function AgencySosAlerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");
  const [detailsAlert, setDetailsAlert] = useState(null);
  const [noteDialog, setNoteDialog] = useState({ open: false, id: null, text: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    id: null,
  });
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });
  const [menuState, setMenuState] = useState({ anchorEl: null, alertId: null });

  const loadAlerts = async () => {
    try {
      setLoadError("");
      const data = await fetchAgencySosAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[SOS] load failed", error);
      setLoadError(error?.message || "Impossible de charger les alertes SOS.");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Refresh relative time labels every 20s
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 20 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (isoString) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return `il y a ${Math.floor(diff / 86400)} j`;
  };

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      nouveau: alerts.filter((a) => a.status === "nouveau").length,
      en_cours: alerts.filter((a) => a.status === "en_cours").length,
      resolu: alerts.filter((a) => a.status === "résolu").length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const search_lc = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (filter !== "tous" && a.status !== filter) return false;
      if (!search_lc) return true;
      return (
        (a.pilgrimName || "").toLowerCase().includes(search_lc) ||
        (a.guideName || "").toLowerCase().includes(search_lc) ||
        (a.group?.name || "").toLowerCase().includes(search_lc) ||
        (a.title || "").toLowerCase().includes(search_lc) ||
        (a.location?.address || "").toLowerCase().includes(search_lc)
      );
    });
  }, [alerts, filter, search]);

  const handleMarkInProgress = async (id) => {
    try {
      const { alert } = await updateAgencySosAlertStatus(id, "en_cours");
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setToast({ open: true, type: "info", text: "Alerte marquée en cours." });
    } catch (error) {
      setToast({ open: true, type: "error", text: error?.message || "Échec de la mise à jour." });
    }
  };

  const handleResolve = async (id) => {
    try {
      const { alert } = await updateAgencySosAlertStatus(id, "résolu");
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setToast({ open: true, type: "success", text: "Alerte résolue avec succès." });
    } catch (error) {
      setToast({ open: true, type: "error", text: error?.message || "Échec de la résolution." });
    }
  };

  const requestAction = (action, id) => {
    setConfirmDialog({ open: true, action, id });
  };

  const handleConfirmAction = () => {
    const { action, id } = confirmDialog;
    if (action === "in_progress") handleMarkInProgress(id);
    if (action === "resolve") handleResolve(id);
    setConfirmDialog({ open: false, action: null, id: null });
  };

  const handleOpenMap = (loc) => {
    window.open(
      `https://www.google.com/maps?q=${loc.lat},${loc.lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenMenu = (event, alertId) => {
    setMenuState({ anchorEl: event.currentTarget, alertId });
  };

  const handleCloseMenu = () => {
    setMenuState({ anchorEl: null, alertId: null });
  };

  const handleContactGuide = (guideName) => {
    navigate("/agency/messages", { state: { contactCompanion: guideName } });
  };

  const handleAddNote = async () => {
    if (!noteDialog.text.trim()) return;
    try {
      const { alert } = await addAgencySosAlertNote(noteDialog.id, noteDialog.text.trim());
      setAlerts((prev) => prev.map((a) => (a.id === noteDialog.id ? alert : a)));
      setNoteDialog({ open: false, id: null, text: "" });
      setToast({ open: true, type: "success", text: "Note ajoutée au dossier." });
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        text: error?.message || "Échec de l'ajout de la note.",
      });
    }
  };

  const filterButtonSx = (key) => ({
    px: 2.5,
    color: "white !important",
    backgroundColor: filter === key ? "#1a1a1a !important" : "transparent !important",
    boxShadow: filter === key ? 1 : 0,
    opacity: filter === key ? 1 : 0.7,
  });

  const timelineIcon = (type) => {
    if (type === "alert") return { icon: "report", color: "#ef5350" };
    if (type === "progress") return { icon: "autorenew", color: "#ffb300" };
    if (type === "resolved") return { icon: "check_circle", color: "#4CAF50" };
    return { icon: "sticky_note_2", color: "#1976d2" };
  };

  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox
          display="flex"
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          flexDirection={{ xs: "column", md: "row" }}
          flexWrap="wrap"
          gap={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDBox className="agency-icon-chip">
              <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>emergency</Icon>
            </MDBox>
            <MDBox>
              <MDTypography className="agency-hero__title" variant="h5" color="white">
                SOS Alertes
              </MDTypography>
              <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                Alertes SOS déclenchées par vos pèlerins (position GPS et dossier groupe).
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <MDInput
              size="small"
              placeholder="Recherche ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": { borderColor: "white" },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
            <MDBox
              display="flex"
              p={0.5}
              borderRadius="12px"
              sx={{
                backgroundColor: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <MDButton onClick={() => setFilter("tous")} sx={filterButtonSx("tous")}>
                Toutes
              </MDButton>
              <MDButton onClick={() => setFilter("nouveau")} sx={filterButtonSx("nouveau")}>
                Nouveau
              </MDButton>
              <MDButton onClick={() => setFilter("en_cours")} sx={filterButtonSx("en_cours")}>
                En cours
              </MDButton>
              <MDButton onClick={() => setFilter("résolu")} sx={filterButtonSx("résolu")}>
                Résolu
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>

      <Card className="reveal-up reveal-up-1">
        {/* Stats + filters */}
        <MDBox px={3} pt={3} pb={1}>
          <Grid container spacing={2} mb={2}>
            {[
              { label: "Total", value: stats.total, color: "#1a1a1a", icon: "list_alt" },
              { label: "Nouveau", value: stats.nouveau, color: "#ef5350", icon: "report" },
              {
                label: "En cours",
                value: stats.en_cours,
                color: "#ffb300",
                icon: "autorenew",
              },
              {
                label: "Résolu",
                value: stats.resolu,
                color: "#4CAF50",
                icon: "check_circle",
              },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <MDBox
                  p={2}
                  borderRadius="lg"
                  sx={{
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}14`,
                      color: stat.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Icon sx={{ color: stat.color }}>{stat.icon}</Icon>
                  </Avatar>
                  <MDBox>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      {stat.label}
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="bold" color="dark">
                      {stat.value}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>

        {/* Alert cards */}
        <MDBox px={3} pb={3}>
          {loading ? (
            <MDBox textAlign="center" py={6}>
              <MDTypography variant="button" color="text">
                Chargement des alertes SOS...
              </MDTypography>
            </MDBox>
          ) : loadError ? (
            <MDBox textAlign="center" py={6}>
              <MDTypography variant="button" color="error" display="block" mb={2}>
                {loadError}
              </MDTypography>
              <MDButton variant="gradient" color="success" onClick={loadAlerts}>
                Réessayer
              </MDButton>
            </MDBox>
          ) : filteredAlerts.length === 0 ? (
            <MDBox textAlign="center" py={6}>
              <Icon sx={{ fontSize: "60px !important", color: "#9e9e9e", mb: 1 }}>
                notifications_none
              </Icon>
              <MDTypography variant="button" color="text" display="block">
                Aucune alerte ne correspond à votre recherche.
              </MDTypography>
            </MDBox>
          ) : (
            <Grid container spacing={3}>
              {filteredAlerts.map((alert) => (
                <Grid item xs={12} key={alert.id}>
                  <Card
                    sx={{
                      boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <MDBox p={2.5}>
                      {/* Header row */}
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={2}
                        flexWrap="wrap"
                      >
                        <MDBox display="flex" alignItems="center" gap={1.5}>
                          <MDBox
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#1a1a1a",
                            }}
                          >
                            <Icon sx={{ color: "white !important", fontSize: "26px !important" }}>
                              notifications_active
                            </Icon>
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="h6" fontWeight="bold" color="dark">
                              {alert.title}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {alert.date}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, alert.id)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          <Icon>more_vert</Icon>
                        </IconButton>
                      </MDBox>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        {/* Pilgrim info */}
                        <Grid item xs={12} md={3}>
                          <MDBox
                            p={1.5}
                            borderRadius={2}
                            sx={{
                              backgroundColor: "rgba(239, 83, 80, 0.06)",
                              border: "1px solid rgba(239, 83, 80, 0.15)",
                              height: "100%",
                            }}
                          >
                            <MDBox display="flex" alignItems="center" gap={0.5} mb={1}>
                              <Icon sx={{ color: "#ef5350", fontSize: "18px !important" }}>
                                person
                              </Icon>
                              <MDTypography variant="caption" fontWeight="bold" color="dark">
                                PÈLERIN
                              </MDTypography>
                            </MDBox>
                            <MDTypography
                              variant="button"
                              fontWeight="bold"
                              color="dark"
                              display="block"
                            >
                              {alert.pilgrimName || "—"}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              <Icon
                                sx={{
                                  fontSize: "14px !important",
                                  verticalAlign: "middle",
                                  mr: 0.5,
                                }}
                              >
                                phone
                              </Icon>
                              {alert.pilgrimPhone || "—"}
                            </MDTypography>
                            {alert.pilgrimIdentifier && (
                              <MDTypography variant="caption" color="text" display="block">
                                ID {alert.pilgrimIdentifier}
                              </MDTypography>
                            )}
                          </MDBox>
                        </Grid>

                        {/* Guide info */}
                        <Grid item xs={12} md={3}>
                          <MDBox
                            p={1.5}
                            borderRadius={2}
                            sx={{
                              backgroundColor: "rgba(46, 125, 50, 0.06)",
                              border: "1px solid rgba(46, 125, 50, 0.12)",
                              height: "100%",
                            }}
                          >
                            <MDBox display="flex" alignItems="center" gap={0.5} mb={1}>
                              <Icon sx={{ color: "#2e7d32", fontSize: "18px !important" }}>
                                support_agent
                              </Icon>
                              <MDTypography variant="caption" fontWeight="bold" color="dark">
                                GUIDE
                              </MDTypography>
                            </MDBox>
                            <MDTypography
                              variant="button"
                              fontWeight="bold"
                              color="dark"
                              display="block"
                            >
                              {alert.guideName}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              <Icon
                                sx={{
                                  fontSize: "14px !important",
                                  verticalAlign: "middle",
                                  mr: 0.5,
                                }}
                              >
                                phone
                              </Icon>
                              {alert.guidePhone}
                            </MDTypography>
                          </MDBox>
                        </Grid>

                        {/* Group info */}
                        <Grid item xs={12} md={3}>
                          <MDBox
                            p={1.5}
                            borderRadius={2}
                            sx={{
                              backgroundColor: "rgba(26, 26, 26, 0.05)",
                              border: "1px solid rgba(0, 0, 0, 0.08)",
                              height: "100%",
                            }}
                          >
                            <MDBox display="flex" alignItems="center" gap={0.5} mb={1}>
                              <Icon sx={{ color: "#1a1a1a", fontSize: "18px !important" }}>
                                groups
                              </Icon>
                              <MDTypography variant="caption" fontWeight="bold" color="dark">
                                GROUPE
                              </MDTypography>
                            </MDBox>
                            <MDTypography
                              variant="button"
                              fontWeight="bold"
                              color="dark"
                              display="block"
                            >
                              {alert.group?.name || "—"}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {alert.group?.pack || "—"} · {alert.group?.pilgrimCount || 0} pèlerins
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {alert.group?.startDate || "—"} → {alert.group?.endDate || "—"}
                            </MDTypography>
                          </MDBox>
                        </Grid>

                        {/* Real-time location */}
                        <Grid item xs={12} md={3}>
                          <MDBox
                            p={1.5}
                            borderRadius={2}
                            sx={{
                              backgroundColor: "rgba(239, 83, 80, 0.06)",
                              border: "1px solid rgba(239, 83, 80, 0.15)",
                              height: "100%",
                            }}
                          >
                            <MDBox
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <MDBox display="flex" alignItems="center" gap={0.5}>
                                <Icon sx={{ color: "#ef5350", fontSize: "18px !important" }}>
                                  my_location
                                </Icon>
                                <MDTypography variant="caption" fontWeight="bold" color="dark">
                                  LOCALISATION
                                </MDTypography>
                              </MDBox>
                              <MDBox
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  backgroundColor: "rgba(76, 175, 80, 0.15)",
                                }}
                              >
                                <MDBox
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "#4CAF50",
                                    animation: "pulse 1.5s infinite",
                                    "@keyframes pulse": {
                                      "0%": { opacity: 1 },
                                      "50%": { opacity: 0.4 },
                                      "100%": { opacity: 1 },
                                    },
                                  }}
                                />
                                <MDTypography
                                  variant="caption"
                                  sx={{ color: "#2e7d32", fontWeight: "bold" }}
                                >
                                  LIVE
                                </MDTypography>
                              </MDBox>
                            </MDBox>

                            <MDTypography
                              variant="button"
                              fontWeight="bold"
                              color="dark"
                              display="block"
                            >
                              {alert.location?.address || "—"}
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              color="text"
                              display="block"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {Number(alert.location?.lat || 0).toFixed(4)},{" "}
                              {Number(alert.location?.lng || 0).toFixed(4)}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              MAJ {formatRelativeTime(alert.location.lastUpdate)}
                            </MDTypography>
                            <MDButton
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleOpenMap(alert.location)}
                              sx={{ mt: 1, width: "100%" }}
                            >
                              <Icon sx={{ mr: 0.5, fontSize: "16px !important" }}>map</Icon>
                              Voir sur la carte
                            </MDButton>
                          </MDBox>
                        </Grid>
                      </Grid>

                      {/* Message */}
                      <MDBox
                        mt={2}
                        p={1.5}
                        borderRadius={2}
                        sx={{
                          backgroundColor: "rgba(0,0,0,0.03)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <MDTypography
                          variant="caption"
                          fontWeight="bold"
                          color="dark"
                          display="block"
                          mb={0.5}
                        >
                          MESSAGE
                        </MDTypography>
                        <MDTypography variant="button" color="text" display="block">
                          {alert.message}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </MDBox>
      </Card>

      {/* 3-dots actions menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {(() => {
          const activeAlert = alerts.find((a) => a.id === menuState.alertId);
          if (!activeAlert) return null;
          const items = [
            {
              key: "details",
              icon: "visibility",
              label: "Détails",
              color: "#1a1a1a",
              onClick: () => {
                setDetailsAlert(activeAlert);
                handleCloseMenu();
              },
            },
            {
              key: "message",
              icon: "chat",
              label: "Message",
              color: "#1a1a1a",
              onClick: () => {
                handleContactGuide(activeAlert.guideName);
                handleCloseMenu();
              },
            },
            {
              key: "note",
              icon: "note_add",
              label: "Ajouter note",
              color: "#1a1a1a",
              onClick: () => {
                setNoteDialog({ open: true, id: activeAlert.id, text: "" });
                handleCloseMenu();
              },
            },
          ];
          if (activeAlert.status === "nouveau") {
            items.push({
              key: "in_progress",
              icon: "autorenew",
              label: "Marquer en cours",
              color: "#ffb300",
              onClick: () => {
                requestAction("in_progress", activeAlert.id);
                handleCloseMenu();
              },
            });
          }
          if (activeAlert.status !== "résolu") {
            items.push({
              key: "resolve",
              icon: "check_circle",
              label: "Résoudre",
              color: "#4CAF50",
              onClick: () => {
                requestAction("resolve", activeAlert.id);
                handleCloseMenu();
              },
            });
          }
          return items.map((item) => (
            <MenuItem key={item.key} onClick={item.onClick}>
              <ListItemIcon>
                <Icon sx={{ color: item.color }}>{item.icon}</Icon>
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }}>{item.label}</ListItemText>
            </MenuItem>
          ));
        })()}
      </Menu>

      {/* Details dialog with timeline */}
      <Dialog
        open={Boolean(detailsAlert)}
        onClose={() => setDetailsAlert(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center" gap={1}>
            <Icon color="error">report</Icon>
            <MDTypography variant="h6" fontWeight="bold">
              Détails de l&apos;alerte
            </MDTypography>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          {detailsAlert && (
            <MDBox>
              <MDTypography variant="h6" fontWeight="bold" color="dark">
                {detailsAlert.title}
              </MDTypography>
              <MDTypography variant="caption" color="text" display="block" mb={2}>
                {detailsAlert.date} · {detailsAlert.pilgrimName} · {detailsAlert.guideName} ·{" "}
                {detailsAlert.group?.name}
              </MDTypography>

              <MDTypography variant="caption" fontWeight="bold" color="dark" display="block" mb={1}>
                CHRONOLOGIE
              </MDTypography>
              <MDBox sx={{ borderLeft: "2px solid rgba(0,0,0,0.1)", ml: 1, pl: 2 }}>
                {detailsAlert.timeline.map((step, idx) => {
                  const ti = timelineIcon(step.type);
                  return (
                    <MDBox key={idx} display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                      <MDBox
                        sx={{
                          position: "relative",
                          left: -25,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: "white",
                          border: `2px solid ${ti.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: ti.color, fontSize: "14px !important" }}>{ti.icon}</Icon>
                      </MDBox>
                      <MDBox ml={-2}>
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          {step.time}
                        </MDTypography>
                        <MDTypography variant="button" color="text" display="block">
                          {step.text}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  );
                })}
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton variant="text" color="dark" onClick={() => setDetailsAlert(null)}>
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Note dialog */}
      <Dialog
        open={noteDialog.open}
        onClose={() => setNoteDialog({ open: false, id: null, text: "" })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center" gap={1}>
            <Icon color="info">note_add</Icon>
            <MDTypography variant="h6" fontWeight="bold">
              Ajouter une note
            </MDTypography>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Écrivez une note à ajouter au dossier ..."
            value={noteDialog.text}
            onChange={(e) => setNoteDialog((n) => ({ ...n, text: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => setNoteDialog({ open: false, id: null, text: "" })}
          >
            Annuler
          </MDButton>
          <MDButton
            variant="contained"
            onClick={handleAddNote}
            disabled={!noteDialog.text.trim()}
            sx={{
              backgroundColor: "#4CAF50",
              color: "white !important",
              "&:hover": { backgroundColor: "#388E3C" },
            }}
          >
            Enregistrer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, id: null })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <MDTypography variant="button" color="text">
            {confirmDialog.action === "in_progress"
              ? "Voulez-vous marquer cette alerte comme étant en cours ?"
              : "Voulez-vous marquer cette alerte comme résolue ?"}
          </MDTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => setConfirmDialog({ open: false, action: null, id: null })}
          >
            Annuler
          </MDButton>
          <MDButton
            variant="contained"
            onClick={handleConfirmAction}
            sx={{
              backgroundColor: "#4CAF50",
              color: "white !important",
              "&:hover": { backgroundColor: "#388E3C" },
            }}
          >
            Confirmer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.text}
        </Alert>
      </Snackbar>
    </AgencyPageShell>
  );
}

export default AgencySosAlerts;
