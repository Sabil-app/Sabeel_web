import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Mock data - Ce devrait venir d'une API
const mockPelerins = [
  {
    id: 101,
    name: "Ahmed Mansouri",
    group: "Groupe A - Guide Sami",
    pack: "Umrah Premium",
    passport: "T1234567",
    email: "ahmed.mansouri@email.com",
    phone: "+216 20 123 456",
    dateOfBirth: "1975-05-15",
    nationality: "Tunisia",
    address: "123 Rue de la Paix, Tunis",
    status: "Confirmé",
    registrationDate: "2024-01-15",
    validationDate: "2024-02-01",
    documents: ["Passeport", "Vaccin", "Visa"],
    medicalInfo: "Aucune allergie connue",
    emergencyContact: "Leila Mansouri - +216 20 111 111",
  },
  {
    id: 102,
    name: "Leila Trabelsi",
    group: "Non assigné",
    pack: "Umrah Premium",
    passport: "T9876543",
    email: "leila.trabelsi@email.com",
    phone: "+216 20 654 321",
    dateOfBirth: "1980-03-22",
    nationality: "Tunisia",
    address: "456 Avenue Mohamed Ali, Sfax",
    status: "Confirmé",
    registrationDate: "2024-01-20",
    validationDate: "2024-02-05",
    documents: ["Passeport", "Vaccin", "Visa"],
    medicalInfo: "Diabète - Insuline requise",
    emergencyContact: "Mohamed Trabelsi - +216 20 222 222",
  },
];

function PelerinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Trouver le pèlerin
  const pelerin = mockPelerins.find((p) => p.id === Number(id));

  if (!pelerin) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} px={3}>
          <MDTypography variant="h6" color="error">
            Pèlerin non trouvé
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => navigate("/agency/pelerins")}
            sx={{ mt: 2 }}
          >
            Retour à la liste
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              Profil du Pèlerin
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Informations complètes et documents de {pelerin.name}
            </MDTypography>
          </MDBox>
          <IconButton onClick={() => navigate("/agency/pelerins")}>
            <Icon>close</Icon>
          </IconButton>
        </MDBox>

        {/* Infos personnelles */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold">
                    {pelerin.name}
                  </MDTypography>
                  <MDBadge
                    badgeContent={pelerin.status}
                    color="success"
                    variant="gradient"
                    size="sm"
                  />
                </MDBox>
                <MDBox textAlign="right">
                  <MDTypography variant="caption" color="text">
                    Passeport: <strong>{pelerin.passport}</strong>
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    Pack: <strong>{pelerin.pack}</strong>
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Informations personnelles détaillées */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Informations Personnelles
                </MDTypography>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Email
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.email}
                  </MDTypography>
                </MDBox>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Téléphone
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.phone}
                  </MDTypography>
                </MDBox>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Date de Naissance
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.dateOfBirth}
                  </MDTypography>
                </MDBox>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Nationalité
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.nationality}
                  </MDTypography>
                </MDBox>

                <MDBox p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Adresse
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.address}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Informations de Dossier
                </MDTypography>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Statut
                  </MDTypography>
                  <MDBadge
                    badgeContent={pelerin.status}
                    color="success"
                    variant="gradient"
                    size="sm"
                  />
                </MDBox>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Groupe Assigné
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.group}
                  </MDTypography>
                </MDBox>

                <MDBox mb={2} p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Date d'Inscription
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.registrationDate}
                  </MDTypography>
                </MDBox>

                <MDBox p={1.5} bgColor="grey-100" borderRadius="lg">
                  <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                    Date de Validation
                  </MDTypography>
                  <MDTypography variant="body2" color="dark">
                    {pelerin.validationDate}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Informations médicales et urgence */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Informations Médicales
                </MDTypography>

                <MDBox p={2} bgColor="warning" borderRadius="lg">
                  <MDTypography variant="body2" color="white">
                    {pelerin.medicalInfo}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Contact d'Urgence
                </MDTypography>

                <MDBox p={2} bgColor="info" borderRadius="lg">
                  <MDTypography variant="body2" color="white">
                    {pelerin.emergencyContact}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Documents */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Documents Fournis
                </MDTypography>

                <MDBox display="flex" gap={2} flexWrap="wrap">
                  {pelerin.documents.map((doc, index) => (
                    <MDBadge
                      key={index}
                      badgeContent={doc}
                      color="success"
                      variant="gradient"
                      size="lg"
                    />
                  ))}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <MDBox display="flex" gap={2} justifyContent="center">
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => navigate("/agency/pelerins")}
          >
            Retour à la liste
          </MDButton>
          <MDButton variant="gradient" color="warning">
            Modifier les informations
          </MDButton>
          <MDButton variant="gradient" color="error">
            Désassigner du groupe
          </MDButton>
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default PelerinDetail;
