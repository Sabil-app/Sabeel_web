import { useState } from "react";
import PropTypes from "prop-types";
import { apiUpload } from "api/apiClient";
import { resolveMediaUrl } from "utils/resolveMediaUrl";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";

function AddGuideForm({ onCancel, onSave, initialData }) {
  const [guideData, setGuideData] = useState(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      cinPassport: "",
      languages: [],
      experience: "",
      photo: "",
      status: "active",
    }
  );

  const [showSuccess, setShowSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(
    initialData?.photo ? resolveMediaUrl(initialData.photo) : ""
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuideData({ ...guideData, [name]: value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiUpload("/admin-agence/guides/upload-photo", formData);

      const photoUrl = response?.photoUrl || response?.presignedUrl || "";
      setGuideData((prev) => ({ ...prev, photo: photoUrl }));
      setPhotoPreviewUrl(response?.presignedUrl || photoUrl);
    } catch (error) {
      console.error("Guide photo upload failed", error);
      alert("Échec de l'upload de la photo du guide.");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      onSave(guideData);
    }, 1500);
  };

  return (
    <MDBox pt={2} pb={3}>
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h5" fontWeight="medium" mb={4}>
            {initialData ? "Modifier le Guide" : "Enregistrer un Nouveau Guide"}
          </MDTypography>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Nom"
                  name="lastName"
                  value={guideData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Prénom"
                  name="firstName"
                  value={guideData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Email professionnel"
                  name="email"
                  type="email"
                  value={guideData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              {!initialData && (
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={guideData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Numéro CIN / Passeport"
                  name="cinPassport"
                  value={guideData.cinPassport}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Téléphone"
                  name="phone"
                  value={guideData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={[
                    "Arabe",
                    "Français",
                    "Anglais",
                    "Turc",
                    "Italien",
                    "Allemand",
                    "Espagnol",
                  ]}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label="Langues parlées"
                      fullWidth
                      required={guideData.languages.length === 0}
                    />
                  )}
                  value={Array.isArray(guideData.languages) ? guideData.languages : []}
                  onChange={(event, newValue) => {
                    setGuideData({ ...guideData, languages: newValue });
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Années d'expérience"
                  name="experience"
                  type="number"
                  value={guideData.experience}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  color="text"
                  display="block"
                  mb={1}
                >
                  Photo du Guide (Optionnel)
                </MDTypography>
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  p={3}
                  borderRadius="lg"
                  onClick={() =>
                    !photoUploading && document.getElementById("guide-photo-upload").click()
                  }
                  sx={{
                    border: "2px dashed #ddd",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    opacity: photoUploading ? 0.6 : 1,
                    pointerEvents: photoUploading ? "none" : "auto",
                    "&:hover": { borderColor: "dark.main" },
                  }}
                >
                  {photoPreviewUrl || guideData.photo ? (
                    <MDBox
                      component="img"
                      src={photoPreviewUrl || resolveMediaUrl(guideData.photo)}
                      alt="Guide"
                      width="120px"
                      height="120px"
                      borderRadius="50%"
                      sx={{ objectFit: "cover", border: "2px solid #fff" }}
                    />
                  ) : (
                    <>
                      <Icon fontSize="large" color="success">
                        add_a_photo
                      </Icon>
                      <MDTypography variant="button" color="text" fontWeight="regular">
                        {photoUploading
                          ? "Upload en cours..."
                          : "Cliquez pour télécharger une photo"}
                      </MDTypography>
                    </>
                  )}
                  <input
                    type="file"
                    id="guide-photo-upload"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </MDBox>
              </Grid>
            </Grid>
            <MDBox mt={5} display="flex" justifyContent="space-between">
              <MDButton variant="outlined" color="dark" onClick={onCancel}>
                Annuler
              </MDButton>
              <MDButton variant="gradient" color="dark" type="submit">
                {initialData ? "Sauvegarder les modifications" : "Enregistrer le Guide"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {initialData ? "Guide modifié avec succès !" : "Guide enregistré avec succès !"}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

AddGuideForm.defaultProps = {
  initialData: null,
};

AddGuideForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

export default AddGuideForm;
