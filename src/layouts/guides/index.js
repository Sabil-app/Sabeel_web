import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Sabeel Admin components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge";
import MDAvatar from "components/MDAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { fetchAllGuides, verifyGuideDocuments, rejectGuideDocuments } from "auth/adminAgenceAuth";
import { BACKEND_URL } from "api/apiClient";

function Guides() {
  const [guides, setGuides] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [guideMenuAnchor, setGuideMenuAnchor] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const fetchGuides = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await fetchAllGuides(typeFilter);
      const guidesData = Array.isArray(response) ? response : response?.guides || [];
      setGuides(guidesData);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement des guides");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id, payload) => {
    try {
      if (action === "verifyDocs") {
        await verifyGuideDocuments(id);
      } else if (action === "rejectDocs") {
        await rejectGuideDocuments(id, payload);
      }
      // Refresh list after action
      await fetchGuides();
    } catch (err) {
      alert(err.message || "L'action a échoué");
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchGuides();
  }, [typeFilter]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "verified":
      case "active":
        return { label: "Actif", color: "success" };
      case "pending":
        return { label: "En attente", color: "warning" };
      case "banned":
      case "inactive":
        return { label: "Inactif", color: "error" };
      default:
        return { label: status || "-", color: "dark" };
    }
  };

  const filteredGuides = useMemo(() => {
    if (!Array.isArray(guides)) return [];
    return guides.filter((guide) => {
      const name = guide.name || "";
      const email = guide.email || "";
      const agencyName = guide.agencyName || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agencyName.toLowerCase().includes(searchTerm.toLowerCase());

      // Logique de filtrage par statut plus flexible
      let matchesStatus = statusFilter === "all";
      if (statusFilter === "verified") {
        matchesStatus = guide.status === "verified" || guide.status === "active";
      } else if (statusFilter !== "all") {
        matchesStatus = guide.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [guides, searchTerm, statusFilter]);

  const handleVerify = (id) => {
    if (!Array.isArray(guides)) return;
    setGuides(guides.map((g) => (g.id === id ? { ...g, status: "verified" } : g)));
  };

  const handleBan = (id) => {
    if (!Array.isArray(guides)) return;
    setGuides(guides.map((g) => (g.id === id ? { ...g, status: "banned" } : g)));
  };

  const handleOpenGuideMenu = (event, guide) => {
    event.stopPropagation();
    setGuideMenuAnchor(event.currentTarget);
    setSelectedGuide(guide);
  };

  const handleCloseGuideMenu = () => {
    setGuideMenuAnchor(null);
    setSelectedGuide(null);
  };

  const handleGuideMenuAction = (action, guide) => {
    handleCloseGuideMenu();
    if (action === "verify") handleVerify(guide.id);
    if (action === "ban") handleBan(guide.id);
    if (action === "reactivate") {
      if (Array.isArray(guides)) {
        setGuides(guides.map((g) => (g.id === guide.id ? { ...g, status: "verified" } : g)));
      }
    }
  };

  const handleFilterClick = (event) => setFilterAnchor(event.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        {/* ── Green Banner ── */}
        <MDBox
          mb={3}
          p={3}
          sx={{
            background:
              "linear-gradient(130deg, #0f3d14 0%, #1b5e20 40%, #2e7d32 70%, #43a047 100%)",
            borderRadius: "18px",
            boxShadow: "0 18px 40px -18px rgba(27, 94, 32, 0.55)",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 85% 0%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.08), transparent 40%)",
              pointerEvents: "none",
            },
          }}
        >
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column", md: "row" }}
            gap={2}
          >
            <MDBox>
              <MDTypography variant="h5" color="white" fontWeight="bold">
                Gestion des Guides
              </MDTypography>
              <MDTypography variant="button" color="white" opacity={0.8}>
                Consultez et gérez les guides agence et freelance.
              </MDTypography>
            </MDBox>

            <MDBox display="flex" alignItems="center" gap={1.5}>
              <MDInput
                placeholder="Rechercher un guide..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    height: "40px",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                  "& input::placeholder": { color: "rgba(255, 255, 255, 0.6)", opacity: 1 },
                }}
              />
              <MDButton
                variant="gradient"
                color="success"
                onClick={handleFilterClick}
                startIcon={<Icon>filter_list</Icon>}
                sx={{ borderRadius: "10px", px: 3 }}
              >
                FILTRER
              </MDButton>

              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={handleFilterClose}
              >
                <MDTypography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ px: 2, py: 0.5, display: "block", color: "text.secondary" }}
                >
                  TYPE
                </MDTypography>
                <MenuItem
                  selected={typeFilter === "all"}
                  onClick={() => {
                    setTypeFilter("all");
                    handleFilterClose();
                  }}
                >
                  <Icon sx={{ mr: 1, fontSize: "small" }}>people</Icon> Tous les guides
                </MenuItem>
                <MenuItem
                  selected={typeFilter === "agency"}
                  onClick={() => {
                    setTypeFilter("agency");
                    handleFilterClose();
                  }}
                >
                  <Icon sx={{ mr: 1, fontSize: "small" }}>business</Icon> Guide agence
                </MenuItem>
                <MenuItem
                  selected={typeFilter === "freelance"}
                  onClick={() => {
                    setTypeFilter("freelance");
                    handleFilterClose();
                  }}
                >
                  <Icon sx={{ mr: 1, fontSize: "small" }}>person</Icon> Guide freelance
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MDTypography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ px: 2, py: 0.5, display: "block", color: "text.secondary" }}
                >
                  STATUT
                </MDTypography>
                <MenuItem
                  selected={statusFilter === "all"}
                  onClick={() => {
                    setStatusFilter("all");
                    handleFilterClose();
                  }}
                >
                  Tous les statuts
                </MenuItem>
                <MenuItem
                  selected={statusFilter === "verified" || statusFilter === "active"}
                  onClick={() => {
                    setStatusFilter("verified");
                    handleFilterClose();
                  }}
                >
                  Actifs / Vérifiés
                </MenuItem>
                <MenuItem
                  selected={statusFilter === "pending"}
                  onClick={() => {
                    setStatusFilter("pending");
                    handleFilterClose();
                  }}
                >
                  En attente
                </MenuItem>
                <MenuItem
                  selected={statusFilter === "banned"}
                  onClick={() => {
                    setStatusFilter("banned");
                    handleFilterClose();
                  }}
                >
                  Bannis
                </MenuItem>
              </Menu>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* ── Guide Cards ── */}
        <Grid container spacing={2}>
          {loading && (
            <Grid item xs={12}>
              <Card sx={{ p: 10, textAlign: "center" }}>
                <CircularProgress color="success" sx={{ mb: 2 }} />
                <MDTypography variant="h6" color="text">
                  Chargement des guides...
                </MDTypography>
              </Card>
            </Grid>
          )}

          {!loading && error && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <MDTypography variant="button" color="error">
                  {error}
                </MDTypography>
              </Card>
            </Grid>
          )}

          {!loading && !error && filteredGuides.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 5, textAlign: "center" }}>
                <MDTypography variant="h6" color="text">
                  Aucun guide trouvé.
                </MDTypography>
              </Card>
            </Grid>
          )}

          {!loading &&
            filteredGuides.map((guide) => {
              const isExpanded = expandedId === guide.id;
              const status = getStatusInfo(guide.status);
              const guideTypeLabel = guide.type === "agency" ? "Guide agence" : "Guide freelance";
              const safeLanguages = Array.isArray(guide.languages) ? guide.languages : [];

              return (
                <Grid item xs={12} key={guide.id}>
                  <Card
                    sx={{
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      border: isExpanded ? "1px solid" : "none",
                      borderColor: "success.main",
                      boxShadow: isExpanded ? 3 : 1,
                    }}
                  >
                    {/* ── Row (Simplified) ── */}
                    <MDBox
                      p={3}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleExpandClick(guide.id)}
                    >
                      {/* Avatar + Info */}
                      <MDBox display="flex" alignItems="center" gap={3} sx={{ flex: 1 }}>
                        <MDAvatar
                          src={getFullImageUrl(guide.photo)}
                          alt={guide.name}
                          size="xl"
                          shadow="md"
                        />
                        <MDBox>
                          <MDTypography variant="h6" fontWeight="bold">
                            {guide.name}
                          </MDTypography>
                          <MDTypography variant="button" color="text">
                            {guide.email || "-"}
                          </MDTypography>
                        </MDBox>
                      </MDBox>

                      {/* Actions */}
                      <MDBox display="flex" justifyContent="flex-end" gap={0.5} sx={{ flex: 1 }}>
                        <MDButton
                          variant="text"
                          color={isExpanded ? "success" : "dark"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandClick(guide.id);
                          }}
                        >
                          {isExpanded ? "Fermer" : "Détails"}
                          <Icon sx={{ ml: 1 }}>{isExpanded ? "expand_less" : "expand_more"}</Icon>
                        </MDButton>
                        <IconButton onClick={(e) => handleOpenGuideMenu(e, guide)}>
                          <Icon>more_vert</Icon>
                        </IconButton>
                      </MDBox>
                    </MDBox>

                    {/* ── Expanded Details ── */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Divider sx={{ my: 0 }} />
                      <MDBox p={4} sx={{ bgcolor: "#fafafa" }}>
                        <Grid container spacing={4}>
                          {/* Summary Band (Like Agences) */}
                          <Grid item xs={12}>
                            <MDBox
                              display="flex"
                              justifyContent="space-around"
                              alignItems="center"
                              p={2}
                              sx={(theme) => ({
                                bgcolor: "white",
                                borderRadius: theme.borders.borderRadius.xl,
                                border: "none",
                                boxShadow: "none",
                              })}
                            >
                              <MDBox textAlign="center">
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="bold"
                                  display="block"
                                >
                                  STATUT
                                </MDTypography>
                                <MDBadge
                                  badgeContent={status.label}
                                  color={status.color}
                                  variant="gradient"
                                  size="sm"
                                />
                              </MDBox>
                              <Divider orientation="vertical" flexItem />
                              <MDBox textAlign="center">
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="bold"
                                  display="block"
                                >
                                  TYPE
                                </MDTypography>
                                <MDBadge
                                  badgeContent={guideTypeLabel}
                                  color={guide.type === "agency" ? "info" : "dark"}
                                  variant="gradient"
                                  size="sm"
                                />
                              </MDBox>
                              <Divider orientation="vertical" flexItem />
                              <MDBox textAlign="center">
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="bold"
                                  display="block"
                                >
                                  EXPÉRIENCE
                                </MDTypography>
                                <MDTypography variant="button" fontWeight="medium">
                                  {guide.experience || "-"}
                                </MDTypography>
                              </MDBox>
                              <Divider orientation="vertical" flexItem />
                              <MDBox textAlign="center">
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="bold"
                                  display="block"
                                >
                                  INSCRIPTION
                                </MDTypography>
                                <MDTypography variant="button" fontWeight="medium">
                                  {guide.createdAt
                                    ? new Date(guide.createdAt).toLocaleDateString("fr-FR")
                                    : "-"}
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </Grid>

                          <Grid item xs={12} md={7}>
                            <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                              Informations Complémentaires
                            </MDTypography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <MDTypography variant="caption" color="text" fontWeight="bold">
                                  TÉLÉPHONE
                                </MDTypography>
                                <MDTypography variant="button" display="block">
                                  {guide.phone || "-"}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={6}>
                                <MDTypography variant="caption" color="text" fontWeight="bold">
                                  EMAIL
                                </MDTypography>
                                <MDTypography variant="button" display="block">
                                  {guide.email || "-"}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={12}>
                                <MDTypography variant="caption" color="text" fontWeight="bold">
                                  LANGUES
                                </MDTypography>
                                <MDBox display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                  {safeLanguages.length > 0 ? (
                                    safeLanguages.map((l) => (
                                      <MDBadge
                                        key={l}
                                        badgeContent={l}
                                        color="dark"
                                        size="xs"
                                        container
                                      />
                                    ))
                                  ) : (
                                    <MDTypography variant="button" color="text">
                                      Aucune langue.
                                    </MDTypography>
                                  )}
                                </MDBox>
                              </Grid>
                              {guide.type === "agency" && (
                                <Grid item xs={12}>
                                  <MDTypography variant="caption" color="text" fontWeight="bold">
                                    AGENCE PARTENAIRE
                                  </MDTypography>
                                  <MDTypography variant="button" display="block">
                                    {guide.agencyName || "-"}
                                  </MDTypography>
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <MDTypography variant="caption" color="text" fontWeight="bold">
                                  DERNIÈRE MISE À JOUR
                                </MDTypography>
                                <MDTypography variant="button" display="block">
                                  {guide.updatedAt
                                    ? new Date(guide.updatedAt).toLocaleString("fr-FR")
                                    : "-"}
                                </MDTypography>
                              </Grid>
                            </Grid>
                          </Grid>

                          {/* ── Document Verification Section (Freelance only) ── */}
                          {guide.type === "freelance" && (
                            <Grid item xs={12} md={5}>
                              <MDBox
                                p={2}
                                sx={{
                                  bgcolor: "white",
                                  borderRadius: "15px",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                                  Vérification Documents
                                </MDTypography>

                                <MDBox mb={2}>
                                  <MDTypography variant="caption" color="text" fontWeight="bold">
                                    STATUT DOCUMENTS
                                  </MDTypography>
                                  <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                                    <MDBadge
                                      badgeContent={guide.verificationStatus || "pending"}
                                      color={
                                        guide.verificationStatus === "approved"
                                          ? "success"
                                          : guide.verificationStatus === "rejected"
                                          ? "error"
                                          : "warning"
                                      }
                                      variant="gradient"
                                      size="sm"
                                    />
                                  </MDBox>
                                </MDBox>

                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="bold"
                                  mb={1}
                                  display="block"
                                >
                                  DOCUMENTS TÉLÉVERSÉS
                                </MDTypography>
                                <MDBox display="flex" gap={1} flexWrap="wrap">
                                  {guide.freelanceDocuments &&
                                  guide.freelanceDocuments.length > 0 ? (
                                    guide.freelanceDocuments.map((doc, idx) => (
                                      <MDBox
                                        key={idx}
                                        component="a"
                                        href={doc.url}
                                        target="_blank"
                                        sx={{
                                          width: "100px",
                                          height: "80px",
                                          borderRadius: "8px",
                                          overflow: "hidden",
                                          border: "1px solid #eee",
                                          display: "block",
                                          bgcolor: "#f0f0f0",
                                        }}
                                      >
                                        <img
                                          src={doc.url}
                                          alt={`Document ${idx}`}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </MDBox>
                                    ))
                                  ) : (
                                    <MDTypography variant="caption" color="text">
                                      Aucun document.
                                    </MDTypography>
                                  )}
                                </MDBox>

                                {guide.verificationStatus === "pending" &&
                                  guide.freelanceDocuments?.length > 0 && (
                                    <MDBox display="flex" gap={1} mt={3}>
                                      <MDButton
                                        variant="gradient"
                                        color="success"
                                        size="small"
                                        fullWidth
                                        onClick={() => handleAction("verifyDocs", guide.id)}
                                      >
                                        APPROUVER
                                      </MDButton>
                                      <MDButton
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        fullWidth
                                        onClick={() => {
                                          const reason = prompt("Raison du refus :");
                                          if (reason) handleAction("rejectDocs", guide.id, reason);
                                        }}
                                      >
                                        REFUSER
                                      </MDButton>
                                    </MDBox>
                                  )}

                                {guide.verificationRejectReason && (
                                  <MDBox mt={2}>
                                    <MDTypography variant="caption" color="error" fontWeight="bold">
                                      RAISON DU REFUS :
                                    </MDTypography>
                                    <MDTypography variant="caption" display="block">
                                      {guide.verificationRejectReason}
                                    </MDTypography>
                                  </MDBox>
                                )}
                              </MDBox>
                            </Grid>
                          )}
                        </Grid>
                      </MDBox>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </MDBox>

      {/* ── Guide Actions Menu ── */}
      <Menu
        anchorEl={guideMenuAnchor}
        open={Boolean(guideMenuAnchor)}
        onClose={handleCloseGuideMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {selectedGuide?.status === "pending" && (
          <MenuItem onClick={() => handleGuideMenuAction("verify", selectedGuide)}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              verified
            </Icon>
            Vérifier
          </MenuItem>
        )}
        {selectedGuide?.status !== "banned" && selectedGuide?.status !== "pending" && (
          <MenuItem
            component={Link}
            to="/messages"
            state={{
              contactConversation: {
                name: selectedGuide?.name,
                role: selectedGuide?.type === "agency" ? "Guide agence" : "Guide freelance",
                email: selectedGuide?.email,
                phone: selectedGuide?.phone,
                avatar: selectedGuide?.photo,
              },
            }}
            onClick={handleCloseGuideMenu}
          >
            <Icon fontSize="small" sx={{ mr: 1 }}>
              forum
            </Icon>
            Contacter
          </MenuItem>
        )}
        {selectedGuide?.status !== "banned" && (
          <MenuItem onClick={() => handleGuideMenuAction("ban", selectedGuide)}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              block
            </Icon>
            Bannir
          </MenuItem>
        )}
        {selectedGuide?.status === "banned" && (
          <MenuItem onClick={() => handleGuideMenuAction("reactivate", selectedGuide)}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              restart_alt
            </Icon>
            Réactiver
          </MenuItem>
        )}
      </Menu>

      <Footer />
    </DashboardLayout>
  );
}

export default Guides;
