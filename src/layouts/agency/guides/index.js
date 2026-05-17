import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import MDInput from "components/MDInput";

// Components
import AddGuideForm from "layouts/agency/guides/components/AddGuideForm";
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";
import {
  createAgencyGuide,
  deleteAgencyGuide,
  fetchAgencyGuides,
  updateAgencyGuide,
} from "auth/adminAgenceAuth";

function AgencyGuides() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list", "add", "edit"
  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentGuide, setCurrentGuide] = useState(null);
  const [menu, setMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionGuide, setActionGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAgencyGuides();
        setGuides(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message || "Impossible de charger les guides");
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  const handleContactGuide = () => {
    const guideUserId = actionGuide?.guideUserId;
    if (!guideUserId) {
      setError(
        "Impossible de contacter ce guide: compte Guide non lié (guideUserId manquant). " +
          "Modifiez/Enregistrez le guide pour générer le compte."
      );
      closeMenu();
      return;
    }
    navigate("/agency/messages", {
      state: {
        contactGuideId: guideUserId,
        contactGuideName: `${actionGuide.firstName || ""} ${actionGuide.lastName || ""}`.trim(),
      },
    });
    closeMenu();
  };

  const openMenu = ({ currentTarget }, guide) => {
    setMenu(currentTarget);
    setActionGuide(guide);
  };

  const closeMenu = () => {
    setMenu(null);
    setActionGuide(null);
  };

  const handleSaveGuide = async (guideData) => {
    try {
      setError("");
      if (view === "edit" && currentGuide?.id) {
        const updated = await updateAgencyGuide(currentGuide.id, guideData);
        setGuides((prev) => prev.map((g) => (g.id === currentGuide.id ? updated : g)));
      } else {
        const created = await createAgencyGuide(guideData);
        setGuides((prev) => [created, ...prev]);
      }

      setView("list");
      setCurrentGuide(null);
    } catch (saveError) {
      setError(saveError.message || "Impossible d'enregistrer le guide");
    }
  };

  const handleEdit = () => {
    setCurrentGuide(actionGuide);
    setView("edit");
    closeMenu();
  };

  const handleDeleteOpen = () => {
    setDeleteDialogOpen(true);
    setMenu(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (actionGuide?.id) {
        await deleteAgencyGuide(actionGuide.id);
        setGuides((prev) => prev.filter((g) => g.id !== actionGuide.id));
      }
      setDeleteDialogOpen(false);
      setActionGuide(null);
    } catch (deleteError) {
      setError(deleteError.message || "Impossible de supprimer le guide");
    }
  };

  const handleToggleStatus = async () => {
    if (!actionGuide?.id) return;
    try {
      setError("");
      const nextStatus = actionGuide.status === "active" ? "banned" : "active";
      const updated = await updateAgencyGuide(actionGuide.id, { status: nextStatus });
      setGuides((prev) => prev.map((g) => (g.id === actionGuide.id ? updated : g)));
    } catch (toggleError) {
      setError(toggleError.message || "Impossible de modifier le statut du guide");
    } finally {
      closeMenu();
    }
  };

  const filteredGuides = guides.filter((guide) => {
    const searchStr = (searchTerm || "").toLowerCase();
    const firstName = (guide.firstName || "").toLowerCase();
    const lastName = (guide.lastName || "").toLowerCase();
    const email = (guide.email || "").toLowerCase();

    return (
      firstName.includes(searchStr) ||
      lastName.includes(searchStr) ||
      email.includes(searchStr) ||
      (Array.isArray(guide.languages)
        ? guide.languages.some((l) => (l || "").toLowerCase().includes(searchStr))
        : String(guide.languages || "")
            .toLowerCase()
            .includes(searchStr))
    );
  });

  const renderGuides = filteredGuides.map((guide) => (
    <Grid item xs={12} md={6} lg={4} key={guide.id || guide.email}>
      <Card sx={{ position: "relative", overflow: "visible" }}>
        <MDBox p={2} position="relative">
          <MDBox position="absolute" top={8} right={8} zIndex={2}>
            <IconButton
              size="small"
              onClick={(event) => openMenu(event, guide)}
              aria-label="actions"
              sx={{ backgroundColor: "rgba(255,255,255,0.9)", boxShadow: 1 }}
            >
              <Icon fontSize="small">more_vert</Icon>
            </IconButton>
          </MDBox>
          <MDBox
            display="flex"
            justifyContent="center"
            mt={-4}
            position="absolute"
            left={0}
            right={0}
          >
            <Avatar
              src={guide.photo}
              alt={guide.lastName}
              sx={{
                width: 70,
                height: 70,
                border: "4px solid #fff",
                boxShadow: (theme) => theme.shadows[3],
              }}
            >
              {guide.lastName ? guide.lastName[0] : "?"}
            </Avatar>
          </MDBox>
          <MDBox pt={6} pb={1} px={1} textAlign="center">
            <MDTypography variant="h6" fontWeight="bold" textTransform="capitalize">
              {guide.firstName} {guide.lastName}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular">
              {guide.email}
            </MDTypography>
            <MDBox mt={1}>
              <MDBadge
                badgeContent={guide.status === "active" ? "Actif" : "Suspendu"}
                color={guide.status === "active" ? "success" : "error"}
                variant="gradient"
                size="xs"
              />
            </MDBox>
            <MDBox mt={1}>
              <MDTypography variant="caption" color="text" fontWeight="bold">
                Langues :{" "}
              </MDTypography>
              <MDTypography variant="caption" color="dark" fontWeight="medium">
                {Array.isArray(guide.languages)
                  ? guide.languages.join(", ")
                  : guide.languages || "N/A"}
              </MDTypography>
            </MDBox>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Expérience
                </MDTypography>
                <MDTypography variant="button" display="block">
                  {guide.experience || 0} ans
                </MDTypography>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Tél
                </MDTypography>
                <MDTypography variant="button" display="block">
                  {guide.phone}
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
      </Card>
    </Grid>
  ));

  const actionMenu = (
    <Menu
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
      keepMounted
    >
      <MenuItem onClick={handleEdit}>
        <Icon sx={{ mr: 1 }}>edit</Icon> Modifier
      </MenuItem>
      <MenuItem onClick={handleToggleStatus}>
        <Icon sx={{ mr: 1, color: actionGuide?.status === "active" ? "error" : "success" }}>
          {actionGuide?.status === "active" ? "block" : "check_circle"}
        </Icon>
        {actionGuide?.status === "active" ? "Suspendre (Ban)" : "Réactiver"}
      </MenuItem>
      <MenuItem onClick={handleContactGuide}>
        <Icon sx={{ mr: 1 }}>chat</Icon> Contacter
      </MenuItem>
      <Divider sx={{ my: 0.5 }} />
      <MenuItem onClick={handleDeleteOpen} sx={{ color: "error.main" }}>
        <Icon sx={{ mr: 1 }}>delete</Icon> Supprimer
      </MenuItem>
    </Menu>
  );

  return (
    <AgencyPageShell>
      {view !== "list" ? (
        <AddGuideForm
          initialData={currentGuide}
          onCancel={() => {
            setView("list");
            setCurrentGuide(null);
          }}
          onSave={handleSaveGuide}
        />
      ) : (
        <>
          {error && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error">
                {error}
              </MDTypography>
            </MDBox>
          )}
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
                  <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>tour</Icon>
                </MDBox>
                <MDBox>
                  <MDTypography className="agency-hero__title" variant="h5" color="white">
                    Gestion des Guides
                  </MDTypography>
                  <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                    Recrutez et pilotez vos guides terrain pour une expérience premium.
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
                  placeholder="Rechercher..."
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
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={() => setView("add")}
                  sx={{ color: "white !important", whiteSpace: "nowrap" }}
                >
                  <Icon sx={{ mr: 0.5, fontSize: "18px !important" }}>add</Icon>
                  Nouveau Guide
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox className="reveal-up reveal-up-1">
            {loading ? (
              <Card sx={{ p: 6, textAlign: "center" }}>
                <MDTypography variant="h6" color="text">
                  Chargement des guides...
                </MDTypography>
              </Card>
            ) : guides.length === 0 ? (
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
                    badge
                  </Icon>
                </MDBox>
                <MDTypography variant="h6" fontWeight="bold" mb={0.5}>
                  Aucun guide enregistré
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Cliquez sur &quot;Nouveau Guide&quot; pour commencer.
                </MDTypography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {renderGuides}
              </Grid>
            )}
          </MDBox>
        </>
      )}

      {actionMenu}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer le guide &quot;{actionGuide?.firstName}{" "}
            {actionGuide?.lastName}&quot; ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} color="dark">
            Annuler
          </MDButton>
          <MDButton onClick={handleDeleteConfirm} color="error" variant="gradient">
            Supprimer
          </MDButton>
        </DialogActions>
      </Dialog>
    </AgencyPageShell>
  );
}

export default AgencyGuides;
