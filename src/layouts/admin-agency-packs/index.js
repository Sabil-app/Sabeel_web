import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { fetchAgencyById, fetchAgencyPackUmrahForAdmin } from "auth/adminAgenceAuth";

function AgencyPacksAdmin() {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  const [agency, setAgency] = useState(null);
  const [packs, setPacks] = useState([]);
  const [expandedPackId, setExpandedPackId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setError("");
        setLoading(true);
        const [agencyResponse, packsResponse] = await Promise.all([
          fetchAgencyById(agencyId),
          fetchAgencyPackUmrahForAdmin(agencyId),
        ]);
        if (!mounted) return;
        setAgency(agencyResponse);
        setPacks(packsResponse);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Impossible de charger les packs de l'agence");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [agencyId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packs;
    return packs.filter((p) =>
      `${p.titre || p.title || ""} ${p.id || ""}`.toLowerCase().includes(q)
    );
  }, [packs, search]);

  const handleTogglePack = (packId) => {
    setExpandedPackId((prev) => (prev === packId ? null : packId));
  };

  const handleNavigateToPackDetails = (packId) => {
    setExpandedPackId(null);
    navigate(`/admin/packs/${packId}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Packs Umrah
            </MDTypography>
            <MDTypography variant="button" color="text">
              {agency?.agencyName || agency?.fullName || "Agence"}
            </MDTypography>
          </MDBox>

          <MDBox display="flex" alignItems="center" gap={1}>
            <MDInput
              label="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: "320px" }}
            />
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

        {!loading && !error && (
          <Grid container spacing={2}>
            {filtered.map((pack) => (
              <Grid item xs={12} key={pack.id}>
                <Card
                  sx={{
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    border: expandedPackId === pack.id ? "1px solid" : "none",
                    borderColor: "success.main",
                    boxShadow: expandedPackId === pack.id ? 3 : 1,
                  }}
                >
                  <MDBox
                    p={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleTogglePack(pack.id)}
                  >
                    <MDBox display="flex" alignItems="center" gap={2}>
                      {pack.imageUrl ? (
                        <MDBox
                          component="img"
                          src={pack.imageUrl}
                          alt={pack.titre || pack.title || "Pack"}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "12px",
                            objectFit: "cover",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        />
                      ) : null}

                      <MDBox>
                        <MDTypography variant="h6" fontWeight="bold">
                          {pack.titre || pack.title || "-"}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          Statut: {pack.status || "-"}
                        </MDTypography>
                      </MDBox>
                    </MDBox>

                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDTypography
                        variant="button"
                        color="success"
                        fontWeight="bold"
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToPackDetails(pack.id);
                        }}
                      >
                        Details
                      </MDTypography>
                      <Icon color="success">
                        {expandedPackId === pack.id ? "expand_less" : "expand_more"}
                      </Icon>
                    </MDBox>
                  </MDBox>

                  <Collapse in={expandedPackId === pack.id} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 0 }} />
                    <MDBox p={3} bgColor="grey-100">
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            AGENCE
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            {pack.agence || agency?.agencyName || agency?.fullName || "-"}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            PRIX
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            {pack.prix ?? pack.price ?? "-"}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            HÔTEL MEKKAH
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            {pack.hotelMekkah || "-"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {pack.hotelMekkahStars ? `${pack.hotelMekkahStars}★` : ""}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            HÔTEL MEDINA
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            {pack.hotelMedina || "-"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {pack.hotelMedinaStars ? `${pack.hotelMedinaStars}★` : ""}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            DATES
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            {pack.departureDate || "-"} → {pack.arrivalDate || "-"}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            SERVICES
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            Vol direct: {pack.volDirect ? "Oui" : "Non"}
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            Visa inclus: {pack.visaInclus ? "Oui" : "Non"}
                          </MDTypography>
                          <MDTypography variant="button" display="block">
                            Transfert: {pack.transfert ? "Oui" : "Non"}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            DESCRIPTION
                          </MDTypography>
                          <MDTypography variant="button" color="text">
                            {pack.description || "-"}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12}>
                          <MDTypography variant="caption" color="text" fontWeight="bold">
                            PROGRAMME JOUR PAR JOUR
                          </MDTypography>
                          {Array.isArray(pack.program) && pack.program.length ? (
                            <MDBox mt={1} display="flex" flexDirection="column" gap={1.5}>
                              {pack.program.map((dayItem, idx) => (
                                <MDBox key={`${dayItem?.day || "day"}-${idx}`}>
                                  <MDTypography variant="button" fontWeight="bold" display="block">
                                    {(() => {
                                      const dayLabel = dayItem?.day || `Jour ${idx + 1}`;
                                      const titlePart = dayItem?.title ? ` - ${dayItem.title}` : "";
                                      return `${dayLabel}${titlePart}`;
                                    })()}
                                  </MDTypography>
                                  <MDTypography variant="button" color="text">
                                    {dayItem?.description || "-"}
                                  </MDTypography>
                                </MDBox>
                              ))}
                            </MDBox>
                          ) : (
                            <MDTypography variant="button" color="text">
                              -
                            </MDTypography>
                          )}
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Collapse>
                </Card>
              </Grid>
            ))}

            {!filtered.length && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="button" color="text">
                      Aucun pack.
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AgencyPacksAdmin;
