import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import {
  buildIdempotencyKey,
  createConnectOnboardingLink,
  fetchAdminPresentielCommissions,
  fetchAdminWalletOverview,
  fetchAdminWalletTransactions,
  fetchConnectStatus,
  formatWalletMoney,
  requestAdminWalletWithdrawal,
} from "api/walletApi";

const txTypeLabel = (type) => {
  const t = String(type || "").toUpperCase();
  if (t.includes("COMMISSION")) return "Commission 5%";
  if (t.includes("WITHDRAWAL")) return "Retrait";
  if (t.includes("EARNING")) return "Versement";
  if (t.includes("PAYMENT")) return "Paiement";
  if (t.includes("TOPUP")) return "Recharge";
  if (t.includes("REFUND")) return "Remboursement";
  return t || "Transaction";
};

function AdminFinance() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [presentiel, setPresentiel] = useState({ items: [], paymentProcedure: [] });
  const [search, setSearch] = useState("");
  const [connectStatus, setConnectStatus] = useState({ connected: false, last4: null });
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [ov, tx, pres, connect] = await Promise.all([
        fetchAdminWalletOverview(),
        fetchAdminWalletTransactions(100, 0),
        fetchAdminPresentielCommissions(100, 0),
        fetchConnectStatus().catch(() => ({ connected: false, last4: null })),
      ]);
      setOverview(ov);
      setTransactions(Array.isArray(tx?.items) ? tx.items : []);
      setPresentiel({
        items: Array.isArray(pres?.items) ? pres.items : [],
        paymentProcedure: Array.isArray(pres?.paymentProcedure) ? pres.paymentProcedure : [],
        totalDueMillimes: pres?.totalDueMillimes || 0,
      });
      setConnectStatus({
        connected: Boolean(connect?.connected),
        last4: connect?.last4 || null,
      });
    } catch (e) {
      setError(e?.message || "Impossible de charger les données financières.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const wallet = overview?.wallet;
  const stats = overview?.stats || {};

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) => {
      const hay = [
        tx.id,
        tx.type,
        tx.pilgrimName,
        tx.agencyName,
        tx.packageName,
        tx.referenceId,
        tx.recipientType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [transactions, search]);

  const txRows = filteredTx.map((tx) => ({
    id: tx.id?.slice(0, 8) || "—",
    type: txTypeLabel(tx.type),
    pilgrim: tx.pilgrimName || "—",
    party: tx.agencyName || tx.recipientType || "—",
    amount: formatWalletMoney(tx.direction === "incoming" ? tx.amount : -tx.amount, tx.currency),
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("fr-FR") : "—",
    status: tx.status || "—",
  }));

  const presentielRows = presentiel.items.map((row) => ({
    id: row.reservationId?.slice(0, 8) || "—",
    owner: row.ownerName,
    ownerType: row.ownerType === "GUIDE" ? "Guide" : "Agence",
    pilgrim: row.pilgrimName,
    pack: row.packageName || "—",
    commission: formatWalletMoney(row.commissionDueMillimes, "TND"),
    status: "À régler",
  }));

  const handleConnect = async () => {
    try {
      const res = await createConnectOnboardingLink("AGENCY");
      if (res?.url) window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e?.message || "Impossible d'ouvrir Stripe Connect.");
    }
  };

  const handleWithdraw = async () => {
    const amountTnd = Number(String(withdrawAmount).replace(",", "."));
    if (!Number.isFinite(amountTnd) || amountTnd <= 0) return;

    const amountCents = Math.floor(amountTnd * 1000);
    const available = wallet?.availableBalance || 0;
    if (amountCents > available) {
      setError(`Solde insuffisant (max ${formatWalletMoney(available, wallet?.currency)}).`);
      return;
    }

    if (!connectStatus.connected) {
      setError("Configurez Stripe Connect (carte / compte) avant de retirer.");
      return;
    }

    setWithdrawLoading(true);
    setError("");
    try {
      await requestAdminWalletWithdrawal({
        amountCents,
        idempotencyKey: buildIdempotencyKey("admin-wd"),
      });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      await load();
    } catch (e) {
      setError(e?.message || "Échec de la demande de retrait.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const AmountCell = ({ value }) => (
    <MDTypography variant="button" fontWeight="bold">
      {value}
    </MDTypography>
  );
  AmountCell.propTypes = { value: PropTypes.string.isRequired };

  const TableAmountCell = ({ value }) => <AmountCell value={value} />;
  TableAmountCell.propTypes = { value: PropTypes.string.isRequired };

  const PresentielStatusCell = ({ value }) => (
    <MDBadge badgeContent={value} color="warning" variant="gradient" size="xs" />
  );
  PresentielStatusCell.propTypes = { value: PropTypes.string.isRequired };

  const txColumns = [
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "Type", accessor: "type", width: "14%" },
    { Header: "Pèlerin", accessor: "pilgrim", width: "16%" },
    { Header: "Agence / Guide", accessor: "party", width: "18%" },
    { Header: "Montant", accessor: "amount", Cell: TableAmountCell },
    { Header: "Date", accessor: "date", width: "12%" },
    { Header: "Statut", accessor: "status", width: "10%" },
  ];

  const presentielColumns = [
    { Header: "Réf.", accessor: "id", width: "10%" },
    { Header: "Payeur", accessor: "owner", width: "18%" },
    { Header: "Type", accessor: "ownerType", width: "10%" },
    { Header: "Pèlerin", accessor: "pilgrim", width: "16%" },
    { Header: "Pack / Guide", accessor: "pack", width: "18%" },
    {
      Header: "Commission 5%",
      accessor: "commission",
      Cell: TableAmountCell,
    },
    {
      Header: "Statut",
      accessor: "status",
      Cell: PresentielStatusCell,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={6} display="flex" justifyContent="center">
          <CircularProgress color="success" />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {error ? (
          <MDBox mb={2}>
            <MDTypography variant="button" color="error">
              {error}
            </MDTypography>
          </MDBox>
        ) : null}

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Solde disponible (plateforme)
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatWalletMoney(wallet?.availableBalance, wallet?.currency)}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  En attente : {formatWalletMoney(wallet?.pendingBalance, wallet?.currency)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Commissions reçues (en ligne)
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatWalletMoney(stats.totalCommissionReceived, "TND")}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="caption" color="text" display="block">
                  Commissions présentiel (à régler)
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {formatWalletMoney(presentiel.totalDueMillimes, "TND")}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} display="flex" flexDirection="column" gap={1}>
                <MDTypography variant="caption" color="text">
                  Stripe Connect
                  {connectStatus.last4 ? ` •••• ${connectStatus.last4}` : ""}
                </MDTypography>
                <MDButton variant="gradient" color="success" size="small" onClick={handleConnect}>
                  {connectStatus.connected ? "Mettre à jour" : "Configurer carte"}
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="dark"
                  size="small"
                  onClick={() => setWithdrawOpen(true)}
                  disabled={!wallet?.availableBalance}
                >
                  Retirer le solde
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium">
                    Transactions plateforme (5 % & flux)
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Commissions en ligne créditées sur le wallet Sabeel + mouvements.
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
                  table={{ columns: txColumns, rows: txRows }}
                  isSorted
                  entriesPerPage
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Procédure paiement présentiel → Sabeel
                </MDTypography>
                <List dense>
                  {(presentiel.paymentProcedure.length
                    ? presentiel.paymentProcedure
                    : overview?.paymentProcedure || []
                  ).map((step, idx) => (
                    <ListItem key={step} disableGutters>
                      <ListItemText
                        primary={`${idx + 1}. ${step}`}
                        primaryTypographyProps={{ variant: "button" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Commissions 5 % — réservations présentiel
                </MDTypography>
                <MDTypography variant="button" color="text" display="block" mb={1}>
                  À envoyer à Sabeel après encaissement sur place (agence / guide).
                </MDTypography>
              </MDBox>
              <MDBox pt={1}>
                <DataTable
                  table={{ columns: presentielColumns, rows: presentielRows }}
                  isSorted
                  entriesPerPage={{ defaultValue: 5 }}
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Retrait wallet plateforme</DialogTitle>
        <DialogContent>
          <MDTypography variant="caption" color="text" display="block" mb={2}>
            Disponible : {formatWalletMoney(wallet?.availableBalance, wallet?.currency)} — délai
            max. 48h (Stripe Connect).
          </MDTypography>
          <MDInput
            type="number"
            label="Montant (TND)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={() => setWithdrawOpen(false)}>
            Annuler
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={handleWithdraw}
            disabled={withdrawLoading}
          >
            {withdrawLoading ? "Envoi..." : "Confirmer"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminFinance;
