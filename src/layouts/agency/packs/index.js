import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Radio from "@mui/material/Radio";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout components
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

// API
import {
  fetchAgencyPackUmrah,
  fetchAgencyGuides,
  createPackUmrah,
  updatePackUmrah,
  deletePackUmrah,
} from "auth/adminAgenceAuth";
import { resolveMediaUrl } from "utils/resolveMediaUrl";

// Components
import AddPackForm from "layouts/agency/packs/components/AddPackForm";

function AgencyPacks() {
  const [view, setView] = useState("list"); // "list", "add", "edit"
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPack, setCurrentPack] = useState(null);
  const [menu, setMenu] = useState(null);
  const [actionPack, setActionPack] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [packForDetails, setPackForDetails] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [packToAssign, setPackToAssign] = useState(null);
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assigningGuide, setAssigningGuide] = useState(false);
  const [formInitialStep, setFormInitialStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const hasAssignedGuide = (pack) => Boolean(pack?.guideId || pack?.guideName);

  // Load packs on mount
  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await fetchAgencyPackUmrah();
      setPacks(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors du chargement des packs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePack = async (packData) => {
    setLoading(true);
    try {
      if (view === "edit" && currentPack) {
        await updatePackUmrah(currentPack.id, packData);
        setSnackbar({ open: true, message: "Pack modifié avec succès", severity: "success" });
      } else {
        await createPackUmrah(packData);
        setSnackbar({ open: true, message: "Pack créé avec succès", severity: "success" });
      }
      await loadPacks();
      setView("list");
      setCurrentPack(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors de l'enregistrement",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (pack) => {
    setPackToDelete(pack);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPackToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!packToDelete) return;
    setLoading(true);
    try {
      await deletePackUmrah(packToDelete.id);
      setSnackbar({ open: true, message: "Pack supprimé avec succès", severity: "success" });
      await loadPacks();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors de la suppression",
        severity: "error",
      });
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };

  const handleEditPack = (pack) => {
    const targetPack = pack || actionPack;
    if (!targetPack) return;
    setFormInitialStep(0);
    setCurrentPack(targetPack);
    setView("edit");
    closeMenu();
  };

  const loadGuides = async () => {
    setGuidesLoading(true);
    try {
      const data = await fetchAgencyGuides();
      setGuides(Array.isArray(data) ? data : []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors du chargement des guides",
        severity: "error",
      });
      setGuides([]);
    } finally {
      setGuidesLoading(false);
    }
  };

  const handleOpenAssignGuide = async () => {
    if (!actionPack) return;
    setPackToAssign(actionPack);
    setSelectedGuideId("");
    setAssignDialogOpen(true);
    closeMenu();
    await loadGuides();
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setPackToAssign(null);
    setSelectedGuideId("");
  };

  const handleConfirmAssignGuide = async () => {
    if (!packToAssign || !selectedGuideId) return;

    const guide = guides.find((item) => item.id === selectedGuideId);
    if (!guide) return;

    setAssigningGuide(true);
    try {
      await updatePackUmrah(packToAssign.id, {
        guideId: guide.id,
        guideName: `${guide.firstName || ""} ${guide.lastName || ""}`.trim(),
        guideLanguages: Array.isArray(guide.languages) ? guide.languages : [],
      });
      setSnackbar({
        open: true,
        message: `Guide affecté au pack "${packToAssign.title}"`,
        severity: "success",
      });
      await loadPacks();
      handleCloseAssignDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors de l'affectation du guide",
        severity: "error",
      });
    } finally {
      setAssigningGuide(false);
    }
  };

  const handleOpenDetails = (pack) => {
    setPackForDetails(pack);
    setDetailsOpen(true);
  };

  const openMenu = (event, pack) => {
    event.stopPropagation();
    setMenu(event.currentTarget);
    setActionPack(pack);
  };

  const closeMenu = () => {
    setMenu(null);
    setActionPack(null);
  };

  const handleDeleteFromMenu = () => {
    openDeleteDialog(actionPack);
    closeMenu();
  };

  const handleArchivePack = async () => {
    if (!actionPack) return;
    setLoading(true);
    try {
      await updatePackUmrah(actionPack.id, { isArchived: true });
      setSnackbar({ open: true, message: "Pack archivé avec succès", severity: "success" });
      await loadPacks();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors de l'archivage",
        severity: "error",
      });
    } finally {
      setLoading(false);
      closeMenu();
    }
  };

  const handleUnarchivePack = async () => {
    if (!actionPack) return;
    setLoading(true);
    try {
      await updatePackUmrah(actionPack.id, { isArchived: false });
      setSnackbar({ open: true, message: "Pack désarchivé avec succès", severity: "success" });
      await loadPacks();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erreur lors du désarchivage",
        severity: "error",
      });
    } finally {
      setLoading(false);
      closeMenu();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredPacks = packs.filter(
    (pack) =>
      Boolean(pack.isArchived) === showArchived &&
      (pack.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AgencyPageShell>
      {view !== "list" ? (
        <AddPackForm
          initialData={currentPack}
          initialStep={formInitialStep}
          onCancel={() => {
            setView("list");
            setCurrentPack(null);
            setFormInitialStep(0);
          }}
          onSave={handleSavePack}
        />
      ) : (
        <>
          <MDBox className="agency-hero reveal-up" mb={3}>
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
                  <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>
                    inventory_2
                  </Icon>
                </MDBox>
                <MDBox>
                  <MDTypography className="agency-hero__title" variant="h5" color="white">
                    Gestion des Packs Umrah
                  </MDTypography>
                  <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                    Créez et gérez vos offres de pèlerinage pour vos clients.
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{ position: "relative", zIndex: 1 }}
              >
                <MDInput
                  size="small"
                  placeholder="Rechercher un pack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                      "&:hover fieldset": { borderColor: "white" },
                    },
                    "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.7)" },
                  }}
                />
                <MDBox display="flex" alignItems="center" gap={1}>
                  {(showArchived || packs.some((p) => p.isArchived)) && (
                    <MDButton
                      variant="text"
                      color="white"
                      onClick={() => setShowArchived(!showArchived)}
                      sx={{
                        color: "white !important",
                        bgcolor: showArchived ? "rgba(255,255,255,0.2)" : "transparent",
                        borderRadius: "10px",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                      }}
                    >
                      <Icon sx={{ mr: 1 }}>{showArchived ? "visibility" : "archive"}</Icon>
                      {showArchived ? "Voir Actifs" : "Archives"}
                    </MDButton>
                  )}
                  <MDButton
                    variant="gradient"
                    color="dark"
                    onClick={() => setView("add")}
                    sx={{ color: "white !important", whiteSpace: "nowrap" }}
                  >
                    <Icon sx={{ mr: 0.5, fontSize: "18px !important" }}>add</Icon>
                    Nouveau Pack
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox className="reveal-up reveal-up-1">
            {loading ? (
              <Card sx={{ p: 6, textAlign: "center" }}>
                <CircularProgress color="success" mb={2} />
                <MDTypography variant="h6" color="text">
                  Chargement des packs...
                </MDTypography>
              </Card>
            ) : filteredPacks.length === 0 ? (
              <Card sx={{ p: 6, textAlign: "center" }}>
                <MDBox
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(27,94,32,0.1), rgba(76,175,80,0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ color: "#1b5e20 !important", fontSize: "30px !important" }}>
                    inventory_2
                  </Icon>
                </MDBox>
                <MDTypography variant="h6" fontWeight="bold" mb={0.5}>
                  Aucun pack trouvé
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {searchTerm
                    ? "Aucun résultat pour votre recherche."
                    : "Commencez par créer votre premier pack Umrah."}
                </MDTypography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredPacks.map((pack) => (
                  <Grid item xs={12} md={6} lg={4} key={pack.id}>
                    <Card
                      sx={{
                        height: "100%",
                        boxShadow: 3,
                        position: "relative",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: (theme) => theme.shadows[10],
                        },
                      }}
                      onClick={() => handleOpenDetails(pack)}
                    >
                      <MDBox position="absolute" top={10} right={10} zIndex={2}>
                        <MDTypography
                          color="secondary"
                          sx={{
                            cursor: "pointer",
                            lineHeight: 0,
                            bgcolor: "rgba(255,255,255,0.8)",
                            borderRadius: "50%",
                            p: 0.5,
                          }}
                          onClick={(e) => openMenu(e, pack)}
                        >
                          <Icon>more_vert</Icon>
                        </MDTypography>
                      </MDBox>

                      <MDBox p={2}>
                        <MDBox
                          width="100%"
                          height="180px"
                          borderRadius="lg"
                          bgColor="grey-200"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          mb={2}
                          sx={{ overflow: "hidden", boxShadow: (theme) => theme.shadows[2] }}
                        >
                          {pack.imageUrl ? (
                            <MDBox
                              component="img"
                              src={pack.imageUrl}
                              width="100%"
                              height="100%"
                              sx={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Icon fontSize="large" color="disabled">
                              beach_access
                            </Icon>
                          )}
                        </MDBox>
                        <MDBox textAlign="center" position="relative">
                          <MDTypography variant="h6" fontWeight="bold" textTransform="capitalize">
                            {pack.title}
                          </MDTypography>
                          <MDTypography variant="button" color="text" fontWeight="regular">
                            Du {pack.departureDate} au {pack.arrivalDate}
                          </MDTypography>
                          <Divider sx={{ my: 2 }} />
                          <MDBox display="flex" justifyContent="center" alignItems="center">
                            <MDTypography variant="h5" color="success" fontWeight="bold">
                              {pack.price} DT
                            </MDTypography>
                          </MDBox>
                          <MDBox mt={2}>
                            <MDTypography variant="caption" color="text" fontWeight="bold">
                              Guide:{" "}
                            </MDTypography>
                            <MDTypography variant="caption" color="dark" fontWeight="medium">
                              {pack.guideName || "Non assigné"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </MDBox>
        </>
      )}
      {/* Action Menu */}
      <Menu
        anchorEl={menu}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(menu)}
        onClose={closeMenu}
        keepMounted
      >
        {!hasAssignedGuide(actionPack) && (
          <MenuItem onClick={handleOpenAssignGuide}>
            <Icon sx={{ mr: 1 }}>person_add</Icon> Affecter Guide
          </MenuItem>
        )}
        <MenuItem onClick={() => handleEditPack(actionPack)}>
          <Icon sx={{ mr: 1 }}>edit</Icon> Modifier
        </MenuItem>
        {actionPack?.isArchived ? (
          <MenuItem onClick={handleUnarchivePack}>
            <Icon sx={{ mr: 1 }}>unarchive</Icon> Désarchiver
          </MenuItem>
        ) : (
          <MenuItem onClick={handleArchivePack}>
            <Icon sx={{ mr: 1 }}>archive</Icon> Archiver
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleDeleteFromMenu} sx={{ color: "error.main" }}>
          <Icon sx={{ mr: 1 }}>delete</Icon> Supprimer
        </MenuItem>
      </Menu>

      {/* Detail View Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="body"
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <MDTypography variant="h5" fontWeight="bold">
            Détails du Pack : {packForDetails?.title}
          </MDTypography>
          <Icon sx={{ cursor: "pointer" }} onClick={() => setDetailsOpen(false)}>
            close
          </Icon>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDBox
                component="img"
                src={packForDetails?.imageUrl || ""}
                width="100%"
                borderRadius="lg"
                sx={{ boxShadow: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography variant="h4" color="success" fontWeight="bold" mb={1}>
                {packForDetails?.price} DT
              </MDTypography>
              <MDTypography
                variant="button"
                color="text"
                fontWeight="medium"
                display="block"
                mb={2}
              >
                Période : Du {packForDetails?.departureDate} au {packForDetails?.arrivalDate}
              </MDTypography>
              <Divider />
              <MDBox mt={2}>
                <MDTypography variant="h6" fontWeight="bold" mb={1}>
                  Logistique
                </MDTypography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Hôtel Mecque:
                    </MDTypography>
                    <MDTypography variant="button" display="block">
                      {packForDetails?.hotelMekkah} ({packForDetails?.hotelMekkahStars}★)
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Hôtel Médine:
                    </MDTypography>
                    <MDTypography variant="button" display="block">
                      {packForDetails?.hotelMedina} ({packForDetails?.hotelMedinaStars}★)
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Transport:
                    </MDTypography>
                    <MDTypography variant="button" display="block">
                      {packForDetails?.volDirect ? "Vol Direct" : "Avec Escale"}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Guide:
                    </MDTypography>
                    <MDTypography variant="button" display="block">
                      {packForDetails?.guideName || "Non spécifié"}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" fontWeight="bold" mt={2} mb={1}>
                Description
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {packForDetails?.description}
              </MDTypography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDetailsOpen(false)} color="dark">
            Fermer
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => {
              handleEditPack(packForDetails);
              setDetailsOpen(false);
            }}
          >
            Modifier
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Assign Guide Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold">
            Affecter un guide
          </MDTypography>
          <MDTypography variant="button" color="text" display="block" mt={0.5}>
            Pack : {packToAssign?.title}
          </MDTypography>
        </DialogTitle>
        <DialogContent dividers>
          {guidesLoading ? (
            <MDBox display="flex" justifyContent="center" py={4}>
              <CircularProgress color="success" />
            </MDBox>
          ) : guides.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucun guide disponible. Créez d&apos;abord un guide dans la section Guides.
            </MDTypography>
          ) : (
            <List disablePadding>
              {guides.map((guide) => {
                const fullName = `${guide.firstName || ""} ${guide.lastName || ""}`.trim();
                const languages = Array.isArray(guide.languages) ? guide.languages.join(", ") : "—";

                return (
                  <ListItemButton
                    key={guide.id}
                    selected={selectedGuideId === guide.id}
                    onClick={() => setSelectedGuideId(guide.id)}
                    sx={{ borderRadius: "10px", mb: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={resolveMediaUrl(guide.photo)} sx={{ bgcolor: "#1b5e20" }}>
                        {(guide.firstName?.[0] || "G").toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={fullName || "Guide"}
                      secondary={`Langues : ${languages}`}
                    />
                    <Radio
                      checked={selectedGuideId === guide.id}
                      value={guide.id}
                      color="success"
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={handleCloseAssignDialog} color="dark">
            Annuler
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            disabled={!selectedGuideId || assigningGuide || guides.length === 0}
            onClick={handleConfirmAssignGuide}
          >
            {assigningGuide ? "Affectation..." : "Affecter"}
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer le pack &quot;{packToDelete?.title}&quot; ? Cette action
            est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeDeleteDialog} color="dark" sx={{ color: "white !important" }}>
            Annuler
          </MDButton>
          <MDButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="gradient"
            sx={{ color: "white !important" }}
          >
            Supprimer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AgencyPageShell>
  );
}

export default AgencyPacks;
