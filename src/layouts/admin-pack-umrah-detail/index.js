import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { fetchPackUmrahByIdForAdmin } from "auth/adminAgenceAuth";

function AdminPackUmrahDetail() {
  const { packId } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setError("");
        setLoading(true);
        const data = await fetchPackUmrahByIdForAdmin(packId);
        if (!mounted) return;
        setPack(data);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Impossible de charger les détails du pack");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [packId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Détails du Pack
            </MDTypography>
            <MDTypography variant="button" color="text">
              {pack?.titre || pack?.title || "-"}
            </MDTypography>
          </MDBox>

          <MDBox display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => navigate(-1)} title="Retour">
              <Icon>arrow_back</Icon>
            </IconButton>
          </MDBox>
        </MDBox>

        {loading && (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="button" color="text">
                Chargement...
              </MDTypography>
            </MDBox>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="button" color="error">
                {error}
              </MDTypography>
            </MDBox>
          </Card>
        )}

        {!loading && !error && pack && (
          <Card>
            <MDBox p={4} bgColor="grey-100">
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                    Informations Générales
                  </MDTypography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        AGENCE
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        {pack.agence || "-"}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        STATUT
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        {pack.status || "-"}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        PRIX
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        {typeof pack.prix === "number"
                          ? `${pack.prix} ${pack.devise || ""}`
                          : pack.prix || "-"}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        DATE CRÉATION
                      </MDTypography>
                      <MDTypography variant="button" display="block">
                        {pack.dateCreation
                          ? new Date(pack.dateCreation).toLocaleDateString("fr-FR")
                          : "-"}
                      </MDTypography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                    Description
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    {pack.description || "-"}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} md={5}>
                  <MDTypography variant="h6" textTransform="uppercase" mb={2}>
                    Actions
                  </MDTypography>

                  <MDBox display="flex" flexDirection="column" gap={1.5}>
                    <MDButton
                      variant="outlined"
                      color="success"
                      onClick={() => navigate(`/admin/agences/${pack.agencyId}/packs`)}
                    >
                      Voir les packs de l&apos;agence
                    </MDButton>
                    <MDButton variant="text" color="dark" onClick={() => navigate(-1)}>
                      Retour
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        )}
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminPackUmrahDetail;
