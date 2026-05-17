import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { approvePackUmrah, fetchAdminPackUmrah, rejectPackUmrah } from "auth/adminAgenceAuth";

function AdminPacks() {
  const [packs, setPacks] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsDialog, setDetailsDialog] = useState({ open: false, pack: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoading(true);
        const response = await fetchAdminPackUmrah();
        setPacks(response);
      } catch (fetchError) {
        setError(fetchError.message || "Impossible de charger les packs");
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  const filteredPacks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packs;

    return packs.filter((p) => {
      const haystack = `${p.id} ${p.agence} ${p.titre} ${p.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [packs, search]);

  const formatMoney = (amount, currency) => {
    if (typeof amount !== "number") return "-";
    return `${amount.toLocaleString("fr-FR")} ${currency || ""}`.trim();
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return "Validé";
    if (status === "rejected") return "Refusé";
    return "En attente";
  };

  const updateStatus = async (packId, status) => {
    try {
      const updatedPack =
        status === "approved" ? await approvePackUmrah(packId) : await rejectPackUmrah(packId);
      setPacks((prev) => prev.map((p) => (p.id === packId ? updatedPack : p)));
    } catch (actionError) {
      setError(actionError.message || "Impossible de mettre à jour le statut du pack");
    }
  };

  const PackNameCell = ({ value, row }) => (
    <MDButton
      variant="text"
      color="dark"
      size="small"
      onClick={() => setDetailsDialog({ open: true, pack: row.original })}
    >
      {value}
    </MDButton>
  );

  PackNameCell.propTypes = {
    value: PropTypes.string.isRequired,
    row: PropTypes.shape({
      original: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
  };

  const PriceCell = ({ row }) => (
    <MDTypography variant="button" color="dark" fontWeight="medium">
      {formatMoney(row.original.prix, row.original.devise)}
    </MDTypography>
  );

  PriceCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        prix: PropTypes.number,
        devise: PropTypes.string,
      }),
    }).isRequired,
  };

  const StatusCell = ({ value }) => (
    <MDBadge
      badgeContent={getStatusLabel(value)}
      color={getStatusColor(value)}
      variant="gradient"
      size="xs"
    />
  );

  StatusCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  const ActionsCell = ({ row }) => (
    <MDBox display="flex" gap={0.5} justifyContent="flex-end">
      <IconButton
        size="small"
        onClick={() => updateStatus(row.original.id, "approved")}
        disabled={row.original.status === "approved"}
      >
        <Icon fontSize="small">check</Icon>
      </IconButton>
      <IconButton
        size="small"
        onClick={() => updateStatus(row.original.id, "rejected")}
        disabled={row.original.status === "rejected"}
      >
        <Icon fontSize="small">close</Icon>
      </IconButton>
    </MDBox>
  );

  ActionsCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
      }),
    }).isRequired,
  };

  const columns = [
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "Agence", accessor: "agence", width: "20%" },
    {
      Header: "Pack",
      accessor: "titre",
      width: "25%",
      Cell: PackNameCell,
    },
    {
      Header: "Prix",
      accessor: "prix",
      width: "15%",
      Cell: PriceCell,
    },
    {
      Header: "Statut",
      accessor: "status",
      width: "15%",
      Cell: StatusCell,
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ActionsCell,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium">
                    Packs Umrah (Validation Admin)
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Après validation, le pack devient visible pour les pèlerins.
                  </MDTypography>
                </MDBox>
                <MDBox width="16rem">
                  <MDInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    size="small"
                    fullWidth
                  />
                </MDBox>
              </MDBox>
              {error && (
                <MDBox px={3} pb={1}>
                  <MDTypography variant="button" color="error">
                    {error}
                  </MDTypography>
                </MDBox>
              )}
              <MDBox pt={1}>
                {loading ? (
                  <MDBox p={3}>
                    <MDTypography variant="button" color="text">
                      Chargement des packs Umrah...
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows: filteredPacks }}
                    isSorted
                    entriesPerPage
                    showTotalEntries
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, pack: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="bold">
              Détails du pack
            </MDTypography>
            <IconButton onClick={() => setDetailsDialog({ open: false, pack: null })} size="small">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox>
            <MDTypography variant="button" color="text" display="block">
              <strong>ID:</strong> {detailsDialog.pack?.id}
            </MDTypography>
            <MDTypography variant="button" color="text" display="block">
              <strong>Agence:</strong> {detailsDialog.pack?.agence}
            </MDTypography>
            <MDTypography variant="button" color="text" display="block">
              <strong>Titre:</strong> {detailsDialog.pack?.titre}
            </MDTypography>
            <MDTypography variant="button" color="text" display="block">
              <strong>Prix:</strong>{" "}
              {formatMoney(detailsDialog.pack?.prix, detailsDialog.pack?.devise)}
            </MDTypography>
            <MDTypography variant="button" color="text" display="block">
              <strong>Créé le:</strong> {detailsDialog.pack?.dateCreation}
            </MDTypography>
            <Divider sx={{ my: 2 }} />
            <MDTypography variant="button" color="text" display="block">
              <strong>Description:</strong>
            </MDTypography>
            <MDTypography variant="button" color="text">
              {detailsDialog.pack?.description}
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={() => setDetailsDialog({ open: false, pack: null })}
            color="dark"
            variant="text"
          >
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminPacks;
