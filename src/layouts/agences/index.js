import { useState, useMemo, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";

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

import {
  fetchAgencySubmissions,
  verifyAgencySubmission,
  rejectAgencySubmission,
  fetchAgencyPackUmrahForAdmin,
  fetchAgencyPackUmrahCountForAdmin,
} from "auth/adminAgenceAuth";
import { resolveMediaUrl } from "utils/resolveMediaUrl";

function Agences() {
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedAgence, setSelectedAgence] = useState(null);

  // View states
  const [currentView, setCurrentView] = useState("list"); // "list" or "packs"
  const [viewingAgency, setViewingAgency] = useState(null);
  const [agencyPacks, setAgencyPacks] = useState([]);
  const [detailsPack, setDetailsPack] = useState(null);
  const [pelerinsDialog, setPelerinsDialog] = useState({
    open: false,
    packNom: "",
    pelerins: [],
  });

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const data = await fetchAgencySubmissions();
      const agenciesWithCounts = await Promise.all(
        data.map(async (a) => {
          const count = await fetchAgencyPackUmrahCountForAdmin(a.id || a._id);
          const docsMap = {};
          if (a.agencyDocuments && Array.isArray(a.agencyDocuments)) {
            a.agencyDocuments.forEach((doc) => {
              docsMap[doc.label] = resolveMediaUrl(doc.url || doc.path);
            });
          }

          return {
            ...a,
            id: a.id || a._id,
            nom: a.agencyName || a.nom || "Agence sans nom",
            logo:
              resolveMediaUrl(a.profileImageUrl || a.profileImagePath || a.profileImage) || a.logo,
            responsable: a.responsibleName || a.responsable || "N/A",
            fonction: a.responsibleTitle || a.fonction || "N/A",
            status: a.submissionStatus || a.status || "pending",
            dateInscription: a.createdAt || a.dateInscription || new Date().toISOString(),
            dateFinContrat: (() => {
              const endDate =
                a.contractEndDate || a.contract_end_date || a.dateFinContrat || a.date_fin_contrat;
              if (endDate) return endDate;

              const startDate =
                a.contractStartDate || a.contract_start_date || a.dateInscription || a.createdAt;
              const duration = a.contractDuration || a.contract_duration;

              if (startDate && duration) {
                const start = new Date(startDate);
                start.setMonth(start.getMonth() + Number(duration));
                return start.toISOString();
              }
              return null;
            })(),
            packCount: count,
            documents: docsMap,
            contractUrl: resolveMediaUrl(a.contractFileUrl || a.contractFilePath),
            contractFileName: a.contractFileName || "Contrat_Signé.pdf",
            telephone: a.phoneNumber || "N/A",
            adresse: a.agencyAddress || "N/A",
            description: a.agencyDescription || "Aucune description fournie.",
          };
        })
      );
      setAgences(agenciesWithCounts);
    } catch (error) {
      console.error("Error loading agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "",
    agenceId: null,
    agenceNom: "",
  });

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "validated":
        return { label: "Validée", color: "success" };
      case "pending":
        return { label: "En attente", color: "warning" };
      case "refused":
        return { label: "Refusée", color: "error" };
      case "suspended":
        return { label: "Suspendue", color: "dark" };
      default:
        return { label: status, color: "info" };
    }
  };

  const filteredAgences = useMemo(() => {
    return agences.filter((agence) => {
      const matchesSearch =
        agence.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agence.responsable.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || agence.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agences, searchTerm, statusFilter]);

  const paginatedAgences = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAgences.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAgences, page]);

  const totalPages = Math.ceil(filteredAgences.length / rowsPerPage);

  const openConfirmDialog = (type, agence) => {
    setConfirmDialog({
      open: true,
      type,
      agenceId: agence.id,
      agenceNom: agence.nom,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleViewAgencyPacks = async (agence) => {
    setLoading(true);
    handleActionMenuClose();
    try {
      const packs = await fetchAgencyPackUmrahForAdmin(agence.id);
      setViewingAgency(agence);
      setAgencyPacks(packs || []);
      setCurrentView("packs");
    } catch (error) {
      console.error("Error loading agency packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setViewingAgency(null);
    setAgencyPacks([]);
  };

  const openPelerinsDialog = (pack) => {
    setPelerinsDialog({
      open: true,
      packNom: pack.nom || pack.title,
      pelerins: pack.pelerins || [],
    });
  };

  const closePelerinsDialog = () => {
    setPelerinsDialog({ ...pelerinsDialog, open: false });
  };

  const handleAction = async () => {
    const { type, agenceId } = confirmDialog;
    setLoading(true);
    try {
      if (type === "accept") {
        await verifyAgencySubmission(agenceId);
      } else if (type === "refuse" || type === "ban") {
        await rejectAgencySubmission(agenceId);
      }
      await loadAgencies();
    } catch (error) {
      console.error("Error updating agency status:", error);
    } finally {
      setLoading(false);
      closeConfirmDialog();
    }
  };

  const handleFilterClick = (event) => setFilterAnchor(event.currentTarget);
  const handleFilterClose = (status) => {
    if (status !== undefined) setStatusFilter(status);
    setFilterAnchor(null);
    setPage(1);
  };

  const handleActionMenuOpen = (event, agence) => {
    event.stopPropagation();
    setActionAnchor(event.currentTarget);
    setSelectedAgence(agence);
  };

  const handleActionMenuClose = () => {
    setActionAnchor(null);
    setSelectedAgence(null);
  };

  const handleActionFromMenu = (type) => {
    openConfirmDialog(type, selectedAgence);
    handleActionMenuClose();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        {currentView === "list" ? (
          <>
            <MDBox
              mb={3}
              p={3}
              sx={(theme) => ({
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
              })}
            >
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexDirection={{ xs: "column", md: "row" }}
                gap={2}
              >
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDBox>
                    <MDTypography variant="h5" color="white" fontWeight="bold">
                      Gestion des Agences
                    </MDTypography>
                    <MDTypography variant="button" color="white" opacity={0.8}>
                      Consultez et gérez les agences partenaires de Sabeel.
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox display="flex" alignItems="center" gap={1.5}>
                  <MDInput
                    placeholder="Rechercher une agence..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
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
                    onClose={() => handleFilterClose()}
                  >
                    <MenuItem onClick={() => handleFilterClose("all")}>Tous les statuts</MenuItem>
                    <MenuItem onClick={() => handleFilterClose("pending")}>En attente</MenuItem>
                    <MenuItem onClick={() => handleFilterClose("validated")}>Validées</MenuItem>
                    <MenuItem onClick={() => handleFilterClose("refused")}>Refusées</MenuItem>
                    <MenuItem onClick={() => handleFilterClose("suspended")}>Suspendues</MenuItem>
                  </Menu>
                </MDBox>
              </MDBox>
            </MDBox>

            <Grid container spacing={2}>
              {loading ? (
                <Grid item xs={12}>
                  <Card sx={{ p: 10, textAlign: "center" }}>
                    <CircularProgress color="success" sx={{ mb: 2 }} />
                    <MDTypography variant="h6" color="text">
                      Chargement des agences...
                    </MDTypography>
                  </Card>
                </Grid>
              ) : paginatedAgences.length > 0 ? (
                paginatedAgences.map((agence) => {
                  const statusInfo = getStatusInfo(agence.status);
                  const isExpanded = expandedId === agence.id;

                  return (
                    <Grid item xs={12} key={agence.id}>
                      <Card
                        sx={{
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          border: isExpanded ? "1px solid" : "none",
                          borderColor: "success.main",
                          boxShadow: isExpanded ? 3 : 1,
                        }}
                      >
                        <MDBox
                          p={3}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleExpandClick(agence.id)}
                        >
                          <MDBox display="flex" alignItems="center" gap={3} sx={{ flex: 1 }}>
                            <MDAvatar
                              src={agence.logo}
                              alt={agence.nom}
                              size="xl"
                              variant="rounded"
                              shadow="md"
                            />
                            <MDBox>
                              <MDTypography variant="h6" fontWeight="bold">
                                {agence.nom}
                              </MDTypography>
                              <MDTypography variant="button" color="text" fontWeight="regular">
                                Responsable: {agence.responsable}
                              </MDTypography>
                            </MDBox>
                          </MDBox>

                          <MDBox
                            display="flex"
                            alignItems="center"
                            justifyContent="flex-end"
                            sx={{ flex: 1 }}
                            gap={1}
                          >
                            <MDButton
                              variant="text"
                              color={isExpanded ? "success" : "dark"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExpandClick(agence.id);
                              }}
                            >
                              {isExpanded ? "Fermer" : "Détails"}
                              <Icon sx={{ ml: 1 }}>
                                {isExpanded ? "expand_less" : "expand_more"}
                              </Icon>
                            </MDButton>
                            <MDButton
                              iconOnly
                              variant="text"
                              color="dark"
                              onClick={(e) => handleActionMenuOpen(e, agence)}
                            >
                              <Icon>more_vert</Icon>
                            </MDButton>
                          </MDBox>
                        </MDBox>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <MDBox p={4} sx={{ bgcolor: "#fafafa" }}>
                            <Grid container spacing={4}>
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
                                      badgeContent={statusInfo.label}
                                      color={statusInfo.color}
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
                                      INSCRIPTION
                                    </MDTypography>
                                    <MDTypography variant="button" fontWeight="medium">
                                      {new Date(agence.dateInscription).toLocaleDateString("fr-FR")}
                                    </MDTypography>
                                  </MDBox>
                                  <Divider orientation="vertical" flexItem />
                                  <MDBox textAlign="center">
                                    <MDTypography
                                      variant="caption"
                                      color="error"
                                      fontWeight="bold"
                                      display="block"
                                    >
                                      FIN CONTRAT
                                    </MDTypography>
                                    <MDTypography
                                      variant="button"
                                      fontWeight="medium"
                                      color={agence.dateFinContrat ? "error" : "text"}
                                    >
                                      {agence.dateFinContrat
                                        ? new Date(agence.dateFinContrat).toLocaleDateString(
                                            "fr-FR"
                                          )
                                        : "En attente"}
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
                                      PACKS
                                    </MDTypography>
                                    <MDTypography variant="button" fontWeight="medium">
                                      {agence.packCount || 0}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              </Grid>

                              <Grid item xs={12} md={7}>
                                <MDBox mb={3}>
                                  <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                                    Informations Générales
                                  </MDTypography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        fontWeight="bold"
                                      >
                                        NOM DU RESPONSABLE
                                      </MDTypography>
                                      <MDTypography variant="button" display="block">
                                        {agence.responsable}
                                      </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        fontWeight="bold"
                                      >
                                        FONCTION
                                      </MDTypography>
                                      <MDTypography variant="button" display="block">
                                        {agence.fonction}
                                      </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        fontWeight="bold"
                                      >
                                        TÉLÉPHONE
                                      </MDTypography>
                                      <MDTypography variant="button" display="block">
                                        {agence.telephone}
                                      </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        fontWeight="bold"
                                      >
                                        EMAIL
                                      </MDTypography>
                                      <MDTypography variant="button" display="block">
                                        {agence.email}
                                      </MDTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        fontWeight="bold"
                                      >
                                        ADRESSE
                                      </MDTypography>
                                      <MDTypography variant="button" display="block">
                                        {agence.adresse}
                                      </MDTypography>
                                    </Grid>
                                  </Grid>
                                </MDBox>

                                <MDBox>
                                  <MDTypography variant="caption" color="text" fontWeight="bold">
                                    DESCRIPTION
                                  </MDTypography>
                                  <MDTypography variant="button" display="block" color="text">
                                    {agence.description}
                                  </MDTypography>
                                </MDBox>
                              </Grid>

                              <Grid item xs={12} md={5}>
                                <MDBox mb={4}>
                                  <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                                    Documents Uploadés
                                  </MDTypography>
                                  <MDBox display="flex" flexWrap="wrap" gap={1}>
                                    {Object.entries(agence.documents || {}).map(
                                      ([key, filename]) => (
                                        <Tooltip title={`Voir ${key}`} key={key}>
                                          <MDBox
                                            display="flex"
                                            alignItems="center"
                                            px={2}
                                            py={1}
                                            sx={(theme) => ({
                                              border: `1px solid ${theme.palette.grey[300]}`,
                                              borderRadius: theme.borders.borderRadius.md,
                                              cursor: "pointer",
                                              "&:hover": { bgcolor: "white" },
                                            })}
                                            onClick={() => {
                                              if (filename) window.open(filename, "_blank");
                                              else alert("Document non disponible");
                                            }}
                                          >
                                            <Icon color="error" sx={{ mr: 1 }}>
                                              picture_as_pdf
                                            </Icon>
                                            <MDTypography
                                              variant="caption"
                                              fontWeight="bold"
                                              textTransform="uppercase"
                                            >
                                              {key}
                                            </MDTypography>
                                          </MDBox>
                                        </Tooltip>
                                      )
                                    )}
                                    {agence.contractUrl && (
                                      <Tooltip
                                        title={`Voir le Contrat: ${agence.contractFileName}`}
                                      >
                                        <MDBox
                                          display="flex"
                                          alignItems="center"
                                          px={2}
                                          py={1}
                                          sx={(theme) => ({
                                            border: `1px solid ${theme.palette.grey[300]}`,
                                            borderRadius: theme.borders.borderRadius.md,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "white" },
                                          })}
                                          onClick={() => window.open(agence.contractUrl, "_blank")}
                                        >
                                          <Icon color="error" sx={{ mr: 1 }}>
                                            picture_as_pdf
                                          </Icon>
                                          <MDTypography
                                            variant="caption"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                          >
                                            Contrat Signé
                                          </MDTypography>
                                        </MDBox>
                                      </Tooltip>
                                    )}
                                  </MDBox>
                                </MDBox>
                              </Grid>
                            </Grid>
                          </MDBox>
                        </Collapse>
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Card sx={{ p: 5, textAlign: "center" }}>
                    <MDTypography variant="h6" color="text">
                      Aucune agence trouvée.
                    </MDTypography>
                  </Card>
                </Grid>
              )}
            </Grid>

            {totalPages > 1 && (
              <MDBox mt={3} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="success"
                  variant="outlined"
                  shape="rounded"
                />
              </MDBox>
            )}

            <Menu
              anchorEl={actionAnchor}
              open={Boolean(actionAnchor)}
              onClose={handleActionMenuClose}
            >
              {selectedAgence?.status === "pending" ? (
                <>
                  <MenuItem onClick={() => handleActionFromMenu("accept")}>
                    <Icon sx={{ mr: 1, color: "success.main" }}>check_circle</Icon> Accepter
                  </MenuItem>
                  <MenuItem onClick={() => handleActionFromMenu("refuse")}>
                    <Icon sx={{ mr: 1, color: "error.main" }}>cancel</Icon> Refuser
                  </MenuItem>
                </>
              ) : selectedAgence?.status === "validated" ? (
                <MenuItem onClick={() => handleActionFromMenu("ban")}>
                  <Icon sx={{ mr: 1, color: "error.main" }}>block</Icon> Bannir
                </MenuItem>
              ) : (
                <MenuItem onClick={() => handleActionFromMenu("accept")}>
                  <Icon sx={{ mr: 1, color: "success.main" }}>restore</Icon> Réactiver
                </MenuItem>
              )}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                component={Link}
                to="/messages"
                state={{
                  contactSupport: {
                    targetRole: "agence",
                    targetId: selectedAgence?.id,
                    name: selectedAgence?.nom,
                    avatar: selectedAgence?.logo,
                    email: selectedAgence?.email,
                    phone: selectedAgence?.telephone,
                  },
                }}
                onClick={handleActionMenuClose}
              >
                <Icon sx={{ mr: 1, color: "info.main" }}>chat</Icon> Contacter
              </MenuItem>
              <MenuItem onClick={() => handleViewAgencyPacks(selectedAgence)}>
                <Icon sx={{ mr: 1, color: "success.main" }}>inventory_2</Icon> Packs Umrah
              </MenuItem>
            </Menu>
          </>
        ) : (
          <MDBox>
            <MDBox mb={3} display="flex" alignItems="center" gap={2}>
              <MDButton
                variant="outlined"
                color="success"
                onClick={handleBackToList}
                startIcon={<Icon>arrow_back</Icon>}
                sx={{ borderRadius: "10px" }}
              >
                Retour
              </MDButton>
              <MDTypography variant="h4" fontWeight="bold">
                Packs Umrah: {viewingAgency?.nom}
              </MDTypography>
            </MDBox>

            <Grid container spacing={3}>
              {loading ? (
                <Grid item xs={12}>
                  <Card sx={{ p: 10, textAlign: "center" }}>
                    <CircularProgress color="success" sx={{ mb: 2 }} />
                    <MDTypography variant="h6" color="text">
                      Chargement des packs...
                    </MDTypography>
                  </Card>
                </Grid>
              ) : agencyPacks.length > 0 ? (
                agencyPacks.map((pack) => (
                  <Grid item xs={12} md={6} lg={4} key={pack.id}>
                    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
                      <MDBox
                        component="img"
                        src={pack.imageUrl || "/images/placeholder-pack.jpg"}
                        sx={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                      <MDBox p={3}>
                        <MDBox
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <MDTypography variant="h6" fontWeight="bold" gutterBottom>
                            {pack.nom || pack.title}
                          </MDTypography>
                          <MDBadge
                            badgeContent={pack.isArchived ? "Archivé" : "Actif"}
                            color={pack.isArchived ? "error" : "success"}
                            variant="gradient"
                            size="xs"
                          />
                        </MDBox>
                        <MDTypography variant="button" color="text" display="block" mb={2}>
                          {pack.description?.substring(0, 100)}...
                        </MDTypography>
                        <Divider sx={{ my: 2 }} />
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDBox>
                            <MDTypography variant="caption" color="text" fontWeight="bold">
                              PRIX
                            </MDTypography>
                            <MDTypography variant="h6" color="success">
                              {pack.prix || pack.price} TND
                            </MDTypography>
                          </MDBox>
                          <MDButton
                            variant="text"
                            color="info"
                            onClick={() => openPelerinsDialog(pack)}
                          >
                            {pack.reservations || pack.pelerinsCount || 0} Pèlerins
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card sx={{ p: 5, textAlign: "center" }}>
                    <MDTypography variant="h6" color="text">
                      Aucun pack trouvé pour cette agence.
                    </MDTypography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}
      </MDBox>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.type === "accept"
            ? "Confirmer la validation"
            : confirmDialog.type === "refuse"
            ? "Confirmer le refus"
            : "Confirmer le bannissement"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir{" "}
            {confirmDialog.type === "accept"
              ? "accepter"
              : confirmDialog.type === "refuse"
              ? "refuser"
              : "bannir"}{" "}
            l&apos;agence <strong>{confirmDialog.agenceNom}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeConfirmDialog} color="dark">
            Annuler
          </MDButton>
          <MDButton
            onClick={handleAction}
            color={confirmDialog.type === "accept" ? "success" : "error"}
            variant="gradient"
          >
            Confirmer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Pelerins Dialog */}
      <Dialog open={pelerinsDialog.open} onClose={closePelerinsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Pèlerins réservés pour <strong>{pelerinsDialog.packNom}</strong>
        </DialogTitle>
        <DialogContent>
          {pelerinsDialog.pelerins.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ display: "table-header-group" }}>
                  <TableRow>
                    <TableCell>Nom du Pèlerin</TableCell>
                    <TableCell align="right">Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pelerinsDialog.pelerins.map((p) => (
                    <TableRow key={p.id || p._id}>
                      <TableCell>
                        <MDBox display="flex" alignItems="center" gap={1}>
                          <MDAvatar
                            size="xs"
                            src={`https://ui-avatars.com/api/?name=${p.nom}&background=random`}
                          />
                          <MDTypography variant="button">{p.nom}</MDTypography>
                        </MDBox>
                      </TableCell>
                      <TableCell align="right">
                        <MDBadge
                          badgeContent={p.status || "Inscrit"}
                          color={p.status === "Payé total" ? "success" : "warning"}
                          variant="gradient"
                          size="xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h6" color="text">
                Aucun pèlerin inscrit.
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closePelerinsDialog} color="success">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Agences;
