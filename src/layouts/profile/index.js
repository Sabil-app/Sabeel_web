/**
========================================================
* Material Dashboard 2 React - v2.2.0
========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";

// Auth
import {
  clearAuth,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  fetchCurrentProfile,
  getCurrentUser,
  uploadMyCoverImage,
  uploadMyProfileImage,
  fetchAdmins,
} from "auth/adminAgenceAuth";

// Overview page components
import Header from "layouts/profile/components/Header";

// Data
import profilesListData from "layouts/profile/data/profilesListData";

const availableRules = [
  "Voir Wallet & Finances",
  "Gestion des Agences",
  "Gestion des Guides",
  "Ajout/Modération Admins",
  "Consulter SOS Alerts",
];

function Overview() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Richard Davis");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [profileEmail, setProfileEmail] = useState("richard.davis@sabeel.tn");
  const [profilePhone, setProfilePhone] = useState("+216 22 123 456");
  const [profileLocation] = useState("Tunis, Tunisie");
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Add/Edit Admin Modal States
  const [openAddAdmin, setOpenAddAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    password: "",
    rules: [],
  });

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Error loading admins:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setUserName(storedUser.fullName || "");
      setProfileEmail(storedUser.email || "");
      setProfilePhone(storedUser.phoneNumber || "");
    }

    fetchCurrentProfile()
      .then((u) => {
        setUser(u);
        setUserName(u.fullName || "");
        setProfileEmail(u.email || "");
        setProfilePhone(u.phoneNumber || "");
        setProfileImage(u.profileImageUrl || "");
        setCoverImage(u.coverImageUrl || "");

        // Si c'est un admin, on charge la liste des admins
        const currentRole = String(u.activeRole || "").toLowerCase();
        if (currentRole === "admin" || currentRole === "sub_admin" || currentRole === "sub-admin") {
          loadAdmins();
        }
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        // Do not force logout here; allow the rest of the app to continue.
      });
  }, [navigate]);

  const handleOpenAddAdmin = () => {
    setIsEditing(false);
    setSelectedAdmin(null);
    setNewAdmin({ fullName: "", email: "", password: "", rules: [] });
    setOpenAddAdmin(true);
  };

  const handleCloseAddAdmin = () => {
    setOpenAddAdmin(false);
    setNewAdmin({ fullName: "", email: "", password: "", rules: [] });
    setSubmitError("");
    setIsEditing(false);
    setSelectedAdmin(null);
  };

  const handleOpenAdminMenu = (event, admin) => {
    setAdminMenuAnchor(event.currentTarget);
    setSelectedAdmin(admin);
  };

  const handleCloseAdminMenu = () => {
    setAdminMenuAnchor(null);
  };

  const handleEditAdmin = () => {
    if (!selectedAdmin) return;
    setIsEditing(true);
    setNewAdmin({
      fullName: selectedAdmin.fullName || selectedAdmin.name || "",
      email: selectedAdmin.email || "",
      password: "", // On ne charge pas le mot de passe
      rules:
        selectedAdmin.permissions ||
        (selectedAdmin.description === "Primary Admin" ? availableRules : []),
    });
    setOpenAddAdmin(true);
    handleCloseAdminMenu();
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'admin ${
          selectedAdmin.fullName || selectedAdmin.name
        } ?`
      )
    ) {
      try {
        await deleteSubAdmin(selectedAdmin.id);
        loadAdmins();
      } catch (error) {
        alert(error.message || "Erreur lors de la suppression");
      }
    }
    handleCloseAdminMenu();
  };

  const handleRulesChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewAdmin({
      ...newAdmin,
      rules: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleSubmitAdmin = async () => {
    try {
      setSubmitError("");
      setIsSubmittingAdmin(true);

      const payload = {
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        permissions: newAdmin.rules,
      };

      if (newAdmin.password) {
        payload.password = newAdmin.password;
      }

      if (isEditing && selectedAdmin) {
        await updateSubAdmin(selectedAdmin.id, payload);
      } else {
        await createSubAdmin(payload);
      }

      handleCloseAddAdmin();
      loadAdmins();
    } catch (error) {
      setSubmitError(error.message || "Opération échouée");
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Mapper les admins pour ProfilesList
  const adminsListData = admins.map((admin) => ({
    id: admin.id,
    image:
      admin.profileImageUrl ||
      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    name: admin.fullName,
    description: admin.isPrimaryAdmin ? "Primary Admin" : "Sub-Admin",
    permissions: admin.permissions || [],
    email: admin.email,
    action: {
      type: "action",
      color: "info",
      label: "Gérer",
      onClick: (e) => handleOpenAdminMenu(e, admin),
    },
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header
        userName={userName}
        onUserNameChange={setUserName}
        profileImage={profileImage}
        onProfileImageChange={setProfileImage}
        onProfileImageUpload={async (file) => {
          const updatedUser = await uploadMyProfileImage(file);
          setProfileImage(updatedUser.profileImageUrl || "");
          setCoverImage(updatedUser.coverImageUrl || "");
        }}
        coverImage={coverImage}
        onCoverImageChange={setCoverImage}
        onCoverImageUpload={async (file) => {
          const updatedUser = await uploadMyCoverImage(file);
          setProfileImage(updatedUser.profileImageUrl || "");
          setCoverImage(updatedUser.coverImageUrl || "");
        }}
      >
        <MDBox mt={5} mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={8}>
              <ProfileInfoCard
                title="profile information"
                description="Administrateur principal de la plateforme Sabeel. Responsable de la validation des agences, de la modération des guides et de la gestion financière globale du système."
                info={{
                  fullName: userName,
                  mobile: profilePhone,
                  email: profileEmail,
                  location: profileLocation,
                }}
                social={[]}
                action={{ route: "", tooltip: "Modifier le profil" }}
                shadow={false}
              />
            </Grid>
            <Grid item xs={12} md={5} lg={4}>
              <ProfilesList
                title="admins"
                profiles={adminsListData}
                shadow={false}
                action={
                  user?.isPrimaryAdmin
                    ? {
                        onClick: handleOpenAddAdmin,
                      }
                    : null
                }
              />
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />

      {/* Modal Ajout/Edit Admin */}
      <Dialog open={openAddAdmin} onClose={handleCloseAddAdmin} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
          <MDTypography variant="h4" fontWeight="bold" color="success">
            {isEditing ? "Modifier l'Admin" : "Ajouter un Admin"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox pt={2} display="flex" flexDirection="column" gap={3}>
            <MDInput
              label="Nom complet"
              type="text"
              fullWidth
              value={newAdmin.fullName}
              onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
            />
            <MDInput
              label="Email"
              type="email"
              fullWidth
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            />
            <MDInput
              label={isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
              type="password"
              fullWidth
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel id="rules-label">Permissions / Rôles</InputLabel>
              <Select
                labelId="rules-label"
                id="rules-select"
                multiple
                value={newAdmin.rules}
                onChange={handleRulesChange}
                input={<OutlinedInput label="Permissions / Rôles" />}
                renderValue={(selected) => selected.join(", ")}
                sx={{ height: "45px" }}
              >
                {availableRules.map((rule) => (
                  <MenuItem key={rule} value={rule}>
                    <Checkbox checked={newAdmin.rules.indexOf(rule) > -1} color="success" />
                    <ListItemText primary={rule} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {submitError && (
              <MDTypography variant="caption" color="error">
                {submitError}
              </MDTypography>
            )}
          </MDBox>
        </DialogContent>
        <MDBox p={3}>
          <MDButton
            variant="gradient"
            color="success"
            fullWidth
            onClick={handleSubmitAdmin}
            disabled={
              !newAdmin.fullName ||
              !newAdmin.email ||
              (!isEditing && !newAdmin.password) ||
              newAdmin.rules.length === 0 ||
              isSubmittingAdmin
            }
          >
            {isSubmittingAdmin
              ? "En cours..."
              : isEditing
              ? "Enregistrer les modifications"
              : "Créer le compte Admin"}
          </MDButton>
          <MDBox mt={1}>
            <MDButton variant="text" color="dark" fullWidth onClick={handleCloseAddAdmin}>
              Annuler
            </MDButton>
          </MDBox>
        </MDBox>
      </Dialog>

      {/* Menu Actions Admin */}
      <Menu
        anchorEl={adminMenuAnchor}
        open={Boolean(adminMenuAnchor)}
        onClose={handleCloseAdminMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditAdmin}>
          <Icon sx={{ mr: 1 }}>edit</Icon> Modifier
        </MenuItem>
        <MenuItem
          onClick={handleDeleteAdmin}
          disabled={selectedAdmin?.isPrimaryAdmin || selectedAdmin?.description === "Primary Admin"}
          sx={{ color: "error.main" }}
        >
          <Icon sx={{ mr: 1, color: "error.main" }}>delete</Icon> Supprimer
        </MenuItem>
      </Menu>
    </DashboardLayout>
  );
}

export default Overview;
