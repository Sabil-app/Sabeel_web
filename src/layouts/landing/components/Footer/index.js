import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useTranslation } from "i18n/LanguageContext";

const footerStyles = `
  .premium-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer;
  }
  .premium-hover:hover {
    color: #4caf50 !important;
    transform: translateX(5px) scale(1.02);
  }
  .social-hover:hover {
    color: #4caf50 !important;
    transform: scale(1.2) rotate(5deg);
    transition: all 0.3s ease;
  }
`;

function LandingFooter() {
  const { t } = useTranslation();
  const greenStyles = {
    dark: "#1a2e1a",
  };

  const footerNav = [
    { key: "Concept", label: t("nav.concept") },
    { key: "Ecosystem", label: t("nav.ecosystem") },
    { key: "Parcours", label: t("nav.parcours") },
    { key: "GuideApp", label: t("nav.guideMobile") },
    { key: "Contact", label: t("nav.contact") },
  ];

  const contactData = {
    phone: "+216 50 473 202",
    address: "10 Av. Abderrahmen Azzam, Montplaisir, Tunis 1073",
    email: "contact@sabeel.tn",
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <MDBox component="footer" py={10} sx={{ backgroundColor: greenStyles.dark, color: "white" }}>
      <style>{footerStyles}</style>
      <Container>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <MDTypography variant="h5" color="white" fontWeight="bold" mb={3}>
              SABEEL AGENCE
            </MDTypography>
            <MDTypography variant="body2" color="white" mb={4} sx={{ opacity: 0.7 }}>
              {t("footer.tagline")}
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={2}>
            <MDTypography variant="h6" color="white" fontWeight="bold" mb={3}>
              {t("footer.navTitle")}
            </MDTypography>
            <MDBox display="flex" flexDirection="column" gap={2}>
              {footerNav.map((item) => (
                <MDTypography
                  key={item.key}
                  variant="body2"
                  color="white"
                  className="premium-hover"
                  sx={{ opacity: 0.7, cursor: "pointer", display: "inline-block" }}
                  onClick={() => {
                    if (item.key === "Parcours") {
                      window.location.href = "/how-it-works";
                    } else {
                      scrollToSection(item.key.toLowerCase());
                    }
                  }}
                >
                  {item.label}
                </MDTypography>
              ))}
            </MDBox>
          </Grid>
          <Grid item xs={12} md={3}>
            <MDTypography variant="h6" color="white" fontWeight="bold" mb={3}>
              {t("footer.contactInfo")}
            </MDTypography>
            <MDBox display="flex" flexDirection="column" gap={2}>
              <MDBox
                className="premium-hover"
                sx={{ opacity: 0.7, gap: 1.5, display: "flex", alignItems: "center" }}
              >
                <Icon sx={{ fontSize: "1.1rem !important", color: "white !important" }}>email</Icon>
                <MDTypography variant="body2" color="white">
                  {contactData.email}
                </MDTypography>
              </MDBox>
              <MDBox
                className="premium-hover"
                sx={{ opacity: 0.7, gap: 1.5, display: "flex", alignItems: "center" }}
              >
                <Icon sx={{ fontSize: "1.1rem !important", color: "white !important" }}>phone</Icon>
                <MDTypography variant="body2" color="white">
                  {contactData.phone}
                </MDTypography>
              </MDBox>
              <MDBox
                className="premium-hover"
                sx={{ opacity: 0.7, gap: 1.5, display: "flex", alignItems: "center" }}
              >
                <Icon sx={{ fontSize: "1.1rem !important", color: "white !important" }}>
                  location_on
                </Icon>
                <MDTypography variant="body2" color="white">
                  {contactData.address}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={3}>
            <MDTypography variant="h6" color="white" fontWeight="bold" mb={3}>
              Suivez-nous
            </MDTypography>
            <MDBox display="flex" gap={3}>
              <a href="#" style={{ color: "white" }} className="social-hover">
                <i className="fab fa-facebook fa-xl"></i>
              </a>
              <a href="#" style={{ color: "white" }} className="social-hover">
                <i className="fab fa-instagram fa-xl"></i>
              </a>
              <a href="#" style={{ color: "white" }} className="social-hover">
                <i className="fab fa-tiktok fa-xl"></i>
              </a>
              <a href="#" style={{ color: "white" }} className="social-hover">
                <i className="fab fa-linkedin fa-xl"></i>
              </a>
            </MDBox>
          </Grid>
        </Grid>
        <Divider sx={{ my: 6, backgroundColor: "rgba(255,255,255,0.1)" }} />
        <MDBox textAlign="center">
          <MDTypography variant="caption" color="white" sx={{ opacity: 0.4 }}>
            &copy; {new Date().getFullYear()} Sabeel Agence. Excellence Spirituelle & Technologique.
          </MDTypography>
        </MDBox>
      </Container>
    </MDBox>
  );
}

export default LandingFooter;
