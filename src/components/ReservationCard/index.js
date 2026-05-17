import PropTypes from "prop-types";

import Card from "@mui/material/Card";

import Icon from "@mui/material/Icon";

import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";

import MDButton from "components/MDButton";

import MDTypography from "components/MDTypography";

function ReservationCard({ reservation, onAccept, onReject, onScheduleRDV, onContactPilgrim }) {
  const formatMoney = (value) => `${Number(value || 0).toLocaleString()} DT`;

  const isOnSiteAdvancePayment =
    typeof reservation.paymentType === "string" &&
    (reservation.paymentType.toLowerCase().includes("avance") ||
      reservation.paymentType.toLowerCase().includes("acompte")) &&
    reservation.paymentType.toLowerCase().includes("sur place");

  const estimatedAdvanceToPay = Number(reservation.advanceAmount || 0);

  const estimatedRemainingToPay = Math.max(
    0,

    Number(reservation.totalPrice || 0) - estimatedAdvanceToPay
  );

  const getStatusColor = () => {
    if (reservation.status === "pending") return "warning";

    if (reservation.status === "accepted") return "success";

    return "error";
  };

  const getStatusText = () => {
    if (reservation.status === "pending") return "En attente";

    if (reservation.status === "accepted") return "Acceptée";

    return "Refusée";
  };

  return (
    <Card
      sx={{
        p: 2.5,

        mb: 2,

        borderRadius: 2,

        border: "1px solid rgba(0,0,0,0.06)",

        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",

        borderLeft: `4px solid ${
          reservation.status === "pending"
            ? "#ffb300"
            : reservation.status === "accepted"
            ? "#4CAF50"
            : "#ef5350"
        }`,
      }}
    >
      {/* En-tête avec badge de statut */}

      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDBox>
          <MDTypography variant="h6" fontWeight="bold">
            {reservation.pilgrimName}
          </MDTypography>

          <MDTypography variant="caption" color="text">
            Réservé le {reservation.reservationDate || "N/A"}
          </MDTypography>
        </MDBox>

        <MDBox
          px={1.5}
          py={0.75}
          sx={{
            backgroundColor:
              reservation.status === "pending"
                ? "rgba(255, 179, 0, 0.1)"
                : reservation.status === "accepted"
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(239, 83, 80, 0.1)",

            borderRadius: 1,
          }}
        >
          <MDTypography
            variant="caption"
            fontWeight="bold"
            sx={{
              color:
                reservation.status === "pending"
                  ? "#ffb300"
                  : reservation.status === "accepted"
                  ? "#4CAF50"
                  : "#ef5350",
            }}
          >
            {getStatusText()}
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox
        p={1.5}
        mb={2}
        borderRadius={2}
        sx={{
          backgroundColor: "rgba(46, 125, 50, 0.08)",

          border: "1px solid rgba(46, 125, 50, 0.15)",
        }}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block">
              Type de Paiement
            </MDTypography>

            <MDTypography variant="button" fontWeight="bold" color="dark">
              {reservation.paymentType || "Paiement sur place"}
            </MDTypography>
          </MDBox>

          <MDBox textAlign="right">
            <MDTypography variant="caption" color="text" display="block">
              Prix total
            </MDTypography>

            <MDTypography variant="h6" fontWeight="bold" color="dark">
              {formatMoney(reservation.totalPrice)}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      {isOnSiteAdvancePayment && estimatedAdvanceToPay > 0 && (
        <MDBox
          p={1.5}
          mb={2}
          borderRadius={2}
          sx={{
            backgroundColor: "rgba(255, 179, 0, 0.08)",

            border: "1px solid rgba(255, 179, 0, 0.2)",
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="bold" display="block">
                Estimation paiement
              </MDTypography>

              <MDTypography variant="button" fontWeight="bold" color="dark">
                Avance sur place
              </MDTypography>
            </MDBox>

            <MDBox textAlign="right">
              <MDTypography variant="caption" color="text" display="block">
                Avance à payer
              </MDTypography>

              <MDTypography variant="h6" fontWeight="bold" color="dark">
                {formatMoney(estimatedAdvanceToPay)}
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox mt={1} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <MDTypography variant="caption" color="text">
              Reste à payer
            </MDTypography>

            <MDTypography variant="button" fontWeight="bold" color="dark">
              {formatMoney(estimatedRemainingToPay)}
            </MDTypography>
          </MDBox>
        </MDBox>
      )}

      {/* Grille d&apos;informations */}

      <MDBox display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
        {/* Contact */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Contact
          </MDTypography>

          <MDTypography variant="body2">{reservation.pilgrimPhone}</MDTypography>

          <MDTypography variant="caption" color="text">
            {reservation.pilgrimEmail || "Pas d'email"}
          </MDTypography>
        </MDBox>

        {/* Détails personnels */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Détails Personnels
          </MDTypography>

          <MDTypography variant="body2">Âge: {reservation.age || "N/A"} ans</MDTypography>

          <MDTypography variant="body2">Personnes: {reservation.pilgrimCount}</MDTypography>
        </MDBox>

        {/* Santé */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            État de Santé
          </MDTypography>

          <MDTypography variant="body2" color={reservation.hasDisease ? "error" : "success"}>
            {reservation.hasDisease ? "Maladie signalée" : "Bonne santé"}
          </MDTypography>
        </MDBox>

        {/* Médicaments */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Médicaments
          </MDTypography>

          <MDTypography variant="body2">
            {reservation.medications || "Aucun médicament obligatoire"}
          </MDTypography>
        </MDBox>

        {/* Pack */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Pack Choisi
          </MDTypography>

          <MDTypography variant="body2" fontWeight="bold">
            {reservation.packageName}
          </MDTypography>
        </MDBox>

        {/* Dates */}

        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Dates du Voyage
          </MDTypography>

          <MDTypography variant="body2">
            Du {reservation.startDate} au {reservation.endDate}
          </MDTypography>
        </MDBox>
      </MDBox>

      {/* Notes */}

      {reservation.notes && (
        <MDBox mb={2}>
          <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={0.5}>
            Notes Additionnelles
          </MDTypography>

          <MDTypography variant="caption" color="text">
            {reservation.notes}
          </MDTypography>
        </MDBox>
      )}

      <Divider sx={{ opacity: 0.6, mb: 2 }} />

      {/* Boutons d&apos;action */}

      <MDBox display="flex" justifyContent="flex-end" alignItems="center" flexWrap="wrap" gap={1}>
        <MDBox display="flex" gap={1} flexWrap="wrap">
          {reservation.status === "pending" && (
            <>
              <MDButton
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: "#4CAF50",

                  color: "white !important",

                  "&:hover": { backgroundColor: "#388E3C" },
                }}
                onClick={() => onAccept(reservation.id)}
              >
                Confirmer
              </MDButton>

              <MDButton
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onReject(reservation.id)}
              >
                Refuser
              </MDButton>
            </>
          )}

          {reservation.status === "accepted" && (
            <>
              <MDButton
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: "#2E7D32",

                  color: "white !important",

                  "&:hover": { backgroundColor: "#1B5E20" },
                }}
                onClick={() => onScheduleRDV(reservation.id)}
              >
                Programmer RDV
              </MDButton>

              <MDButton
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: "#1976D2",

                  color: "white !important",

                  "&:hover": { backgroundColor: "#1565C0" },
                }}
                onClick={() => onContactPilgrim(reservation.id)}
              >
                <Icon sx={{ mr: 0.5, fontSize: "18px !important" }}>chat</Icon>
                Contacter ce pèlerin
              </MDButton>
            </>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

ReservationCard.propTypes = {
  reservation: PropTypes.shape({
    id: PropTypes.number.isRequired,

    pilgrimName: PropTypes.string.isRequired,

    pilgrimPhone: PropTypes.string.isRequired,

    pilgrimEmail: PropTypes.string,

    age: PropTypes.number,

    hasDisease: PropTypes.bool,

    medications: PropTypes.string,

    reservationDate: PropTypes.string,

    paymentType: PropTypes.string,

    guideName: PropTypes.string.isRequired,

    startDate: PropTypes.string.isRequired,

    endDate: PropTypes.string.isRequired,

    pilgrimCount: PropTypes.number.isRequired,

    totalPrice: PropTypes.number.isRequired,

    advanceAmount: PropTypes.number,

    packageName: PropTypes.string.isRequired,

    notes: PropTypes.string,

    status: PropTypes.oneOf(["pending", "accepted", "rejected"]).isRequired,
  }).isRequired,

  onAccept: PropTypes.func.isRequired,

  onReject: PropTypes.func.isRequired,

  onScheduleRDV: PropTypes.func.isRequired,

  onContactPilgrim: PropTypes.func.isRequired,
};

export default ReservationCard;
