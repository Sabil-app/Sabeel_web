import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";

// Shared Components
import LandingHeader from "layouts/landing/components/Header";
import LandingFooter from "layouts/landing/components/Footer";
import SabeelChatBot from "layouts/landing/components/ChatBot";
import { useTranslation } from "i18n/LanguageContext";
import { sendComplaint } from "auth/adminAgenceAuth";

// Local Section Styles
const styles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.hero-title {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: "Outfit", sans-serif !important;
}

.button-glow {
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease !important;
}

.button-glow:hover {
  box-shadow: 0 0 35px rgba(76, 175, 80, 0.6) !important;
  transform: translateY(-2px);
}

.button-secondary-anim {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.button-secondary-anim:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
  border: 1px solid #1b5e20 !important;
}

.green-blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(27, 94, 32, 0.55), rgba(46, 125, 50, 0.75));
  backdrop-filter: blur(5px);
  z-index: 1;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top center, rgba(76, 175, 80, 0.16), transparent 35%),
    linear-gradient(135deg, rgba(7, 18, 9, 0.7), rgba(22, 55, 28, 0.72));
  z-index: 1;
}

.section-padding {
  padding: 70px 0;
}

.hover-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.hover-card:hover {
  transform: translateY(-12px) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}

.store-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes phoneFloatLeft {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-18px) rotate(-6deg); }
}

@keyframes phoneFloatRight {
  0%, 100% { transform: translateY(-10px) rotate(6deg); }
  50% { transform: translateY(8px) rotate(6deg); }
}

@keyframes phoneGlow {
  0%, 100% { box-shadow: 0 30px 80px rgba(76, 175, 80, 0.25), 0 0 0 1px rgba(255,255,255,0.08); }
  50% { box-shadow: 0 40px 100px rgba(76, 175, 80, 0.45), 0 0 0 1px rgba(255,255,255,0.12); }
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.35); opacity: 0.4; }
}

.phone-dual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100%;
  min-height: 560px;
  perspective: 1400px;
}

.phone-mockup {
  position: relative;
  width: 240px;
  height: 500px;
  border-radius: 42px;
  background: linear-gradient(160deg, #0d1f10 0%, #1a3d20 100%);
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  animation: phoneGlow 6s ease-in-out infinite;
  flex-shrink: 0;
}

.phone-mockup--left {
  animation:
    phoneFloatLeft 6s ease-in-out infinite,
    phoneGlow 6s ease-in-out infinite;
  z-index: 2;
  margin-right: -36px;
}

.phone-mockup--right {
  animation:
    phoneFloatRight 7s ease-in-out infinite,
    phoneGlow 7s ease-in-out infinite;
  animation-delay: 0.6s;
  z-index: 1;
  margin-left: -36px;
}

.phone-mockup::before {
  content: "";
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 78px;
  height: 20px;
  background: #000;
  border-radius: 14px;
  z-index: 3;
}

.phone-screen {
  width: 100%;
  height: 100%;
  border-radius: 32px;
  background: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.phone-screen-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 600px) {
  .phone-dual {
    gap: 12px;
    min-height: 460px;
  }
  .phone-mockup {
    width: 190px;
    height: 400px;
    border-radius: 34px;
    padding: 10px;
  }
  .phone-mockup--left { margin-right: -26px; }
  .phone-mockup--right { margin-left: -26px; }
  .phone-mockup::before {
    width: 62px;
    height: 16px;
    top: 12px;
  }
  .phone-screen {
    border-radius: 26px;
  }
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.25);
  animation: pulseDot 1.8s ease-in-out infinite;
}

/* --- Modern reveal & trendy animations --- */
@keyframes shimmerText {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes softScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes iconPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.hero-title {
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #cfead0 25%,
    #ffffff 50%,
    #cfead0 75%,
    #ffffff 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: "Outfit", sans-serif !important;
  animation: shimmerText 8s linear infinite;
}

.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}

