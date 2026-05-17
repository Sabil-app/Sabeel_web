import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

function AgencyDossier() {
  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox display="flex" alignItems="center" gap={2} sx={{ position: "relative", zIndex: 1 }}>
          <MDBox className="agency-icon-chip">
            <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>
              folder_shared
            </Icon>
          </MDBox>
          <MDBox>
            <MDTypography className="agency-hero__title" variant="h5" color="white">
              Dépôt du Dossier Réglementaire
            </MDTypography>
            <MDTypography className="agency-hero__subtitle" variant="button" color="white">
              Fournissez les documents nécessaires pour valider votre activité.
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <Grid container spacing={3}>
        {[
          { t: "Licence d'Agence", s: "Obligatoire", i: "description" },
          { t: "Registre de Commerce", s: "Obligatoire", i: "business_center" },
          { t: "Garantie Financière", s: "Optionnelle", i: "account_balance" },
        ].map((doc, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card className={`reveal-up reveal-up-${idx + 1}`} sx={{ p: 3, textAlign: "center" }}>
              <MDBox
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 1.5,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 22px -10px rgba(27,94,32,0.5)",
                }}
              >
                <Icon sx={{ color: "white !important", fontSize: "26px !important" }}>
                  {doc.i}
                </Icon>
              </MDBox>
              <MDTypography variant="h6" fontWeight="bold">
                {doc.t}
              </MDTypography>
              <MDTypography variant="caption" color="text" display="block" mb={2}>
                {doc.s}
              </MDTypography>
              <MDButton variant="outlined" color="success" size="small">
                Téléverser
              </MDButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AgencyPageShell>
  );
}

export default AgencyDossier;
