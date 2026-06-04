import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";
import LandingHeader from "layouts/landing/components/Header";
import LandingFooter from "layouts/landing/components/Footer";
import SabeelChatBot from "layouts/landing/components/ChatBot";

const steps = [
  {
    number: "01",
    title: "Créer votre compte agence",
    description:
      "Inscrivez votre agence avec vos informations professionnelles pour activer votre espace de travail Sabeel et centraliser vos opérations.",
    icon: "person_add",
  },
  {
    number: "02",
    title: "Compléter le profil de votre structure",
    description:
      "Renseignez les coordonnées du responsable, les informations de l'agence et les éléments nécessaires à la validation administrative.",
    icon: "badge",
  },
  {
    number: "03",
    title: "Téléverser les documents requis",
    description:
      "Ajoutez les pièces justificatives, le contrat et les documents officiels dans un environnement sécurisé et structuré.",
    icon: "upload_file",
  },
  {
    number: "04",
    title: "Validation par l'équipe Sabeel",
    description:
      "Notre équipe vérifie votre dossier, contrôle la conformité des documents et prépare l'activation de votre espace agence.",
    icon: "verified_user",
  },
  {
    number: "05",
    title: "Réception de l'email d'activation",
    description:
      "Vous recevez un email professionnel confirmant l'activation de votre compte et l'accès complet à votre tableau de bord.",
    icon: "mark_email_read",
  },
  {
    number: "06",
    title: "Publier vos packs Umrah",
    description:
      "Mettez vos offres en ligne avec un contenu clair, les dates, les prix, les services inclus et les disponibilités.",
    icon: "inventory_2",
  },
  {
    number: "07",
    title: "Ajouter vos guides",
    description:
      "Intégrez vos guides et accompagnateurs, organisez les groupes et préparez le suivi terrain via l'écosystème Sabeel.",
    icon: "groups",
  },
  {
    number: "08",
    title: "Recevoir et gérer les réservations",
    description:
      "Suivez les demandes des pèlerins, validez les dossiers, échangez avec les clients et pilotez votre activité en temps réel.",
    icon: "event_available",
  },
];

function LandingHowItWorks() {
  return (
    <PageLayout>
      <LandingHeader light showTopAccent />

      <MDBox
        pt={18}
        pb={10}
        sx={{
          background: "linear-gradient(180deg, #f7faf7 0%, #ffffff 100%)",
          minHeight: "100vh",
        }}
      >
        <Container>
          <MDBox textAlign="center" mb={8}>
            <MDTypography
              variant="h6"
              color="success"
              fontWeight="bold"
              textTransform="uppercase"
              mb={2}
            >
              Comment ça marche
            </MDTypography>
            <MDTypography
              variant="h2"
              fontWeight="bold"
              mb={2}
              sx={{ fontSize: { xs: "2rem", lg: "3.25rem" } }}
            >
              Le parcours digital d&apos;une agence sur Sabeel
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              maxWidth="820px"
              mx="auto"
              lineHeight={1.8}
              fontSize="1.05rem"
            >
              Sabeel structure chaque étape de votre activation et de votre exploitation
              quotidienne, depuis la création du compte jusqu&apos;à la gestion opérationnelle des
              réservations, des groupes et des guides sur le terrain.
            </MDTypography>
          </MDBox>

          <Grid container spacing={3}>
            {steps.map((step) => (
              <Grid item xs={12} md={6} key={step.number}>
                <Card
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 4,
                    border: "1px solid rgba(27, 94, 32, 0.08)",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.07)",
                  }}
                >
                  <MDBox
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <MDBox
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: "white !important", fontSize: "1.7rem !important" }}>
                        {step.icon}
                      </Icon>
                    </MDBox>
                    <MDTypography
                      variant="h3"
                      fontWeight="bold"
                      sx={{ color: "rgba(27,94,32,0.12)" }}
                    >
                      {step.number}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="h5" fontWeight="bold" mb={1.5}>
                    {step.title}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" lineHeight={1.8}>
                    {step.description}
                  </MDTypography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <MDBox
            mt={8}
            p={4}
            borderRadius={4}
            sx={{
              background: "linear-gradient(135deg, #1a2e1a 0%, #234223 100%)",
              color: "white",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} lg={8}>
                <MDTypography variant="h4" color="white" fontWeight="bold" mb={1}>
                  Un parcours pensé pour la conformité, la performance et la sérénité
                </MDTypography>
                <MDTypography variant="body1" color="white" opacity={0.8}>
                  Avec Sabeel, votre agence bénéficie d&apos;un cadre de travail moderne pour
                  structurer ses opérations, fluidifier le traitement administratif et améliorer
                  l&apos;expérience pèlerin avant, pendant et après la réservation.
                </MDTypography>
              </Grid>
              <Grid item xs={12} lg={4}>
                <MDBox
                  display="flex"
                  justifyContent={{ xs: "flex-start", lg: "flex-end" }}
                  gap={2}
                  flexWrap="wrap"
                >
                  <MDButton component={Link} to="/" variant="outlined" color="white">
                    Retour à l&apos;accueil
                  </MDButton>
                  <MDButton
                    component={Link}
                    to="/authentication/sign-up"
                    variant="gradient"
                    color="success"
                  >
                    Créer un compte
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Container>
      </MDBox>

      <LandingFooter />
      <SabeelChatBot mode="public" />
    </PageLayout>
  );
}

export default LandingHowItWorks;