.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }

.feature-icon {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.hover-card:hover .feature-icon {
  transform: scale(1.1) rotate(-4deg);
}

.gradient-border-card {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.gradient-border-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(76,175,80,0.5), rgba(27,94,32,0));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}

.cta-ring {
  position: relative;
}

.cta-ring::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 16px;
  border: 1px solid rgba(76, 175, 80, 0.35);
  animation: softScale 3s ease-in-out infinite;
  pointer-events: none;
}

.float-slow {
  animation: floatSlow 7s ease-in-out infinite;
}

@media (max-width: 991px) {
  .section-padding {
    padding: 40px 0;
  }
  .phone-mockup {
    width: 220px;
    height: 450px;
  }
}

/* --- Premium landing polish --- */
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  color: #e8f5e9;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 20px;
  box-shadow: 0 4px 24px rgba(76,175,80,0.12);
}

.hero-eyebrow .hero-eyebrow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7dd87f;
  box-shadow: 0 0 0 4px rgba(125,216,127,0.25);
  animation: pulseDot 1.8s ease-in-out infinite;
}

.hero-trust {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid rgba(255,255,255,0.12);
}

.hero-trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.85);
  font-size: 0.78rem;
  font-weight: 500;
}

.hero-trust-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7dd87f;
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(27,94,32,0.04) 0%, rgba(76,175,80,0.08) 100%);
  border: 1px solid rgba(27,94,32,0.08);
  margin-top: -48px;
  position: relative;
  z-index: 3;
  box-shadow: 0 20px 60px rgba(27, 94, 32, 0.08);
}

.stats-strip .stat {
  text-align: center;
  padding: 10px;
  border-right: 1px solid rgba(27,94,32,0.06);
}

.stats-strip .stat:last-child { border-right: none; }

.stats-strip .stat-value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-strip .stat-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: #4a4a4a;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

@media (max-width: 768px) {
  .stats-strip {
    grid-template-columns: repeat(2, 1fr);
    margin-top: -20px;
  }
  .stats-strip .stat {
    border-right: none;
    border-bottom: 1px solid rgba(27,94,32,0.06);
    padding-bottom: 14px;
  }
  .stats-strip .stat:nth-child(3), .stats-strip .stat:nth-child(4) {
    border-bottom: none;
  }
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(76,175,80,0.1);
  color: #1b5e20;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  border: 1px solid rgba(27,94,32,0.12);
}

.ecosystem-card {
  position: relative;
  padding: 40px 30px !important;
  border-radius: 22px !important;
  background: #ffffff !important;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
  border: 1px solid rgba(27,94,32,0.08) !important;
  box-shadow: 0 6px 30px rgba(27,94,32,0.04) !important;
}

.ecosystem-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1b5e20 0%, #4caf50 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s ease;
}

.ecosystem-card:hover {
  transform: translateY(-10px) !important;
  box-shadow: 0 30px 60px -12px rgba(27,94,32,0.18) !important;
}

.ecosystem-card:hover::before {
  transform: scaleX(1);
}

.ecosystem-card .card-index {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 3rem;
  font-weight: 900;
  color: rgba(27,94,32,0.07);
  letter-spacing: -2px;
  line-height: 1;
}

.testimonial-card {
  position: relative;
  padding: 36px 28px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(27,94,32,0.08);
  box-shadow: 0 10px 40px rgba(27,94,32,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(27,94,32,0.12);
  border-color: rgba(76,175,80,0.3);
}

.testimonial-card .quote-mark {
  font-size: 3.5rem;
  line-height: 1;
  color: rgba(27,94,32,0.15);
  font-family: Georgia, serif;
  margin-bottom: 8px;
}

.testimonial-card .stars {
  color: #FFB01F;
  font-size: 1rem;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.testimonial-card .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  pointer-events: none;
  z-index: 1;
}

.glow-orb-1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(76,175,80,0.6) 0%, transparent 70%);
  top: -120px;
  left: -160px;
  animation: floatSlow 9s ease-in-out infinite;
}

