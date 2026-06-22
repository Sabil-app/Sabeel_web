import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import PasswordInput from "components/PasswordInput";
import MDButton from "components/MDButton";
import { getHomeRouteForRole, signUpAgence } from "auth/adminAgenceAuth";

import PageLayout from "examples/LayoutContainers/PageLayout";

// Shared Components
import LandingHeader from "layouts/landing/components/Header";
import LandingFooter from "layouts/landing/components/Footer";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    agencyName: "",
    email: "",
    password: "",
    phoneNumber: "",
    agencyLicense: "",
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const greenStyles = {
    gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      const response = await signUpAgence(formData);
      navigate(getHomeRouteForRole(response.user.activeRole));
    } catch (submitError) {
      setError(submitError.message || "Inscription impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <LandingHeader light showTopAccent />

      {/* Main Content Area - White Background */}
      <MDBox
        minHeight="90vh"
        width="100%"
        sx={{
          backgroundColor: "#f8f9fa",
          display: "flex",
          pt: { xs: 8, lg: 12 },
          pb: 10,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={9} md={6} lg={4} xl={4} sx={{ mt: { xs: 16, lg: 14 } }}>
              <Card
                sx={{
                  boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                  borderRadius: "1.5rem",
                  border: "1px solid rgba(0,0,0,0.05)",
                  overflow: "visible",
                  backgroundColor: "white",
                }}
              >
                <MDBox
                  variant="gradient"
                  sx={{ background: greenStyles.gradient }}
                  borderRadius="lg"
                  coloredShadow="success"
                  mx={2}
                  mt={-3}
                  p={3.5}
                  mb={1.5}
                  textAlign="center"
                >
                  <MDTypography variant="h4" fontWeight="bold" color="white" mt={1}>
                    Inscription Agence
                  </MDTypography>
                  <MDTypography
                    display="block"
                    variant="button"
                    color="white"
                    my={1}
                    sx={{ opacity: 0.8 }}
                  >
                    Digitalisez votre activité de Umrah.
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={4} px={3}>
                  <MDBox component="form" role="form">
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Nom du Responsable"
                        variant="outlined"
                        fullWidth
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Nom de l'Agence"
                        variant="outlined"
                        fullWidth
                        value={formData.agencyName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agencyName: e.target.value }))
                        }
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="email"
                        label="Email Professionnel"
                        variant="outlined"
                        fullWidth
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <PasswordInput
                        label="Mot de passe"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        disabled={isSubmitting}
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Téléphone"
                        variant="outlined"
                        fullWidth
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                        }
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Licence agence"
                        variant="outlined"
                        fullWidth
                        value={formData.agencyLicense}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agencyLicense: e.target.value }))
                        }
                      />
                    </MDBox>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        checked={formData.acceptedTerms}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, acceptedTerms: e.target.checked }))
                        }
                        sx={{ "&.Mui-checked": { color: "#1b5e20" } }}
                      />
                      <MDTypography
                        variant="button"
                        fontWeight="regular"
                        color="text"
                        sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                      >
                        &nbsp;&nbsp;J&apos;accepte les&nbsp;
                      </MDTypography>
                      <MDTypography
                        component="a"
                        variant="button"
                        fontWeight="bold"
                        sx={{ color: "#2e7d32 !important", cursor: "pointer" }}
                      >
                        Conditions
                      </MDTypography>
                    </MDBox>
                    {error && (
                      <MDBox mt={1}>
                        <MDTypography variant="caption" color="error">
                          {error}
                        </MDTypography>
                      </MDBox>
                    )}
                    <MDBox mt={4} mb={1}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        sx={{
                          background: greenStyles.gradient,
                          borderRadius: "10px",
                          py: 1,
                          fontSize: "0.9rem",
                        }}
                        disabled={
                          !formData.fullName ||
                          !formData.agencyName ||
                          !formData.email ||
                          !formData.password ||
                          !formData.acceptedTerms ||
                          isSubmitting
                        }
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? "Création..." : "Créer mon Compte"}
                      </MDButton>
                    </MDBox>
                    <MDBox mt={3} mb={1} textAlign="center">
                      <MDTypography variant="button" color="text">
                        Déjà inscrit ?{" "}
                        <MDTypography
                          component={Link}
                          to="/authentication/sign-in"
                          variant="button"
                          fontWeight="bold"
                          sx={{ color: "#2e7d32 !important" }}
                        >
                          Se connecter
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      <LandingFooter />
    </PageLayout>
  );
}

export default SignUp;
