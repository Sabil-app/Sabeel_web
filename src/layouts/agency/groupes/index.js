import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchGroups,
  createGroup,
  updateGroup,
  archiveGroup,
  unarchiveGroup,
  deleteGroup,
  fetchAgencyPackUmrah,
  fetchAgencyGuides,
  fetchAvailablePilgrims,
  assignPilgrimsToGroup,
  removePilgrimFromGroup,
  fetchGroupById,
} from "auth/adminAgenceAuth";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

// Custom Components
import GroupForm from "./components/GroupForm";
import { resolveMediaUrl } from "utils/resolveMediaUrl";

function AgencyGroupes() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list", "form"
  const [groups, setGroups] = useState([]);
  const [packs, setPacks] = useState([]);
  const [guides, setGuides] = useState([]);
  const [availablePilgrims, setAvailablePilgrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Dialogs
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // State for logic
  const [editingGroup, setEditingGroup] = useState(null);
  const [formInitialStep, setFormInitialStep] = useState(0);
  const [groupDetails, setGroupDetails] = useState(null);
  const [menu, setMenu] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, packsData, guidesData, pilgrimsData] = await Promise.all([
        fetchGroups(),
        fetchAgencyPackUmrah(),
        fetchAgencyGuides(),
        fetchAvailablePilgrims(),
      ]);
      setGroups(groupsData);
      setPacks(packsData);
      setGuides(guidesData);
      setAvailablePilgrims(pilgrimsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (group = null, step = 0) => {
    setEditingGroup(group);
    setFormInitialStep(step);
    setView("form");
    handleCloseMenu();
  };

  const handleCancelForm = () => {
    setView("list");
    setEditingGroup(null);
    setFormInitialStep(0);
  };

  const handleSaveGroup = async (formData, pilgrims) => {
    try {
      const submitData = {
        ...formData,
        departureDate: formData.departureDate || null,
        packId: formData.packId || null,
        guideId: formData.guideId || null,
        capacity: parseInt(formData.capacity, 10),
      };

      let result;
      if (editingGroup) {
        result = await updateGroup(editingGroup.id, submitData);
      } else {
        result = await createGroup(submitData);
      }

      // If we have pilgrims selected, assign them
      if (pilgrims.length > 0) {
        await assignPilgrimsToGroup(result.id || editingGroup?.id, pilgrims);
      }

      await loadData();
      setView("list");
      setEditingGroup(null);
      setFormInitialStep(0);
    } catch (error) {
      alert(error.message || "Erreur lors de l'enregistrement du groupe.");
    }
  };

  const handleOpenMenu = (event, group) => {
    setMenu(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleCloseMenu = () => {
    setMenu(null);
    setSelectedGroup(null);
  };

  const handleShowDetails = async (group) => {
    try {
      const data = await fetchGroupById(group.id);
      setGroupDetails(data);
      setOpenDetailsDialog(true);
    } catch (error) {
      alert("Erreur lors de la récupération des détails.");
    }
  };

  const handleOpenAssignManual = () => {
    handleOpenForm(selectedGroup, 1);
  };

  const handleRemovePilgrim = async (pilgrimId) => {
    if (!window.confirm("Retirer ce pèlerin du groupe ?")) return;
    try {
      await removePilgrimFromGroup(groupDetails.id, pilgrimId);
      const updated = await fetchGroupById(groupDetails.id);
      setGroupDetails(updated);
      await loadData();
    } catch (error) {
      alert("Erreur lors de la suppression du pèlerin.");
    }
  };

  const handleArchive = async () => {
    if (!selectedGroup) return;
    try {
      await archiveGroup(selectedGroup.id);
      await loadData();
      handleCloseMenu();
    } catch (error) {
      alert("Erreur lors de l'archivage.");
    }
  };

  const handleUnarchive = async () => {
    if (!selectedGroup) return;
    try {
      await unarchiveGroup(selectedGroup.id);
      await loadData();
      handleCloseMenu();
    } catch (error) {
      alert("Erreur lors du désarchivage.");
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup || !window.confirm("Supprimer définitivement ce groupe ?")) return;
    try {
      await deleteGroup(selectedGroup.id);
      await loadData();
      handleCloseMenu();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  const filteredGroups = groups.filter((g) => (showArchived ? true : g.status !== "archived"));

  return (
    <AgencyPageShell>
      {view === "form" ? (
        <GroupForm
          initialData={editingGroup}
          initialStep={formInitialStep}
          packs={packs}
          guides={guides}
          availablePilgrims={availablePilgrims}
          onSave={handleSaveGroup}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          <MDBox className="agency-hero reveal-up" mb={3}>
            <MDBox
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ position: "relative", zIndex: 1 }}
            >
              <MDBox className="agency-icon-chip">
                <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>
                  groups_3
                </Icon>
              </MDBox>
              <MDBox flex={1}>
                <MDTypography className="agency-hero__title" variant="h5" color="white">
                  Gestion des Groupes
                </MDTypography>
                <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                  Organisez vos pèlerins et pilotez vos départs en toute simplicité.
                </MDTypography>
              </MDBox>
              <MDBox display="flex" gap={2} alignItems="center">
                <Tooltip title={showArchived ? "Masquer les archives" : "Voir les archives"}>
                  <MDBox
                    onClick={() => setShowArchived(!showArchived)}
                    sx={{
                      cursor: "pointer",
                      color: "white !important",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: showArchived ? "rgba(255,255,255,0.2)" : "transparent",
                      border: "1px solid rgba(255,255,255,0.3)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <Icon sx={{ color: "white !important" }}>
                      {showArchived ? "inventory_2" : "archive"}
                    </Icon>
                  </MDBox>
                </Tooltip>
                <MDButton
                  variant="outlined"
                  color="white"
                  startIcon={<Icon>people</Icon>}
                  onClick={() => navigate("/agency/pelerins")}
                  sx={{
                    borderRadius: "10px",
                    color: "white !important",
                    borderColor: "white !important",
                  }}
                >
                  Liste Pèlerins
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="success"
                  startIcon={<Icon>add</Icon>}
                  onClick={() => handleOpenForm()}
                  sx={{ borderRadius: "10px" }}
                >
                  Nouveau Groupe
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox py={3}>
            <Grid container spacing={3}>
              {loading ? (
                <Grid item xs={12}>
                  <MDBox textAlign="center" py={10}>
                    <CircularProgress color="success" />
                    <MDTypography variant="button" display="block" mt={2} color="text">
                      Chargement des groupes...
                    </MDTypography>
                  </MDBox>
                </Grid>
              ) : filteredGroups.length === 0 ? (
                <Grid item xs={12}>
                  <Card sx={{ p: 5, textAlign: "center" }}>
                    <Icon sx={{ fontSize: "48px !important", color: "grey-300", mb: 2 }}>
                      groups
                    </Icon>
                    <MDTypography variant="h6" color="text">
                      Aucun groupe trouvé
                    </MDTypography>
                    <MDBox mt={2}>
                      <MDButton variant="outlined" color="success" onClick={() => handleOpenForm()}>
                        Créer un groupe
                      </MDButton>
                    </MDBox>
                  </Card>
                </Grid>
              ) : (
                filteredGroups.map((group) => (
                  <Grid item xs={12} md={6} lg={4} key={group.id}>
                    <Card
                      sx={{
                        height: "100%",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        },
                        overflow: "hidden",
                        border: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      onClick={() => handleShowDetails(group)}
                    >
                      {/* Group Image */}
                      <MDBox position="relative" height="160px">
                        <MDBox
                          component="img"
                          src={
                            resolveMediaUrl(group.imageUrl) ||
                            "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop"
                          }
                          width="100%"
                          height="100%"
                          sx={{ objectFit: "cover" }}
                        />
                        <MDBox
                          position="absolute"
                          top={10}
                          right={10}
                          sx={{ zIndex: 1, display: "flex", gap: 0.5 }}
                        >
                          <MDBadge
                            badgeContent={group.status === "active" ? "En cours" : "Archivé"}
                            color={group.status === "active" ? "success" : "secondary"}
                            variant="gradient"
                            size="xs"
                          />
                        </MDBox>
                        <MDBox
                          position="absolute"
                          bottom={0}
                          left={0}
                          width="100%"
                          height="50%"
                          sx={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                          }}
                        />
                        <MDTypography
                          variant="h6"
                          color="white"
                          sx={{
                            position: "absolute",
                            bottom: 10,
                            left: 15,
                            zIndex: 1,
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {group.name}
                        </MDTypography>
                      </MDBox>

                      <MDBox p={3}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            {group.pilgrims?.length || 0} / {group.capacity} Pèlerins
                          </MDTypography>
                          <Icon
                            sx={{ cursor: "pointer", color: "grey-400" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMenu(e, group);
                            }}
                          >
                            more_vert
                          </Icon>
                        </MDBox>

                        <Divider sx={{ my: 2 }} />

                        <MDBox mb={2}>
                          <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                            <Icon fontSize="small" color="success">
                              inventory_2
                            </Icon>
                            <MDTypography variant="button" fontWeight="medium">
                              Pack: {group.pack?.title || "N/A"}
                            </MDTypography>
                          </MDBox>
                          <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                            <Icon fontSize="small" color="success">
                              person
                            </Icon>
                            <MDTypography variant="button" fontWeight="medium">
                              Guide:{" "}
                              {group.guide
                                ? `${group.guide.firstName} ${group.guide.lastName}`
                                : "N/A"}
                            </MDTypography>
                          </MDBox>
                          <MDBox display="flex" alignItems="center" gap={1}>
                            <Icon fontSize="small" color="success">
                              event
                            </Icon>
                            <MDTypography variant="button" color="text">
                              Départ: {group.departureDate || "À définir"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>

                        <MDBox mt="auto" pt={1}>
                          <MDBox
                            width="100%"
                            bgColor="grey-100"
                            borderRadius="md"
                            height="8px"
                            position="relative"
                          >
                            <MDBox
                              width={`${Math.min(
                                100,
                                ((group.pilgrims?.length || 0) / group.capacity) * 100
                              )}%`}
                              height="100%"
                              bgColor="success"
                              borderRadius="md"
                            />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </MDBox>
        </>
      )}

      {/* Main Menu */}
      <Menu anchorEl={menu} open={Boolean(menu)} onClose={handleCloseMenu} keepMounted>
        <MenuItem onClick={handleOpenAssignManual}>
          <Icon fontSize="small" sx={{ mr: 1 }}>
            person_add
          </Icon>{" "}
          Affecter pèlerins
        </MenuItem>
        <MenuItem onClick={() => handleOpenForm(selectedGroup)}>
          <Icon fontSize="small" sx={{ mr: 1 }}>
            edit
          </Icon>{" "}
          Modifier
        </MenuItem>
        {selectedGroup?.status === "archived" ? (
          <MenuItem onClick={handleUnarchive}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              unarchive
            </Icon>{" "}
            Désarchiver
          </MenuItem>
        ) : (
          <MenuItem onClick={handleArchive}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              archive
            </Icon>{" "}
            Archiver
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Icon fontSize="small" sx={{ mr: 1, color: "inherit" }}>
            delete
          </Icon>{" "}
          Supprimer
        </MenuItem>
      </Menu>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        fullWidth
        maxWidth="md"
      >
        {groupDetails && (
          <>
            <DialogTitle
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <MDBox>
                <MDTypography variant="h5">{groupDetails.name}</MDTypography>
                <MDTypography variant="caption" color="text">
                  Détails du groupe et membres
                </MDTypography>
              </MDBox>
              <Icon sx={{ cursor: "pointer" }} onClick={() => setOpenDetailsDialog(false)}>
                close
              </Icon>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <MDBox
                    component="img"
                    src={
                      resolveMediaUrl(groupDetails.imageUrl) ||
                      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop"
                    }
                    width="100%"
                    borderRadius="lg"
                    mb={2}
                    sx={{ objectFit: "cover", height: "200px" }}
                  />
                  <MDBox bgColor="grey-100" p={2} borderRadius="lg">
                    <MDTypography variant="h6" gutterBottom>
                      Infos Groupe
                    </MDTypography>
                    <Divider />
                    <MDBox display="flex" flexDirection="column" gap={1} mt={1}>
                      <MDTypography variant="button" display="block">
                        <b>Départ:</b> {groupDetails.departureDate || "À définir"}
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        <b>Capacité:</b> {groupDetails.capacity}
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        <b>Pack:</b> {groupDetails.pack?.title || "N/A"}
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        <b>Guide:</b>{" "}
                        {groupDetails.guide
                          ? `${groupDetails.guide.firstName} ${groupDetails.guide.lastName}`
                          : "N/A"}
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        <b>Status:</b>{" "}
                        <MDBadge
                          badgeContent={groupDetails.status}
                          color={groupDetails.status === "active" ? "success" : "secondary"}
                          variant="gradient"
                          size="xs"
                        />
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={8}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6">
                      Membres du groupe ({groupDetails.pilgrims?.length || 0})
                    </MDTypography>
                    <MDButton
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<Icon>person_add</Icon>}
                      onClick={() => {
                        setOpenDetailsDialog(false);
                        handleOpenForm(groupDetails, 1);
                      }}
                    >
                      Ajouter
                    </MDButton>
                  </MDBox>
                  <List
                    sx={{
                      bgcolor: "white",
                      borderRadius: "lg",
                      border: "1px solid #eee",
                    }}
                  >
                    {groupDetails.pilgrims?.length > 0 ? (
                      groupDetails.pilgrims.map((p) => (
                        <ListItem key={p.id} divider>
                          <ListItemAvatar>
                            <Avatar src={p.photo}>{p.lastName[0]}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <MDTypography variant="button" fontWeight="bold">
                                {p.firstName} {p.lastName}
                              </MDTypography>
                            }
                            secondary={p.email}
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Retirer du groupe">
                              <Icon
                                color="error"
                                sx={{ cursor: "pointer" }}
                                onClick={() => handleRemovePilgrim(p.id)}
                              >
                                remove_circle
                              </Icon>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    ) : (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="button" color="text">
                          Aucun pèlerin dans ce groupe.
                        </MDTypography>
                      </MDBox>
                    )}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </AgencyPageShell>
  );
}

export default AgencyGroupes;