.glow-orb-2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(27,94,32,0.5) 0%, transparent 70%);
  bottom: -140px;
  right: -100px;
  animation: floatSlow 11s ease-in-out infinite reverse;
}

.section-eyebrow--light {
  background: rgba(255,255,255,0.08);
  color: #e8f5e9;
  border-color: rgba(255,255,255,0.2);
}

.cta-card-premium {
  border-radius: 24px !important;
  padding: 36px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbf8 100%) !important;
  border: 1px solid rgba(27,94,32,0.12) !important;
  box-shadow:
    0 20px 60px rgba(27,94,32,0.08),
    inset 0 1px 0 rgba(255,255,255,0.8) !important;
}

.journey-grid {
  position: relative;
}

.journey-card {
  position: relative;
  height: 100%;
  padding: 26px 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdfb 100%);
  border: 1px solid rgba(27,94,32,0.08);
  box-shadow: 0 12px 30px rgba(27,94,32,0.05);
  overflow: hidden;
}

.journey-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(76,175,80,0.08), transparent 34%);
  pointer-events: none;
}

.journey-number {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  color: rgba(27,94,32,0.08);
  letter-spacing: -2px;
}

`;

function Landing() {
  const { t } = useTranslation();
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    agencyName: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState({ type: null, text: "" });

  const greenStyles = {
    gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
  };

  const handleContactField = (field) => (event) => {
    setContactForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (contactFeedback.type) {
      setContactFeedback({ type: null, text: "" });
    }
  };

  const handleContactSubmit = async () => {
    const { fullName, email, agencyName, message } = contactForm;
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setContactFeedback({
        type: "error",
        text: "Veuillez remplir le nom, l'email et le message.",
      });
      return;
    }

    setContactSubmitting(true);
    setContactFeedback({ type: null, text: "" });

    try {
      const agencyLine = agencyName.trim()
        ? `Agence : ${agencyName.trim()}\n`
        : "";
      await sendComplaint({
        source: "Page d'accueil agence",
        sourceType: "agency_platform",
        target: "Plateforme agence",
        category: "Contactez-nous",
        sender: `${trimmedName} <${trimmedEmail}>`,
        message: `${agencyLine}Email : ${trimmedEmail}\n\n${trimmedMessage}`,
      });
      setContactForm({ fullName: "", email: "", agencyName: "", message: "" });
      setContactFeedback({
        type: "success",
        text: t("sections.contactSuccess"),
      });
    } catch (error) {
      setContactFeedback({
        type: "error",
        text: error?.message || t("sections.contactError"),
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("in-view"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const contactData = {
    phone: "+216 50 473 202",
    address: "10 Av. Abderrahmen Azzam, Montplaisir, Tunis 1073",
    email: "contact@sabeel.tn",
  };

  const journeySteps = [
    {
      number: "01",
      title: "Créer votre compte agence",
      description:
        "Inscrivez votre agence et activez votre espace Sabeel pour centraliser vos opérations dans un environnement professionnel.",
      icon: "person_add",
    },
    {
      number: "02",
      title: "Compléter votre profil & vos documents",
      description:
        "Renseignez les informations de votre structure et téléversez les pièces requises pour accélérer la validation administrative.",
      icon: "badge",
    },
    {
      number: "03",
      title: "Publier vos packs Umrah",
      description:
        "Diffusez vos offres avec dates, prix, services et disponibilités dans une présentation claire et rassurante pour les pèlerins.",
      icon: "inventory_2",
    },
    {
      number: "04",
      title: "Piloter réservations, guides et terrain",
      description:
        "Suivez les demandes, affectez les guides et gardez une vision temps réel sur vos groupes, incidents et opérations terrain.",
      icon: "travel_explore",
    },
  ];

  return (
    <PageLayout>
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <LandingHeader />

      {/* Hero Section */}
      <MDBox
        minHeight="90vh"
        width="100%"
        sx={{
          display: "flex",
          alignItems: "flex-end",
          pt: { xs: 14, lg: 18 },
          pb: { xs: 6, lg: 10 },
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#102414",
        }}
      >
        <Box
          component="video"
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80"
        >
          <source
            src="https://cdn.pixabay.com/video/2023/10/09/184139-873702379_large.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.pixabay.com/video/2022/03/15/110633-691383032_large.mp4"
            type="video/mp4"
          />
        </Box>
        <Box className="hero-gradient-overlay" />
        <Box className="green-blur-overlay" />
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Grid container alignItems="center" spacing={5} className="animate-fade-in">
            <Grid item xs={12} lg={7}>
              <MDTypography
                variant="h1"
                color="white"
                className="hero-title"
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2.5rem", lg: "3.1rem" },
                  fontWeight: 800,
                  mb: 2.5,
                  lineHeight: 1.12,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("hero.title1")}
                <br />
                <Box component="span" sx={{ color: "#4caf50" }}>
                  {t("hero.title2")}
                </Box>
              </MDTypography>
              <MDTypography
                variant="h5"
                color="white"
                fontWeight="regular"
                mb={4}
                sx={{
                  opacity: 0.92,
                  maxWidth: "760px",
                  fontSize: { xs: "0.98rem", sm: "1.15rem" },
                  lineHeight: 1.8,
                }}
              >
                {t("hero.subtitle")}
              </MDTypography>
              <MDBox display="flex" gap={2} flexWrap="wrap">
                <MDButton
                  component={Link}
                  to="/authentication/sign-in"
                  variant="gradient"
                  color="success"
                  size="large"
                  className="button-glow"
                  sx={{
                    px: { xs: 3, lg: 4 },
                    py: 1.5,
                    borderRadius: "12px",
                    background: greenStyles.gradient,
                    fontSize: { xs: "0.85rem", lg: "0.9rem" },
                  }}
                >
                  {t("auth.accessSpace")}
                </MDButton>
                <MDButton
                  component={Link}
                  to="/how-it-works"
                  variant="outlined"
                  size="large"
                  className="button-secondary-anim"
                  sx={{
                    px: { xs: 3, lg: 4 },
                    py: 1.5,
                    borderRadius: "12px",
                    color: "white !important",
                    backgroundColor: "rgba(255,255,255,0.06) !important",
                    border: "1px solid rgba(255,255,255,0.18)",
                    fontSize: { xs: "0.85rem", lg: "0.9rem" },
                  }}
                >
                  {t("auth.discoverJourney")}
                </MDButton>
              </MDBox>

              <Box className="hero-trust">
                <Box className="hero-trust-item">
                  <span className="dot" />
                  Agences agréées Umrah
                </Box>
                <Box className="hero-trust-item">
                  <span className="dot" />
                  Données hébergées & sécurisées
                </Box>
                <Box className="hero-trust-item">
                  <span className="dot" />
                  Support dédié en français
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} lg={5}>
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: { xs: "auto", lg: 560 } }}
              >
                <Box className="phone-dual">
                  <Box className="phone-mockup phone-mockup--left">
                    <Box className="phone-screen">
                      <Box
                        component="img"
                        src="/images/1.jpeg"
                        alt="Sabeel Guide App - Écran 1"
                        className="phone-screen-img"
                      />
                    </Box>
                  </Box>
                  <Box className="phone-mockup phone-mockup--right">
                    <Box className="phone-screen">
                      <Box
                        component="img"
                        src="/images/2.jpeg"
                        alt="Sabeel Guide App - Écran 2"
                        className="phone-screen-img"
                      />
                    </Box>
                  </Box>
                </Box>
              </MDBox>
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      {/* Stats Strip */}
      <MDBox sx={{ bgColor: "white", position: "relative", zIndex: 3 }} className="reveal">
        <Container>
          <Box className="stats-strip">
            {[
              { value: "50+", label: "Agences partenaires" },
              { value: "2 500+", label: "Pèlerins accompagnés" },
              { value: "99%", label: "Taux de conformité" },
              { value: "24/7", label: "Supervision terrain" },
            ].map((s) => (
              <Box key={s.label} className="stat">
                <Box className="stat-value">{s.value}</Box>
                <Box className="stat-label">{s.label}</Box>
              </Box>
            ))}
          </Box>
        </Container>
      </MDBox>

      {/* Concept Section */}
      <MDBox id="concept" className="section-padding reveal" bgColor="white">
        <Container>
          <Grid container spacing={10} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDTypography
                variant="h2"
                fontWeight="bold"
                mb={3}
                sx={{ fontSize: { xs: "2rem", lg: "3rem" }, letterSpacing: "-0.5px" }}
              >
                {t("sections.conceptHeading")}
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={4} lineHeight={1.8} fontSize="1.1rem">
                Sabeel ne se limite pas à un espace de gestion. La plateforme relie votre équipe
                administrative, vos guides terrain et vos futurs pèlerins dans un flux opérationnel
                unique, clair et sécurisé. Vous gagnez en visibilité, en conformité et en qualité de
                service à chaque étape du parcours client.
              </MDTypography>
              <MDBox display="flex" flexDirection="column" gap={3}>
                {[
                  {
                    t: "Développement commercial maîtrisé",
                    d: "Présentez vos offres Umrah avec une image professionnelle, des informations structurées et un processus de réservation plus fluide pour vos clients.",
                    i: "rocket_launch",
                  },
                  {
                    t: "Gestion documentaire sécurisée",
                    d: "Centralisez les pièces, justificatifs, échanges et validations dans un espace fiable qui réduit les erreurs et accélère le traitement administratif.",
                    i: "verified_user",
                  },
                  {
                    t: "Exécution terrain coordonnée",
                    d: "Suivez les groupes, affectez les guides, recevez les alertes et gardez une vision claire sur les opérations en déplacement.",
                    i: "travel_explore",
                  },
                ].map((item, i) => (
                  <MDBox key={i} display="flex" gap={3}>
                    <MDBox
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        backgroundColor: "#1b5e20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ color: "white !important" }}>{item.i}</Icon>
                    </MDBox>
                    <Box>
                      <MDTypography variant="h5" fontWeight="bold">
                        {item.t}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {item.d}
                      </MDTypography>
                    </Box>
                  </MDBox>
                ))}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1115&q=80"
                sx={{ width: "100%", borderRadius: 6, boxShadow: 25 }}
              />
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      {/* Ecosystem Section */}
      <MDBox
        id="ecosystem"
        className="section-padding reveal"
        sx={{ backgroundColor: "#f9fbf9", position: "relative", overflow: "hidden" }}
      >
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <MDBox textAlign="center" mb={8}>
            <MDTypography
              variant="h2"
              fontWeight="bold"
              mb={3}
              sx={{ fontSize: { xs: "2rem", lg: "3rem" }, letterSpacing: "-0.5px" }}
            >
              {t("sections.ecosystemHeading")}
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              mt={2}
              maxWidth="820px"
              mx="auto"
              fontSize="1.05rem"
              lineHeight={1.8}
            >
              Chaque module a été conçu pour répondre à une étape concrète de votre activité :
              acquisition, conformité, publication des packs, coordination des guides, relation
              client et supervision des réservations.
            </MDTypography>
          </MDBox>
          <Grid container spacing={4}>
            {[
              {
                t: "Pilotage Agence",
                d: "Supervisez vos packs, vos demandes, vos dossiers et vos priorités quotidiennes depuis un tableau de bord clair et opérationnel.",
                i: "settings",
                tags: ["Tableau de bord", "KPIs", "Workflow"],
              },
              {
                t: "Expérience Pèlerin",
                d: "Offrez un parcours moderne : consultation des offres, dépôt de documents, réservation et échanges centralisés dans un cadre professionnel.",
                i: "phone_android",
                tags: ["Mobile", "Documents", "Réservation"],
              },
              {
                t: "Supervision Terrain",
                d: "Affectez vos guides, suivez les groupes, gérez les incidents et gardez une visibilité renforcée sur vos opérations en Arabie Saoudite.",
                i: "map",
                tags: ["Guides", "Groupes", "Incidents"],
              },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card className="ecosystem-card reveal">
                  <Box className="card-index">0{i + 1}</Box>
                  <MDBox
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "18px",
                      background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      boxShadow: "0 10px 30px rgba(27,94,32,0.25)",
                    }}
                  >
                    <Icon sx={{ color: "white !important", fontSize: "1.9rem !important" }}>
                      {item.i}
                    </Icon>
                  </MDBox>
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    mb={1.5}
                    sx={{ fontSize: "1.25rem" }}
                  >
                    {item.t}
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    color="text"
                    lineHeight={1.7}
                    mb={2.5}
                    sx={{ fontSize: "0.92rem" }}
                  >
                    {item.d}
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1}>
                    {item.tags.map((tag) => (
                      <Box
                        key={tag}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "999px",
                          background: "rgba(76,175,80,0.1)",
                          color: "#1b5e20",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                          border: "1px solid rgba(27,94,32,0.1)",
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MDBox>

      {/* Journey Section */}
      <MDBox
        id="parcours"
        className="section-padding reveal"
        bgColor="white"
        sx={{ py: { xs: 6, lg: 8 } }}
      >
        <Container>
          <MDBox textAlign="center" mb={6}>
            <MDTypography
              variant="h2"
              fontWeight="bold"
              mb={2}
              sx={{ fontSize: { xs: "1.7rem", lg: "2.35rem" }, letterSpacing: "-0.5px" }}
            >
              Un parcours simple, fluide et structuré de bout en bout
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              maxWidth="760px"
              mx="auto"
              lineHeight={1.8}
              fontSize="0.98rem"
            >
              De l&apos;activation de votre compte à la supervision des opérations terrain, Sabeel
              guide votre agence à chaque étape avec un cadre clair, moderne et conforme.
            </MDTypography>
          </MDBox>

          <Grid container spacing={3} className="journey-grid">
            {journeySteps.map((step, index) => (
              <Grid item xs={12} md={6} key={step.number} sx={{ position: "relative" }}>
                <Card className="journey-card reveal">
                  <Box className="journey-number">{step.number}</Box>
                  <MDBox
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.2,
                      boxShadow: "0 12px 24px rgba(27,94,32,0.18)",
                    }}
                  >
                    <Icon sx={{ color: "white !important", fontSize: "1.5rem !important" }}>
                      {step.icon}
                    </Icon>
                  </MDBox>
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    mb={1.2}
                    sx={{ maxWidth: "82%", fontSize: "1.08rem" }}
                  >
                    {step.title}
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    color="text"
                    lineHeight={1.8}
                    sx={{ fontSize: "0.88rem" }}
                  >
                    {step.description}
                  </MDTypography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MDBox>

      {/* Guide App Section */}
      <MDBox
        id="guideapp"
        className="section-padding reveal"
        sx={{
          background:
            "radial-gradient(ellipse at top right, rgba(76,175,80,0.18) 0%, transparent 60%), linear-gradient(135deg, #0f2014 0%, #1a2e1a 60%, #14261a 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box className="glow-orb glow-orb-1" />
        <Box className="glow-orb glow-orb-2" />
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/4.png"
                alt="Sabeel Guide - Application mobile"
                sx={{
                  width: "90%",
                  borderRadius: 6,
                  border: "4px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography
                variant="h2"
                color="white"
                fontWeight="bold"
                mb={3}
                sx={{ fontSize: { xs: "2rem", lg: "3rem" }, letterSpacing: "-0.5px" }}
              >
                {t("sections.guideappHeading")}
              </MDTypography>
              <MDTypography
                variant="body1"
                color="white"
                opacity={0.75}
                mb={4}
                lineHeight={1.8}
                fontSize="1.05rem"
              >
                Les accompagnateurs disposent d&apos;outils simples pour signaler les incidents,
                remonter leur position et améliorer la communication avec l&apos;agence. Vous gardez
                ainsi une continuité opérationnelle entre le siège, les guides et les groupes.
              </MDTypography>
              <MDBox display="flex" flexWrap="wrap" gap={1.5} mb={4}>
                {[
                  { i: "gps_fixed", label: "Position Temps Réel" },
                  { i: "security", label: "Sécurité Active" },
                  { i: "groups", label: "Gestion de Groupes" },
                  { i: "notifications_active", label: "Alertes Instantanées" },
                ].map((f) => (
                  <Box
                    key={f.label}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 1.5,
                      py: 0.7,
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Icon sx={{ color: "#7dd87f !important", fontSize: "16px !important" }}>
                      {f.i}
                    </Icon>
                    <MDTypography
                      variant="caption"
                      color="white"
                      sx={{ fontSize: "0.78rem", fontWeight: 500 }}
                    >
                      {f.label}
                    </MDTypography>
                  </Box>
                ))}
              </MDBox>
              <MDBox display="flex" gap={2}>
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  sx={{ height: 45, cursor: "pointer" }}
                  className="store-badge"
                />
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  sx={{ height: 45, cursor: "pointer" }}
                  className="store-badge"
                />
              </MDBox>
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      {/* Testimonials Section */}
      <MDBox
        className="section-padding reveal"
        sx={{ backgroundColor: "#f9fbf9", position: "relative", overflow: "hidden" }}
      >
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <MDBox textAlign="center" mb={7}>
            <Box className="section-eyebrow" sx={{ mx: "auto" }}>
              <Icon sx={{ fontSize: "14px !important" }}>favorite</Icon>
              Ils nous font confiance
            </Box>
            <MDTypography
              variant="h2"
              fontWeight="bold"
              mb={2}
              sx={{ fontSize: { xs: "2rem", lg: "2.6rem" }, letterSpacing: "-0.5px" }}
            >
              Une plateforme saluée par les professionnels de l&apos;Umrah
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              maxWidth="720px"
              mx="auto"
              fontSize="1.02rem"
              lineHeight={1.8}
            >
              Agences, guides et pèlerins témoignent de l&apos;impact concret de Sabeel sur leur
              quotidien et leur relation client.
            </MDTypography>
          </MDBox>

          <Grid container spacing={4}>
            {[
              {
                name: "Sarah Ben Amor",
                role: "Directrice d'agence Umrah",
                initials: "SB",
                quote:
                  "Sabeel a transformé notre gestion quotidienne. Nous gagnons un temps précieux sur les dossiers et la communication avec les pèlerins est bien plus fluide.",
                stars: 5,
              },
              {
                name: "Karim Youssef",
                role: "Guide spirituel",
                initials: "KY",
                quote:
                  "Je gère mes groupes, mes réservations et mes échanges depuis une seule application. L'équipe au siège a enfin une vraie visibilité sur le terrain.",
                stars: 5,
              },
              {
                name: "Mohammed Ali",
                role: "Responsable opérations",
                initials: "MA",
                quote:
                  "La supervision terrain et la gestion documentaire sont irréprochables. Sabeel est un vrai partenaire stratégique pour nos saisons Umrah.",
                stars: 5,
              },
            ].map((tm) => (
              <Grid item xs={12} md={4} key={tm.name}>
                <Box className="testimonial-card reveal">
                  <Box className="quote-mark">&ldquo;</Box>
                  <Box className="stars">{"★".repeat(tm.stars)}</Box>
                  <MDTypography
                    variant="body1"
                    color="text"
                    lineHeight={1.8}
                    sx={{ fontSize: "0.98rem", mb: 3, flex: 1 }}
                  >
                    {tm.quote}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <Box className="avatar">{tm.initials}</Box>
                    <Box>
                      <MDTypography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        {tm.name}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" sx={{ fontSize: "0.78rem" }}>
                        {tm.role}
                      </MDTypography>
                    </Box>
                  </MDBox>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MDBox>

      {/* Contact Section */}
      <MDBox id="contact" className="section-padding reveal" bgColor="white">
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={12} lg={5}>
              <Box className="section-eyebrow">
                <Icon sx={{ fontSize: "14px !important" }}>mark_email_read</Icon>
                {t("sections.contactEyebrow")}
              </Box>
              <MDTypography
                variant="h2"
                fontWeight="bold"
                mb={2}
                sx={{ fontSize: { xs: "2rem", lg: "3rem" }, letterSpacing: "-0.5px" }}
              >
                {t("sections.contactHeading")}
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={6} lineHeight={1.8}>
                {t("sections.contactIntro")}
              </MDTypography>
              <MDBox display="flex" flexDirection="column" gap={3}>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ color: "#1b5e20", fontSize: "1.2rem !important" }}>email</Icon>
                  </MDBox>
                  <MDTypography sx={{ fontSize: "1rem" }} color="text">
                    {contactData.email}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ color: "#1b5e20", fontSize: "1.2rem !important" }}>phone</Icon>
                  </MDBox>
                  <MDTypography sx={{ fontSize: "1rem" }} color="text">
                    {contactData.phone}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ color: "#1b5e20", fontSize: "1.2rem !important" }}>
                      location_on
                    </Icon>
                  </MDBox>
                  <MDTypography sx={{ fontSize: "1rem" }} color="text">
                    {contactData.address}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
            <Grid item xs={12} lg={7}>
              <Paper elevation={0} className="cta-card-premium">
                <MDBox display="flex" alignItems="center" gap={1.2} mb={3}>
                  <Icon sx={{ color: "#1b5e20 !important", fontSize: "20px !important" }}>
                    send
                  </Icon>
                  <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: "1.05rem" }}>
                    {t("sections.contactFormTitle")}
                  </MDTypography>
                </MDBox>
                {contactFeedback.type && (
                  <Alert severity={contactFeedback.type} sx={{ mb: 2 }}>
                    {contactFeedback.text}
                  </Alert>
                )}
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("sections.contactFullName")}
                      variant="outlined"
                      value={contactForm.fullName}
                      onChange={handleContactField("fullName")}
                      disabled={contactSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label={t("sections.contactEmail")}
                      variant="outlined"
                      value={contactForm.email}
                      onChange={handleContactField("email")}
                      disabled={contactSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("sections.contactAgency")}
                      variant="outlined"
                      value={contactForm.agencyName}
                      onChange={handleContactField("agencyName")}
                      disabled={contactSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={t("sections.contactMessage")}
                      variant="outlined"
                      value={contactForm.message}
                      onChange={handleContactField("message")}
                      disabled={contactSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      size="large"
                      className="button-glow"
                      disabled={contactSubmitting}
                      onClick={handleContactSubmit}
                      sx={{
                        py: 1.6,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%) !important",
                      }}
                    >
                      {contactSubmitting ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        t("sections.contactSubmit")
                      )}
                    </MDButton>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center" gap={1} justifyContent="center">
                      <Icon sx={{ color: "#1b5e20 !important", fontSize: "16px !important" }}>
                        lock
                      </Icon>
                      <MDTypography variant="caption" color="text" sx={{ fontSize: "0.78rem" }}>
                        {t("sections.contactPrivacy")}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      <LandingFooter />
      <SabeelChatBot mode="public" />
    </PageLayout>
  );
}

export default Landing;
