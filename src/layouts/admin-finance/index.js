import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
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

const COMMISSION_RATE = 0.05;

const initialPayments = [
  {
    id: "RSV-1001",
    agence: "Agence Al Baraka",
    pelerin: "Ahmed Mansouri",
    pack: "Umrah Premium Ramadan",
    total: 8900,
    advance: 1500,
    currency: "TND",
    status: "paid",
    transferredToMainWallet: false,
    refunded: false,
    createdAt: "2026-04-12",
  },
  {
    id: "RSV-1002",
    agence: "Agence El Nour",
    pelerin: "Leila Trabelsi",
    pack: "Umrah Standard",
    total: 6200,
    advance: 1000,
    currency: "TND",
    status: "partial",
    transferredToMainWallet: false,
    refunded: false,
    createdAt: "2026-04-11",
  },
  {
    id: "RSV-1003",
    agence: "Agence Al Amal",
    pelerin: "Fatma Zahra",
    pack: "Umrah Économique",
    total: 4300,
    advance: 800,
    currency: "TND",
    status: "paid",
    transferredToMainWallet: true,
    refunded: false,
    createdAt: "2026-04-10",
  },
];

function AdminFinance() {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, row: null });

  const formatMoney = (amount, currency) => {
    if (typeof amount !== "number") return "-";
    return `${amount.toLocaleString("fr-FR")} ${currency || ""}`.trim();
  };

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;

    return payments.filter((p) => {
      const haystack = `${p.id} ${p.agence} ${p.pelerin} ${p.pack} ${p.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [payments, search]);

  const totals = useMemo(() => {
    const paidTotals = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.total, 0);
    const totalAdvances = payments.reduce((sum, p) => sum + (p.advance || 0), 0);
    const commissions = payments.reduce((sum, p) => sum + p.total * COMMISSION_RATE, 0);

    return {
      paidTotals,
      totalAdvances,
      commissions,
    };
  }, [payments]);

  const getStatusColor = (status) => {
    if (status === "paid") return "success";
    if (status === "partial") return "warning";
    return "error";
  };

  const getStatusLabel = (status) => {
    if (status === "paid") return "Payé";
    if (status === "partial") return "Acompte";
    return "En attente";
  };

  const openConfirm = (type, row) => setConfirmDialog({ open: true, type, row });
  const closeConfirm = () => setConfirmDialog({ open: false, type: null, row: null });

  const applyAction = () => {
    if (!confirmDialog.row || !confirmDialog.type) return;

    const id = confirmDialog.row.id;

    if (confirmDialog.type === "transfer") {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, transferredToMainWallet: true } : p))
      );
    }

    if (confirmDialog.type === "refund") {
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, refunded: true } : p)));
    }

    closeConfirm();
  };

  const StatusBadgeCell = ({ value }) => (
    <MDBadge
      badgeContent={getStatusLabel(value)}
      color={getStatusColor(value)}
      variant="gradient"
      size="xs"
    />
  );

  StatusBadgeCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  const TotalMoneyCell = ({ row }) => (
    <MDTypography variant="button" color="dark" fontWeight="medium">
      {formatMoney(row.original.total, row.original.currency)}
    </MDTypography>
  );

  TotalMoneyCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        total: PropTypes.number,
        currency: PropTypes.string,
      }),
    }).isRequired,
  };

  const CommissionCell = ({ row }) => (
    <MDTypography variant="button" color="dark" fontWeight="medium">
      {formatMoney(row.original.total * COMMISSION_RATE, row.original.currency)}
    </MDTypography>
  );

  CommissionCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        total: PropTypes.number,
        currency: PropTypes.string,
      }),
    }).isRequired,
  };

  const ActionsCell = ({ row }) => (
    <MDBox display="flex" justifyContent="flex-end" gap={0.5}>
      <IconButton
        size="small"
        onClick={() => openConfirm("transfer", row.original)}
        disabled={row.original.transferredToMainWallet || row.original.refunded}
      >
        <Icon fontSize="small">sync_alt</Icon>
      </IconButton>
      <IconButton
        size="small"
        onClick={() => openConfirm("refund", row.original)}
        disabled={row.original.refunded}
      >
        <Icon fontSize="small">undo</Icon>
      </IconButton>
    </MDBox>
  );

  ActionsCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        id: PropTypes.string,
        transferredToMainWallet: PropTypes.bool,
        refunded: PropTypes.bool,
      }),
    }).isRequired,
  };

  const columns = [
    { Header: "Réservation", accessor: "id", width: "12%" },
    { Header: "Agence", accessor: "agence", width: "18%" },
    { Header: "Pèlerin", accessor: "pelerin", width: "14%" },
    { Header: "Pack", accessor: "pack", width: "18%" },
    {
      Header: "Statut",
      accessor: "status",
      width: "10%",
      Cell: StatusBadgeCell,
    },
    {
      Header: "Total",
      accessor: "total",
      width: "10%",
      Cell: TotalMoneyCell,
    },
    {
      Header: "Commission (5%)",
      accessor: "commission",
      width: "12%",
      Cell: CommissionCell,
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
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Paiements (total)
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatMoney(totals.paidTotals, "TND")}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Acomptes encaissés
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatMoney(totals.totalAdvances, "TND")}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Commissions Sabeel (5%)
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatMoney(totals.commissions, "TND")}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium">
                    Gestion financière
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Suivi paiements, acomptes, transferts wallet, remboursements.
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
              <MDBox pt={1}>
                <DataTable
                  table={{ columns, rows: filteredPayments }}
                  isSorted
                  entriesPerPage
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={confirmDialog.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>
          <MDTypography variant="h6" fontWeight="bold">
            Confirmation
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox>
            <MDTypography variant="button" color="text" display="block">
              {confirmDialog.type === "transfer"
                ? "Confirmer le transfert vers le wallet principal ?"
                : "Confirmer le remboursement ?"}
            </MDTypography>
            <Divider sx={{ my: 2 }} />
            <MDTypography variant="caption" color="text" display="block">
              Réservation: {confirmDialog.row?.id}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              Agence: {confirmDialog.row?.agence}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              Pèlerin: {confirmDialog.row?.pelerin}
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeConfirm} color="dark" variant="text">
            Annuler
          </MDButton>
          <MDButton onClick={applyAction} color="success" variant="gradient">
            Confirmer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminFinance;
