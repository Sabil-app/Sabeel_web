import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout components
import PageLayout from "examples/LayoutContainers/PageLayout";

import { verify2FALogin, getHomeRouteForRole } from "auth/adminAgenceAuth";

function TwoFactor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!userId) {
    // If accessed directly without userId, redirect to sign-in
    setTimeout(() => navigate("/authentication/sign-in"), 0);
    return null;
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Le code doit comporter 6 chiffres.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const data = await verify2FALogin(userId, code);
      const homeRoute = getHomeRouteForRole(data.user?.activeRole);
      navigate(homeRoute);
    } catch (err) {
      setError(err.message || "Code invalide. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const greenGradient = "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)";

  return (
    <PageLayout>
      <MDBox
        width="100vw"
        height="100vh"
        display="flex"
        alignItems="center"
        sx={{ backgroundColor: "#f8f9fa" }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={9} md={5} lg={4}>
              <Card sx={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)", borderRadius: "1.5rem" }}>
                <MDBox
                  variant="gradient"
                  sx={{ background: greenGradient }}
                  borderRadius="lg"
                  coloredShadow="success"
                  mx={2}
                  mt={-3}
                  p={3}
                  mb={1}
                  textAlign="center"
                >
                  <MDTypography variant="h4" fontWeight="bold" color="white" mt={1}>
                    Vérification 2FA
                  </MDTypography>
                  <MDTypography
                    display="block"
                    variant="button"
                    color="white"
                    my={1}
                    sx={{ opacity: 0.8 }}
                  >
                    Entrez le code à 6 chiffres de votre application
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                  <MDBox component="form" role="form">
                    <MDBox mb={3}>
                      <MDInput
                        type="text"
                        label="Code de sécurité"
                        fullWidth
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                        inputProps={{
                          maxLength: 6,
                          style: {
                            textAlign: "center",
                            letterSpacing: "8px",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                          },
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                      />
                    </MDBox>
                    {error && (
                      <MDBox mb={2}>
                        <MDTypography variant="caption" color="error" fontWeight="bold">
                          {error}
                        </MDTypography>
                      </MDBox>
                    )}
                    <MDBox mt={4} mb={1}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={handleVerify}
                        disabled={isSubmitting || code.length !== 6}
                        sx={{ background: greenGradient, borderRadius: "10px", py: 1.5 }}
                      >
                        {isSubmitting ? "Vérification en cours..." : "Confirmer"}
                      </MDButton>
                    </MDBox>
                    <MDBox mt={3} textAlign="center">
                      <MDTypography
                        variant="button"
                        color="text"
                        sx={{ cursor: "pointer", "&:hover": { color: "#1b5e20" } }}
                        onClick={() => navigate("/authentication/sign-in")}
                      >
                        Retour à la connexion
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </MDBox>
    </PageLayout>
  );
}

export default TwoFactor;
