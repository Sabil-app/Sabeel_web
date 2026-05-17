import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";
import LandingHeader from "layouts/landing/components/Header";
import LandingFooter from "layouts/landing/components/Footer";

import { resetPasswordAdminAgence } from "auth/adminAgenceAuth";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPasswordAdminAgence(email, otp, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2500);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const greenStyles = {
    gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
  };

  return (
    <PageLayout>
      <LandingHeader light showTopAccent />

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
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={9} md={6} lg={4} xl={4}>
              <Card
                sx={{
                  boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                  borderRadius: "1.5rem",
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
                    Nouveau mot de passe
                  </MDTypography>
                  <MDTypography
                    display="block"
                    variant="button"
                    color="white"
                    my={1}
                    sx={{ opacity: 0.8 }}
                  >
                    Choisissez un nouveau mot de passe sécurisé.
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={4} px={3}>
                  <MDBox component="form" role="form">
                    {error && (
                      <MDBox mb={2}>
                        <Alert severity="error">{error}</Alert>
                      </MDBox>
                    )}
                    {success && (
                      <MDBox mb={2}>
                        <Alert severity="success">
                          Mot de passe réinitialisé ! Redirection vers la connexion...
                        </Alert>
                      </MDBox>
                    )}
                    <MDBox mb={2}>
                      <MDInput
                        type="password"
                        label="Nouveau mot de passe"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || success}
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="password"
                        label="Confirmer le mot de passe"
                        variant="outlined"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || success}
                      />
                    </MDBox>
                    <MDBox mt={4} mb={1}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        sx={{
                          background: greenStyles.gradient,
                          borderRadius: "10px",
                          py: 1.5,
                        }}
                        onClick={handleReset}
                        disabled={loading || success}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Réinitialiser"}
                      </MDButton>
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

export default ResetPassword;
