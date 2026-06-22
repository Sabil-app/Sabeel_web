import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import PasswordInput from "components/PasswordInput";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";

// Shared Components
import LandingHeader from "layouts/landing/components/Header";
import LandingFooter from "layouts/landing/components/Footer";

import { signInAdminAgence } from "auth/adminAgenceAuth";

function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Veuillez saisir votre email et mot de passe");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await signInAdminAgence({ email, password });

      if (data.mfaRequired) {
        navigate("/authentication/verify-2fa", { state: { userId: data.userId } });
        return;
      }

      // Redirect based on role
      const role = data.user?.activeRole;
      if (role === "admin" || role === "sub-admin") {
        navigate("/dashboard");
      } else if (role === "agence") {
        navigate("/agency/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  const greenStyles = {
    gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
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
                    Connexion Agence
                  </MDTypography>
                  <MDTypography
                    display="block"
                    variant="button"
                    color="white"
                    my={1}
                    sx={{ opacity: 0.8 }}
                  >
                    Bon retour sur votre espace Sabeel.
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={4} px={3}>
                  <MDBox component="form" role="form">
                    {error && (
                      <MDBox mb={2}>
                        <Alert severity="error">{error}</Alert>
                      </MDBox>
                    )}
                    <MDBox mb={2}>
                      <MDInput
                        type="email"
                        label="Email Professionnel"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <PasswordInput
                        label="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </MDBox>
                    <MDBox
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      ml={-1}
                    >
                      <MDBox display="flex" alignItems="center">
                        <Switch
                          checked={rememberMe}
                          onChange={handleSetRememberMe}
                          sx={{ "&.Mui-checked": { color: "#1b5e20" } }}
                          disabled={loading}
                        />
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          onClick={handleSetRememberMe}
                          sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                        >
                          &nbsp;&nbsp;Se souvenir de moi
                        </MDTypography>
                      </MDBox>
                      <MDTypography
                        component={Link}
                        to="/authentication/forgot-password"
                        variant="button"
                        fontWeight="regular"
                        color="success"
                        sx={{ color: "#1b5e20 !important" }}
                      >
                        Mot de passe oublié ?
                      </MDTypography>
                    </MDBox>
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
                        onClick={handleSignIn}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Se connecter"}
                      </MDButton>
                    </MDBox>
                    <MDBox mt={3} mb={1} textAlign="center">
                      <MDTypography variant="button" color="text">
                        Nouveau sur Sabeel ?{" "}
                        <MDTypography
                          component={Link}
                          to="/authentication/sign-up"
                          variant="button"
                          fontWeight="bold"
                          sx={{ color: "#2e7d32 !important" }}
                        >
                          S&apos;inscrire
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

export default SignIn;
