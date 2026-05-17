import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import MDInput from "components/MDInput";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Mock data - Ce devrait venir d'une API
const mockPelerins = [
  {
    id: 101,
    name: "Ahmed Mansouri",
    companion: "Leila Mansouri",
    group: "Groupe A - Guide Sami",
    pack: "Umrah Premium",
    passport: "T1234567",
    email: "ahmed.mansouri@email.com",
    phone: "+216 20 123 456",
    dateOfBirth: "1975-05-15",
    nationality: "Tunisia",
    address: "123 Rue de la Paix, Tunis",
    status: "Confirmé",
    registrationDate: "2024-01-15",
    validationDate: "2024-02-01",
    documents: ["Passeport", "Vaccin", "Visa"],
    medicalInfo: "Aucune allergie connue",
    emergencyContact: "Leila Mansouri - +216 20 111 111",
  },
  {
    id: 102,
    name: "Leila Trabelsi",
    group: "Non assigné",
    pack: "Umrah Premium",
    passport: "T9876543",
    email: "leila.trabelsi@email.com",
    phone: "+216 20 654 321",
    dateOfBirth: "1980-03-22",
    nationality: "Tunisia",
    address: "456 Avenue Mohamed Ali, Sfax",
    status: "Confirmé",
    registrationDate: "2024-01-20",
    validationDate: "2024-02-05",
    documents: ["Passeport", "Vaccin", "Visa"],
    medicalInfo: "Diabète - Insuline requise",
    emergencyContact: "Mohamed Trabelsi - +216 20 222 222",
  },
];

const mockGroups = [
  { id: "g1", name: "Groupe A - Guide Sami" },
  { id: "g2", name: "Groupe B - Guide Fatima" },
  { id: "g3", name: "Groupe C - Guide Youssef" },
];

function PelerinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);

  // Documents manquants modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({ documentName: "", message: "" });

  // Group management
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [groupListOpen, setGroupListOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Toast
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });

  // Trouver le pèlerin
  const pelerin = mockPelerins.find((p) => p.id === Number(id));

  const isInGroup = pelerin && pelerin.group && pelerin.group !== "Non assigné";

  const handleOpenActionMenu = (event) => setActionMenuAnchorEl(event.currentTarget);
  const handleCloseActionMenu = () => setActionMenuAnchorEl(null);

  // --- Documents manquants ---
  const handleMissingDocuments = () => {
    handleCloseActionMenu();
    setDocForm({ documentName: "", message: "" });
    setDocModalOpen(true);
  };

  const handleSendDocRequest = () => {
    setDocModalOpen(false);
    setToast({
      open: true,
      type: "success",
      text: `Demande de document envoyée à ${pelerin.name}.`,
    });
    setDocForm({ documentName: "", message: "" });
  };

  // --- Group management ---
  const handleToggleGroup = () => {
    handleCloseActionMenu();
    if (isInGroup) {
      setConfirmLeaveOpen(true);
    } else {
      setSelectedGroup(null);
      setGroupListOpen(true);
    }
  };

  const handleConfirmLeave = () => {
    setConfirmLeaveOpen(false);
    setToast({
      open: true,
      type: "success",
      text: `${pelerin.name} a quitté le groupe « ${pelerin.group} ».`,
    });
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleConfirmGroupAssign = () => {
    if (!selectedGroup) return;
    setGroupListOpen(false);
    const action = isInGroup ? "changé vers" : "ajouté au";
    setToast({
      open: true,
      type: "success",
      text: `${pelerin.name} ${action} « ${selectedGroup.name} ».`,
    });
    setSelectedGroup(null);
  };

  // --- Edit infos ---
  const handleEditInfos = () => {
    handleCloseActionMenu();
    setToast({ open: true, type: "info", text: "Modifier les informations (statique)." });
  };

  // --- Companion contact ---
  const handleCompanionClick = () => {
    navigate("/agency/messages", {
      state: { contactCompanion: pelerin.companion },
    });
  };

  if (!pelerin) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} px={3}>
          <MDTypography variant="h6" color="error">
            Pèlerin non trouvé
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => navigate("/agency/pelerins")}
            sx={{ mt: 2 }}
          >
            Retour à la liste
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <MDBox>
              <MDTypography variant="h6" color="white">
                {pelerin.name}
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <MDBadge
                  badgeContent={pelerin.status}
                  color="success"
                  variant="gradient"
                  size="sm"
                />
                {pelerin.companion && (
                  <MDTypography
                    variant="caption"
                    color="white"
                    opacity={0.9}
                    sx={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      "&:hover": { opacity: 1 },
                    }}
                    onClick={handleCompanionClick}
                  >
                    Accompagnant: <strong>{pelerin.companion}</strong>
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>

            <MDBox display="flex" alignItems="center" gap={1}>
              <MDBox
                textAlign="right"
                sx={{ pr: 1, borderRight: "1px solid rgba(255,255,255,0.22)" }}
              >
                <MDTypography variant="caption" color="white" opacity={0.9}>
                  Passeport: <strong>{pelerin.passport}</strong>
                </MDTypography>
                <MDTypography variant="caption" color="white" opacity={0.9} display="block">
                  Pack: <strong>{pelerin.pack}</strong>
                </MDTypography>
              </MDBox>
              <IconButton
                size="small"
                onClick={handleOpenActionMenu}
                sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 1 }}
              >
                <Icon fontSize="small">more_vert</Icon>
              </IconButton>
            </MDBox>
          </MDBox>

          <MDBox p={3}>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Informations Personnelles
                    </MDTypography>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Email
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.email}
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Téléphone
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.phone}
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Date de Naissance
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.dateOfBirth}
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Nationalité
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.nationality}
                      </MDTypography>
                    </MDBox>

                    <MDBox p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Adresse
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.address}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Informations de Dossier
                    </MDTypography>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Statut
                      </MDTypography>
                      <MDBadge
                        badgeContent={pelerin.status}
                        color="success"
                        variant="gradient"
                        size="sm"
                      />
                    </MDBox>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Groupe Assigné
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.group}
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Date d&apos;Inscription
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.registrationDate}
                      </MDTypography>
                    </MDBox>

                    <MDBox p={1.5} bgColor="grey-100" borderRadius="lg">
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        display="block"
                      >
                        Date de Validation
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        {pelerin.validationDate}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Informations Médicales
                    </MDTypography>

                    <MDBox p={2} bgColor="warning" borderRadius="lg">
                      <MDTypography variant="body2" color="white">
                        {pelerin.medicalInfo}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Contact d&apos;Urgence
                    </MDTypography>

                    <MDBox p={2} bgColor="info" borderRadius="lg">
                      <MDTypography variant="body2" color="white">
                        {pelerin.emergencyContact}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Documents Fournis
                    </MDTypography>

                    <MDBox display="flex" gap={2} flexWrap="wrap">
                      {pelerin.documents.map((doc, index) => (
                        <MDBadge
                          key={index}
                          badgeContent={doc}
                          color="success"
                          variant="gradient"
                          size="lg"
                        />
                      ))}
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Menu 3 points */}
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleCloseActionMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleToggleGroup}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              {isInGroup ? "logout" : "person_add"}
            </Icon>
            {isInGroup ? "Quitter du groupe" : "Ajouter à un groupe"}
          </MenuItem>
          <MenuItem onClick={handleEditInfos}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              edit
            </Icon>
            Modifier les infos
          </MenuItem>
          <MenuItem onClick={handleMissingDocuments}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              description
            </Icon>
            Documents manquants
          </MenuItem>
        </Menu>

        {/* Modal Documents manquants */}
        <Dialog open={docModalOpen} onClose={() => setDocModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon color="warning">description</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                Documents manquants
              </MDTypography>
            </MDBox>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="caption" color="text" display="block" mb={2}>
              Indiquez le document manquant et rédigez un message à envoyer à{" "}
              <strong>{pelerin.name}</strong> pour compléter son dossier.
            </MDTypography>
            <MDInput
              fullWidth
              label="Nom du document manquant"
              placeholder="Ex: Certificat médical, Photo d'identité..."
              value={docForm.documentName}
              onChange={(e) => setDocForm((prev) => ({ ...prev, documentName: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message à envoyer au pèlerin"
              placeholder="Bonjour, veuillez fournir le document suivant..."
              value={docForm.message}
              onChange={(e) => setDocForm((prev) => ({ ...prev, message: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <MDButton color="dark" variant="text" onClick={() => setDocModalOpen(false)}>
              Annuler
            </MDButton>
            <MDButton
              variant="contained"
              disabled={!docForm.documentName.trim() || !docForm.message.trim()}
              sx={{
                backgroundColor: "#4CAF50",
                color: "white !important",
                "&:hover": { backgroundColor: "#388E3C" },
              }}
              onClick={handleSendDocRequest}
            >
              <Icon sx={{ mr: 0.5 }}>send</Icon>
              Envoyer la demande
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Confirmation quitter groupe */}
        <Dialog
          open={confirmLeaveOpen}
          onClose={() => setConfirmLeaveOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <MDTypography variant="button" color="text">
              Voulez-vous retirer <strong>{pelerin.name}</strong> du groupe{" "}
              <strong>« {pelerin.group} »</strong> ?
            </MDTypography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <MDButton color="dark" variant="text" onClick={() => setConfirmLeaveOpen(false)}>
              Annuler
            </MDButton>
            <MDButton variant="contained" color="error" onClick={handleConfirmLeave}>
              Confirmer
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Modal liste des groupes (Ajouter / Changer) */}
        <Dialog
          open={groupListOpen}
          onClose={() => setGroupListOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon color="success">group</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                {isInGroup ? "Changer le groupe" : "Ajouter à un groupe"}
              </MDTypography>
            </MDBox>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="caption" color="text" display="block" mb={2}>
              Sélectionnez un groupe pour <strong>{pelerin.name}</strong>.
            </MDTypography>
            <MDBox display="flex" flexDirection="column" gap={1}>
              {mockGroups.map((group) => {
                const isCurrentGroup = pelerin.group === group.name;
                const isSelected = selectedGroup?.id === group.id;
                return (
                  <Card
                    key={group.id}
                    onClick={() => !isCurrentGroup && handleSelectGroup(group)}
                    sx={{
                      p: 2,
                      cursor: isCurrentGroup ? "default" : "pointer",
                      border: isSelected ? "2px solid #4CAF50" : "1px solid rgba(0,0,0,0.08)",
                      backgroundColor: isCurrentGroup
                        ? "rgba(0,0,0,0.04)"
                        : isSelected
                        ? "rgba(76, 175, 80, 0.06)"
                        : "#fff",
                      opacity: isCurrentGroup ? 0.6 : 1,
                      "&:hover": {
                        backgroundColor: isCurrentGroup
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(76, 175, 80, 0.06)",
                      },
                    }}
                  >
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <Icon color={isSelected ? "success" : "action"}>group</Icon>
                        <MDTypography variant="button" fontWeight="bold" color="dark">
                          {group.name}
                        </MDTypography>
                      </MDBox>
                      {isCurrentGroup && (
                        <MDBadge
                          badgeContent="Groupe actuel"
                          color="dark"
                          variant="gradient"
                          size="xs"
                        />
                      )}
                      {isSelected && !isCurrentGroup && <Icon color="success">check_circle</Icon>}
                    </MDBox>
                  </Card>
                );
              })}
            </MDBox>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <MDButton color="dark" variant="text" onClick={() => setGroupListOpen(false)}>
              Annuler
            </MDButton>
            <MDButton
              variant="contained"
              disabled={!selectedGroup}
              sx={{
                backgroundColor: "#4CAF50",
                color: "white !important",
                "&:hover": { backgroundColor: "#388E3C" },
              }}
              onClick={handleConfirmGroupAssign}
            >
              {isInGroup ? "Changer" : "Ajouter"}
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3500}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            severity={toast.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.text}
          </Alert>
        </Snackbar>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default PelerinDetail;
