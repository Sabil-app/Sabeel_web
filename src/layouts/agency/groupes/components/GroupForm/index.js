import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API
import { apiUpload } from "api/apiClient";
import { resolveMediaUrl } from "utils/resolveMediaUrl";

const SabeelConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopWidth: 2,
    borderRadius: 1,
    transition: "all 0.3s ease",
    zIndex: 0,
    position: "relative",
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "rgba(255, 255, 255, 0.9)",
    },
  },
}));

const steps = ["Informations du Groupe", "Affectation des Pèlerins"];

function GroupForm({
  initialData,
  initialStep = 0,
  packs,
  guides,
  availablePilgrims,
  onSave,
  onCancel,
}) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [selectedPilgrims, setSelectedPilgrims] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    initialData?.imageUrl ? resolveMediaUrl(initialData.imageUrl) : ""
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    packId: initialData?.packId || "",
    guideId: initialData?.guideId || "",
    capacity: initialData?.capacity || 50,
    departureDate: initialData?.departureDate ? initialData.departureDate.split("T")[0] : "",
    imageUrl: initialData?.imageUrl || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("L'image dépasse 5 Mo. Choisissez un fichier plus léger.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    const uploadData = new FormData();
    uploadData.append("image", file);

    setUploading(true);
    try {
      const response = await apiUpload("/admin-agence/groups/upload-image", uploadData);
      const uploadedUrl = response?.publicId || response?.imageUrl || "";

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
      }));

      if (response?.presignedUrl || response?.imageUrl) {
        setPreviewUrl(response.presignedUrl || response.imageUrl);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert(error?.message || "Échec de l'upload de l'image.");
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setPreviewUrl("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleTogglePilgrim = (id) => {
    const currentIndex = selectedPilgrims.indexOf(id);
    const newChecked = [...selectedPilgrims];

    if (currentIndex === -1) {
      if (selectedPilgrims.length < formData.capacity) {
        newChecked.push(id);
      } else {
        alert("Capacité maximale atteinte !");
      }
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedPilgrims(newChecked);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSave(formData, selectedPilgrims);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{
                  border: "2px dashed #ddd",
                  borderRadius: "lg",
                  height: "200px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                  "&:hover": { borderColor: "success.main" },
                }}
                onClick={() => document.getElementById("group-image-upload").click()}
              >
                {previewUrl ? (
                  <MDBox
                    component="img"
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <>
                    {uploading ? (
                      <CircularProgress color="success" />
                    ) : (
                      <>
                        <Icon fontSize="large" color="disabled">
                          add_a_photo
                        </Icon>
                        <MDTypography variant="caption" color="text">
                          Image du groupe (PNG, JPG — max 5 Mo)
                        </MDTypography>
                      </>
                    )}
                  </>
                )}
                {uploading && (
                  <MDBox
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255,255,255,0.6)"
                  >
                    <CircularProgress size={30} color="success" />
                  </MDBox>
                )}
              </MDBox>
              <input
                type="file"
                id="group-image-upload"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDInput
                    label="Nom du groupe"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Ex: Omra Premium - Groupe A"
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    label="Capacité (Pèlerins)"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon color="dark" sx={{ mr: 1 }}>
                  event
                </Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  Logistique & Planning
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Date de départ prévue"
                name="departureDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.departureDate}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="pack-label">Associer un Pack Umrah</InputLabel>
                <Select
                  labelId="pack-label"
                  label="Associer un Pack Umrah"
                  name="packId"
                  value={formData.packId}
                  onChange={handleInputChange}
                  sx={{ height: 45 }}
                >
                  <MenuItem value="">Aucun pack sélectionné</MenuItem>
                  {packs.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon color="dark" sx={{ mr: 1 }}>
                  person
                </Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  Accompagnement
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="guide-label">Choisir le Guide Accompagnateur</InputLabel>
                <Select
                  labelId="guide-label"
                  label="Choisir le Guide Accompagnateur"
                  name="guideId"
                  value={formData.guideId}
                  onChange={handleInputChange}
                  sx={{ height: 45 }}
                >
                  <MenuItem value="">Aucun guide assigné</MenuItem>
                  {guides.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.firstName} {g.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Notes internes / Instructions"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                placeholder="Informations complémentaires pour l'agence..."
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={2}>
              <Icon color="dark" sx={{ mr: 1 }}>
                person_add
              </Icon>
              <MDTypography variant="h6" fontWeight="bold">
                Sélection des Pèlerins
              </MDTypography>
            </MDBox>
            <MDTypography variant="button" color="text" mb={3} display="block">
              Affectez les pèlerins inscrits à ce groupe de départ. Vous pouvez également le faire
              ultérieurement depuis la liste des groupes.
            </MDTypography>

            <MDBox
              p={2}
              borderRadius="lg"
              sx={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #eee",
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MDTypography variant="button" fontWeight="medium">
                Pèlerins sélectionnés : {selectedPilgrims.length}
              </MDTypography>
              <MDTypography
                variant="button"
                color={selectedPilgrims.length >= formData.capacity ? "error" : "success"}
                fontWeight="bold"
              >
                Capacité : {formData.capacity}
              </MDTypography>
            </MDBox>

            {availablePilgrims.length === 0 ? (
              <MDBox
                textAlign="center"
                py={6}
                sx={{ border: "2px dashed #ddd", borderRadius: "lg" }}
              >
                <Icon fontSize="large" color="disabled" sx={{ mb: 1 }}>
                  person_off
                </Icon>
                <MDTypography variant="h6" color="text">
                  Aucun pèlerin disponible
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Tous les pèlerins actifs sont déjà affectés à des groupes.
                </MDTypography>
              </MDBox>
            ) : (
              <List
                sx={{
                  maxHeight: 450,
                  overflow: "auto",
                  bgcolor: "white",
                  borderRadius: "lg",
                  border: "1px solid #eee",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                {availablePilgrims.map((p) => (
                  <ListItem
                    key={p.id}
                    button
                    onClick={() => handleTogglePilgrim(p.id)}
                    sx={{
                      borderBottom: "1px solid #f5f5f5",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={p.photo}
                        sx={{
                          bgcolor: "#1b5e20",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {p.lastName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <MDTypography variant="button" fontWeight="bold">
                          {p.firstName} {p.lastName}
                        </MDTypography>
                      }
                      secondary={
                        <MDTypography variant="caption" color="text">
                          {p.email}
                        </MDTypography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        onChange={() => handleTogglePilgrim(p.id)}
                        checked={selectedPilgrims.indexOf(p.id) !== -1}
                        color="success"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </MDBox>
        );
      default:
        return null;
    }
  };

  return (
    <MDBox pt={3} pb={3}>
      <Card sx={{ overflow: "visible", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <MDBox p={3}>
          <MDBox mb={2}>
            <MDTypography variant="h4" fontWeight="bold">
              {initialData ? "Modifier le Groupe" : "Nouveau Groupe de Pèlerinage"}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular">
              Suivez les étapes pour configurer votre départ et affecter vos pèlerins.
            </MDTypography>
          </MDBox>

          <MDBox
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
            py={1.5}
            px={2}
            mb={4}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<SabeelConnector />}
              sx={{ background: "transparent" }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="36px"
                        height="36px"
                        borderRadius="50%"
                        color={
                          activeStep === index
                            ? "success.main"
                            : activeStep > index
                            ? "white"
                            : "grey.500"
                        }
                        sx={{
                          border: activeStep === index ? "none" : "2px solid rgba(255,255,255,0.4)",
                          boxShadow: activeStep === index ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          zIndex: 2,
                          position: "relative",
                          backgroundColor:
                            activeStep === index
                              ? "#ffffff"
                              : activeStep > index
                              ? "#1a1a1a"
                              : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {index + 1}
                      </MDBox>
                    )}
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontWeight: activeStep === index ? "bold" : "regular",
                        color: "white !important",
                        mt: 1,
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </MDBox>

          <MDBox mt={4} minHeight="300px">
            {renderStepContent(activeStep)}
          </MDBox>

          <MDBox display="flex" justifyContent="space-between" mt={5}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={activeStep === 0 ? onCancel : handleBack}
              sx={{
                color: activeStep === 0 ? "inherit" : "white !important",
                backgroundColor: activeStep === 0 ? "transparent" : "#1a1a1a",
                borderRadius: "8px",
              }}
            >
              {activeStep === 0 ? "Annuler" : "Retour"}
            </MDButton>
            <MDButton
              variant="gradient"
              color="dark"
              onClick={handleNext}
              sx={{ borderRadius: "8px", px: 4, color: "white !important" }}
            >
              {activeStep === steps.length - 1
                ? initialData
                  ? "Mettre à jour"
                  : "Terminer"
                : "Suivant"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    </MDBox>
  );
}

GroupForm.propTypes = {
  initialData: PropTypes.object,
  initialStep: PropTypes.number,
  packs: PropTypes.array.isRequired,
  guides: PropTypes.array.isRequired,
  availablePilgrims: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default GroupForm;
