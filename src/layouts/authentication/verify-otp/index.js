import { useState, useRef } from "react";
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

import { verifyOtpAdminAgence } from "auth/adminAgenceAuth";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Veuillez saisir le code complet de 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtpAdminAgence(email, otpString);
      navigate("/authentication/reset-password", { state: { email, otp: otpString } });
    } catch (err) {
      setError(err.message || "Code OTP invalide ou expiré.");
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
            <Grid item xs={11} sm={9} md={6} lg={5} xl={4}>
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
                    Vérification
                  </MDTypography>
                  <MDTypography
                    display="block"
                    variant="button"
                    color="white"
                    my={1}
                    sx={{ opacity: 0.8 }}
                  >
                    Saisissez le code de 6 chiffres envoyé à {email}
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={4} px={3}>
                  <MDBox component="form" role="form">
                    {error && (
                      <MDBox mb={3}>
                        <Alert severity="error">{error}</Alert>
                      </MDBox>
                    )}
                    <MDBox display="flex" justifyContent="space-between" mb={4}>
                      {otp.map((digit, index) => (
                        <MDInput
                          key={index}
                          inputRef={(el) => (inputRefs.current[index] = el)}
                          value={digit}
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          sx={{
                            width: "45px",
                            "& input": {
                              textAlign: "center",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                              padding: "10px 0",
                            },
                          }}
                          variant="outlined"
                          inputProps={{ maxLength: 1 }}
                          disabled={loading}
                        />
                      ))}
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
                        onClick={handleVerify}
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Vérifier le code"
                        )}
                      </MDButton>
                    </MDBox>
                    <MDBox mt={3} textAlign="center">
                      <MDTypography variant="button" color="text">
                        Vous n&apos;avez pas reçu le code ?{" "}
                        <MDTypography
                          component={Link}
                          to="/authentication/forgot-password"
                          variant="button"
                          fontWeight="bold"
                          sx={{ color: "#2e7d32 !important" }}
                        >
                          Renvoyer
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

export default VerifyOtp;
