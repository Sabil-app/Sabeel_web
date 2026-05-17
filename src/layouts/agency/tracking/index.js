import { useState, useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Layout components
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

function LiveTrackingMap() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || map) return;
      const L = window.L;
      // Centered on Holy Sites (approx)
      const initialMap = L.map(mapRef.current).setView([21.4225, 39.8262], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(initialMap);

      // Mock positions for groups
      const groups = [
        { name: "Groupe A (Sami)", lat: 21.4225, lng: 39.8262, color: "green" },
        { name: "Groupe B (Ahmed)", lat: 21.4138, lng: 39.8134, color: "blue" },
        { name: "Groupe C (Yassine)", lat: 21.4501, lng: 39.8502, color: "red" },
      ];

      groups.forEach((g) => {
        L.marker([g.lat, g.lng])
          .addTo(initialMap)
          .bindPopup(`<b>${g.name}</b><br>Dernière activité: il y a 5 min`)
          .openPopup();
      });

      setMap(initialMap);
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  return <MDBox ref={mapRef} width="100%" height="500px" borderRadius="lg" sx={{ zIndex: 1 }} />;
}

function AgencyTracking() {
  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDBox className="agency-icon-chip">
              <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>map</Icon>
            </MDBox>
            <MDBox>
              <MDTypography className="agency-hero__title" variant="h5" color="white">
                Suivi GPS en Temps Réel
              </MDTypography>
              <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                Position actuelle de vos groupes en Terre Sainte
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox
            display="flex"
            alignItems="center"
            gap={1}
            px={1.5}
            py={0.6}
            sx={{
              borderRadius: "10px",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <span className="pulse-dot" />
            <MDTypography variant="caption" color="white" fontWeight="bold">
              LIVE
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card className="reveal-up reveal-up-1">
            <LiveTrackingMap />
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card className="reveal-up reveal-up-2" sx={{ height: "100%" }}>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                État des Groupes
              </MDTypography>
              <MDBox component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {[
                  { name: "Groupe A - Sami", status: "À la Mecque", last: "Active" },
                  { name: "Groupe B - Ahmed", status: "En déplacement", last: "Active" },
                  { name: "Groupe C - Yassine", status: "Repos", last: "Hors ligne (1h)" },
                ].map((item, idx) => (
                  <MDBox key={idx} component="li" py={1.5} borderBottom="1px solid #eee">
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="button" fontWeight="bold">
                        {item.name}
                      </MDTypography>
                      <MDBadge
                        badgeContent={item.last === "Active" ? "ON" : "OFF"}
                        color={item.last === "Active" ? "success" : "secondary"}
                        size="xs"
                      />
                    </MDBox>
                    <MDTypography variant="caption" color="text">
                      {item.status}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </AgencyPageShell>
  );
}

export default AgencyTracking;
