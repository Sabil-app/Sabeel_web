import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Icon from "@mui/material/Icon";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { useTranslation } from "i18n/LanguageContext";

const headerStyles = `
  .premium-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer;
  }
  .premium-hover:hover {
    color: #4caf50 !important;
    transform: translateX(5px) scale(1.02);
  }
  .top-info-bar {
    background: linear-gradient(90deg, #0f2411 0%, #163a1a 100%);
    color: rgba(255,255,255,0.9);
    font-size: 0.72rem;
    letter-spacing: 0.3px;
  }
  .top-info-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .top-info-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    display: inline-block;
  }
`;

const LANGUAGES = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "de", label: "German" },
];

function LandingHeader({ light = false, showTopAccent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState(null);
  const [now, setNow] = useState(new Date());
  const [temperature, setTemperature] = useState(null);
  const location = useLocation();
  const { lang, setLang, t } = useTranslation();

  const isSignIn = location.pathname.includes("sign-in");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=21.4225&longitude=39.8262&current_weather=true"
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.current_weather?.temperature != null) {
          setTemperature(Math.round(data.current_weather.temperature));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const makkahDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(now)
    .replace(/ /g, "-");

  const makkahTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  const handleLangOpen = (event) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);
  const handleLangSelect = (code) => {
    setLang(code);
    setLangAnchor(null);
  };
  const currentLang = (lang || "fr").toUpperCase();

  const greenGradient = "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
    setMobileOpen(false);
  };

  const textColor = light || scrolled ? "dark" : "white";
  const languageIconColor = "white";

  const menuItems = [
    { key: "Concept", label: t("nav.concept") },
    { key: "Ecosystem", label: t("nav.ecosystem") },
    { key: "Parcours", label: t("nav.parcours") },
    { key: "GuideApp", label: t("nav.guideMobile") },
    { key: "Contact", label: t("nav.contact") },
  ];

  const drawer = (
    <MDBox sx={{ width: 250, pt: 3 }} role="presentation">
      <MDBox px={3} mb={4} display="flex" alignItems="center">
        <Box
          component="img"
          src="/images/logo.png"
          alt="Sabeel"
          sx={{
            height: 45,
            width: "auto",
            objectFit: "contain",
          }}
        />
      </MDBox>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.key}
            onClick={() => {
              if (item.key === "Parcours") {
                window.location.href = "/how-it-works";
              } else {
                scrollToSection(item.key.toLowerCase());
              }
            }}
            sx={{ px: 3, py: 1.5 }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: "button",
                fontWeight: "medium",
                color: "text",
              }}
            />
          </ListItem>
        ))}
        <ListItem sx={{ mt: 2, px: 3 }}>
          <Link
            to={isSignIn ? "/authentication/sign-up" : "/authentication/sign-in"}
            style={{ textDecoration: "none", width: "100%" }}
            onClick={() => setMobileOpen(false)}
          >
            <MDButton
              variant="gradient"
              color="success"
              fullWidth
              sx={{
                borderRadius: "10px",
                background: greenGradient,
              }}
            >
              {isSignIn ? t("auth.signUp") : t("auth.signIn")}
            </MDButton>
          </Link>
        </ListItem>

        <ListItem sx={{ mt: 1, px: 3 }}>
          <Box
            onClick={handleLangOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: "10px",
              border: "1px solid rgba(27,94,32,0.2)",
              width: "100%",
              cursor: "pointer",
            }}
          >
            <Icon sx={{ fontSize: "18px !important", color: "#1b5e20" }}>translate</Icon>
            <MDTypography variant="button" fontWeight="medium" sx={{ flex: 1 }}>
              {currentLang}
            </MDTypography>
            <Icon sx={{ fontSize: "18px !important", color: "#1b5e20" }}>expand_more</Icon>
          </Box>
        </ListItem>

        <Box sx={{ mt: 3, px: 3, py: 2, bgcolor: "#f7faf7", borderRadius: 2, mx: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.8}>
            <Icon sx={{ fontSize: "16px !important", color: "#ffa000" }}>wb_sunny</Icon>
            <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {temperature != null ? `${temperature}°C` : "—"} — {t("topbar.makkah")}
            </MDTypography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.8}>
            <Icon sx={{ fontSize: "16px !important", color: "#1b5e20" }}>event</Icon>
            <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {makkahDate}
            </MDTypography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon sx={{ fontSize: "16px !important", color: "#1b5e20" }}>schedule</Icon>
            <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {makkahTime}
            </MDTypography>
          </Box>
        </Box>
      </List>
    </MDBox>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        backgroundColor: scrolled || light ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: scrolled || light ? "blur(10px)" : "none",
        boxShadow: scrolled || light ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        transition: "0.5s ease",
        pt: scrolled ? 0.2 : 0.6,
        pb: scrolled ? 0.2 : 0.6,
      }}
    >
      <style>{headerStyles}</style>
      {showTopAccent ? (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: greenGradient,
            zIndex: 0,
          }}
        />
      ) : null}

      <Box
        className="top-info-bar"
        sx={{
          display: { xs: "none", md: scrolled ? "none" : "block" },
          transition: "all 0.4s ease",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 0.35,
              fontSize: "0.72rem",
            }}
          >
            <Box className="top-info-item">
              <Icon sx={{ fontSize: "14px !important", color: "#ffd54f" }}>wb_sunny</Icon>
              <span>{temperature != null ? `${temperature}°C` : "—"}</span>
            </Box>
            <span className="top-info-sep" />
            <Box className="top-info-item">
              <Icon sx={{ fontSize: "14px !important", color: "#7dd87f" }}>event</Icon>
              <span>{makkahDate}</span>
            </Box>
            <span className="top-info-sep" />
            <Box className="top-info-item">
              <Icon sx={{ fontSize: "14px !important", color: "#7dd87f" }}>schedule</Icon>
              <span>{makkahTime}</span>
            </Box>
            <span className="top-info-sep" />
            <Box className="top-info-item">
              <Icon sx={{ fontSize: "14px !important", color: "#7dd87f" }}>place</Icon>
              <span>{t("topbar.makkah")}</span>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "56px !important",
            py: 0,
            gap: 3,
          }}
        >
          <MDBox display="flex" alignItems="center" gap={{ xs: 2, lg: 3 }}>
            <MDBox
              component={Link}
              to="/"
              display="flex"
              alignItems="center"
              onClick={() => {
                if (window.location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              sx={{ cursor: "pointer" }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="Sabeel"
                sx={{
                  height: { xs: 40, lg: 50 },
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </MDBox>

            <MDBox
              display={{ xs: "none", lg: "flex" }}
              gap={2.5}
              alignItems="center"
              sx={{ pt: 2.5 }}
            >
              {menuItems.map((item) => (
                <MDTypography
                  key={item.key}
                  variant="button"
                  fontWeight="medium"
                  color={textColor}
                  className="premium-hover"
                  sx={{ cursor: "pointer", fontSize: "0.8rem" }}
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
          </MDBox>

          <MDBox
            display={{ xs: "none", lg: "flex" }}
            alignItems="center"
            gap={1.5}
            sx={{ pt: 2.5 }}
          >
            <Box
              onClick={handleLangOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                px: 1.2,
                py: 0.6,
                borderRadius: "10px",
                cursor: "pointer",
                border: `1px solid ${
                  textColor === "white" ? "rgba(255,255,255,0.25)" : "rgba(27,94,32,0.2)"
                }`,
                transition: "all 0.25s ease",
                "&:hover": {
                  borderColor: "#4caf50",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Icon
                sx={{
                  fontSize: "16px !important",
                  color: `${textColor === "dark" ? "#1b5e20" : "#ffffff"} !important`,
                }}
              >
                translate
              </Icon>
              <MDTypography
                variant="button"
                fontWeight="medium"
                color={textColor}
                sx={{ fontSize: "0.75rem", lineHeight: 1 }}
              >
                {currentLang}
              </MDTypography>
              <Icon
                sx={{
                  fontSize: "16px !important",
                  color: `${textColor === "dark" ? "#1b5e20" : "#ffffff"} !important`,
                }}
              >
                expand_more
              </Icon>
            </Box>

            <Link to="/authentication/sign-in" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: `1px solid ${
                    textColor === "white" ? "rgba(255,255,255,0.25)" : "rgba(27,94,32,0.2)"
                  }`,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: "#4caf50",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  color={textColor}
                  sx={{ fontSize: "0.8rem", lineHeight: 1 }}
                >
                  {t("auth.signIn")}
                </MDTypography>
              </Box>
            </Link>

            <Link to="/authentication/sign-up" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.8,
                  py: 0.85,
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                  boxShadow: "0 8px 18px rgba(27,94,32,0.25)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 22px rgba(27,94,32,0.35)",
                  },
                }}
              >
                <MDTypography
                  variant="button"
                  fontWeight="bold"
                  sx={{ fontSize: "0.8rem", lineHeight: 1, color: "#ffffff !important" }}
                >
                  {t("auth.signUp")}
                </MDTypography>
              </Box>
            </Link>

            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={handleLangClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 160,
                  borderRadius: 2,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              {LANGUAGES.map((l) => (
                <MenuItem
                  key={l.code}
                  onClick={() => handleLangSelect(l.code)}
                  selected={lang === l.code}
                  sx={{ fontSize: "0.85rem", py: 1 }}
                >
                  {l.label}
                </MenuItem>
              ))}
            </Menu>
          </MDBox>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { lg: "none" },
              color: textColor === "white" ? "white" : "inherit",
              padding: "4px",
            }}
          >
            <Icon fontSize="medium">menu</Icon>
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

LandingHeader.propTypes = {
  light: PropTypes.bool,
  showTopAccent: PropTypes.bool,
};

export default LandingHeader;
