import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { fetchConfirmedPilgrims } from "auth/adminAgenceAuth";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

// Layout components
import DataTable from "examples/Tables/DataTable";
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

// Component for Pèlerin Cell
function PelerinCell({ row }) {
  return (
    <MDBox display="flex" alignItems="center" px={1} py={0.5}>
      <MDBox mr={2}>
        <Avatar src={row.original.user?.photo} name={row.original.user?.firstName} size="sm" />
      </MDBox>
      <MDBox display="flex" flexDirection="column">
        <MDTypography variant="button" fontWeight="medium">
          {row.original.user?.firstName} {row.original.user?.lastName}
        </MDTypography>
        <MDTypography variant="caption" color="secondary">
          {row.original.user?.email}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

PelerinCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      user: PropTypes.shape({
        photo: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        email: PropTypes.string,
      }),
    }),
  }).isRequired,
};

// Component for Pack Cell
function PackCell({ row }) {
  return (
    <MDBox display="flex" flexDirection="column">
      <MDTypography variant="button" fontWeight="medium">
        {row.original.pack?.title}
      </MDTypography>
      <MDTypography variant="caption" color="secondary">
        {row.original.pack?.price} TND
      </MDTypography>
    </MDBox>
  );
}

PackCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      pack: PropTypes.shape({
        title: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    }),
  }).isRequired,
};

// Component for Payment Cell
function PaymentCell({ row }) {
  return (
    <MDBox display="flex" flexDirection="column">
      <MDBox display="flex" alignItems="center" gap={1}>
        <MDBadge badgeContent="Avance Payée" color="success" variant="gradient" size="xs" />
        <MDTypography variant="caption" fontWeight="bold">
          {row.original.amountPaid} TND
        </MDTypography>
      </MDBox>
      <MDTypography variant="caption" color="text">
        Total: {row.original.totalAmount} TND
      </MDTypography>
    </MDBox>
  );
}

PaymentCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      amountPaid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }).isRequired,
};

function ConfirmedPelerins() {
  const navigate = useNavigate();
  const [pilgrims, setPilgrims] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPilgrims = async () => {
    try {
      setLoading(true);
      const data = await fetchConfirmedPilgrims();
      setPilgrims(data);
    } catch (error) {
      console.error("Failed to fetch confirmed pilgrims", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPilgrims();
  }, []);

  const columns = [
    {
      Header: "Pèlerin",
      accessor: "user",
      Cell: PelerinCell,
      width: "30%",
    },
    {
      Header: "Pack Umrah",
      accessor: "pack",
      Cell: PackCell,
    },
    {
      Header: "Paiement",
      accessor: "payment",
      Cell: PaymentCell,
    },
    {
      Header: "Réservation",
      accessor: "status",
      Cell: () => <MDBadge badgeContent="Acceptée" color="info" variant="gradient" size="xs" />,
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: () => (
        <MDBox display="flex" gap={1}>
          <Tooltip title="Voir Dossier">
            <IconButton color="info" size="small">
              <Icon>description</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Contacter">
            <IconButton color="success" size="small">
              <Icon>chat</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  const rows = pilgrims.map((p) => ({
    ...p,
    user: p.user,
    pack: p.pack,
    action: "",
  }));

  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox display="flex" alignItems="center" gap={2} sx={{ position: "relative", zIndex: 1 }}>
          <MDBox
            className="agency-icon-chip"
            onClick={() => navigate("/agency/groupes")}
            sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" } }}
          >
            <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>arrow_back</Icon>
          </MDBox>
          <MDBox>
            <MDTypography className="agency-hero__title" variant="h5" color="white">
              Pèlerins Confirmés
            </MDTypography>
            <MDTypography className="agency-hero__subtitle" variant="button" color="white">
              Liste des pèlerins ayant validé leur réservation et payé l&apos;avance.
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox py={3}>
        <Card>
          <MDBox pt={3} px={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="medium">
              Dossiers Clients ({pilgrims.length})
            </MDTypography>
            <MDButton variant="outlined" color="success" size="small" onClick={loadPilgrims}>
              Actualiser
            </MDButton>
          </MDBox>
          <MDBox pt={1}>
            {loading ? (
              <MDBox textAlign="center" py={10}>
                <CircularProgress color="success" />
              </MDBox>
            ) : (
              <DataTable
                table={{ columns, rows }}
                isSorted={true}
                entriesPerPage={true}
                showTotalEntries={true}
                noEndBorder
              />
            )}
          </MDBox>
        </Card>
      </MDBox>
    </AgencyPageShell>
  );
}

export default ConfirmedPelerins;
