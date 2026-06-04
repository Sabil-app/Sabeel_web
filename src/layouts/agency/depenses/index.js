import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchAgencyReservations } from "api/reservationMessagingApi";
import {
  buildIdempotencyKey,
  createConnectOnboardingLink,
  fetchConnectStatus,
  fetchWalletMe,
  fetchWalletTransactions,
  formatWalletMoney,
  requestWalletWithdrawal,
} from "api/walletApi";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function AgencyDepenses() {
  const navigate = useNavigate();

  const [showAllDeposits, setShowAllDeposits] = useState(false);
  const [showAllLedger, setShowAllLedger] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [walletData, setWalletData] = useState(null);
  const [connectStatus, setConnectStatus] = useState({ connected: false, last4: null });
  const [pilgrimDeposits, setPilgrimDeposits] = useState([]);
  const [walletLedger, setWalletLedger] = useState([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [openTransfer, setOpenTransfer] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);

  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const [transferNote, setTransferNote] = useState("");

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfPreviewFilename, setPdfPreviewFilename] = useState("");

  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    method: "Carte Stripe Connect",
    accountRef: "",
  });

  const mapReservationToDeposit = (r) => {
    const mode = String(r.paymentMode || "").toLowerCase();
    const isOnline =
      mode === "online" ||
      String(r.paymentType || "")
        .toLowerCase()
        .includes("wallet");
    const advance = Number(r.advanceAmount || 0);
    const created = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "";
    let status = "à transférer";
    if (r.status === "accepted" && advance > 0) {
      status = isOnline ? "transféré" : "sur place (hors wallet)";
    }
    if (r.status === "pending") status = "en attente";

    return {
      id: r.id,
      pilgrimId: r.pilgrimUserId || r.id,
      pilgrimName: r.pilgrimName || "—",
      pack: r.packageName || "—",
      amount: advance,
      date: created,
      status,
      paymentType: isOnline ? "en_ligne" : "sur_place",
      rdvDate: r.reservationDate || null,
    };
  };

  const mapTxToLedger = (tx, walletId) => {
    const incoming = String(tx.toWalletId || "") === String(walletId || "");
    const amountTnd = Number(tx.amount || 0) / 1000;
    const typeLabel = String(tx.type || "").toUpperCase();
    let source = typeLabel;
    if (typeLabel.includes("EARNING")) source = "Versement réservation";
    if (typeLabel.includes("WITHDRAWAL")) source = "Retrait";
    if (typeLabel.includes("COMMISSION")) source = "Commission plateforme";

    return {
      id: tx.id,
      type: incoming ? "credit" : "debit",
      source,
      amount: amountTnd,
      date: tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : "",
      status: String(tx.status || "confirmé").toLowerCase(),
    };
  };

  const loadWalletData = useCallback(async () => {
    setLoadError("");
    try {
      const [meRes, txRes, reservations, connect] = await Promise.all([
        fetchWalletMe(),
        fetchWalletTransactions(100, 0),
        fetchAgencyReservations().catch(() => []),
        fetchConnectStatus().catch(() => ({ connected: false, last4: null })),
      ]);

      const wallet = meRes?.wallet || null;
      setWalletData(wallet);
      setConnectStatus({
        connected: Boolean(connect?.connected),
        last4: connect?.last4 || null,
      });

      const walletId = wallet?.id;
      const items = Array.isArray(txRes?.items) ? txRes.items : [];
      setWalletLedger(items.map((tx) => mapTxToLedger(tx, walletId)));

      const resList = Array.isArray(reservations) ? reservations : [];
      setPilgrimDeposits(
        resList.filter((r) => Number(r.advanceAmount || 0) > 0).map(mapReservationToDeposit)
      );
    } catch (e) {
      setLoadError(e?.message || "Impossible de charger le wallet.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadWalletData();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadWalletData]);

  const formatMoney = (value) => {
    if (walletData?.availableBalance != null && value === walletData.availableBalance / 1000) {
      return formatWalletMoney(walletData.availableBalance, walletData.currency);
    }
    return `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DT`;
  };

  const walletBalanceMillimes = walletData?.availableBalance || 0;
  const walletBalance = walletBalanceMillimes / 1000;

  // Nouveaux calculs pour les statistiques
  const totalAdvanceAmount = pilgrimDeposits.reduce((acc, d) => acc + d.amount, 0);
  const onlineAdvanceAmount = pilgrimDeposits
    .filter((d) => d.paymentType === "en_ligne")
    .reduce((acc, d) => acc + d.amount, 0);
  const onSiteAdvanceAmount = pilgrimDeposits
    .filter((d) => d.paymentType === "sur_place")
    .reduce((acc, d) => acc + d.amount, 0);

  const pendingDepositsCount = pilgrimDeposits.filter((d) => d.status === "à transférer").length;
  const pendingDepositsAmount = pilgrimDeposits
    .filter((d) => d.status === "à transférer")
    .reduce((acc, d) => acc + d.amount, 0);

  const totalReceivedAmount = pilgrimDeposits
    .filter((d) => d.status === "transféré")
    .reduce((acc, d) => acc + d.amount, 0);

  const handleOpenTransfer = (depositId) => {
    setSelectedDepositId(depositId);
    setTransferNote("");
    setOpenTransfer(true);
  };

  const handleCloseTransfer = () => {
    setOpenTransfer(false);
    setSelectedDepositId(null);
  };

  const handleConfirmTransfer = () => {
    handleCloseTransfer();
    setLoadError(
      "Les avances en ligne sont créditées automatiquement sur le wallet. Les paiements sur place sont hors wallet Stripe."
    );
  };

  const handleOpenWithdraw = () => {
    setWithdrawForm({ amount: "", method: "Virement bancaire", accountRef: "" });
    setOpenWithdraw(true);
  };

  const handleCloseWithdraw = () => setOpenWithdraw(false);

  const handleConnectStripe = async () => {
    try {
      const res = await createConnectOnboardingLink("AGENCY");
      if (res?.url) window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setLoadError(e?.message || "Impossible d'ouvrir Stripe Connect.");
    }
  };

  const handleConfirmWithdraw = async () => {
    const amountTnd = parseFloat(withdrawForm.amount);
    if (!Number.isFinite(amountTnd) || amountTnd <= 0) return;

    const amountCents = Math.floor(amountTnd * 1000);
    if (amountCents > walletBalanceMillimes) return;

    if (!connectStatus.connected) {
      setLoadError("Configurez Stripe Connect (carte) avant de retirer.");
      await handleConnectStripe();
      return;
    }

    setWithdrawLoading(true);
    setLoadError("");
    try {
      await requestWalletWithdrawal({
        amountCents,
        idempotencyKey: buildIdempotencyKey("ag-wd"),
      });
      handleCloseWithdraw();
      await loadWalletData();
    } catch (e) {
      setLoadError(e?.message || "Échec de la demande de retrait.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const AmountCell = ({ value }) => (
    <MDTypography variant="button" fontWeight="bold">
      {formatMoney(value)}
    </MDTypography>
  );
  AmountCell.propTypes = { value: PropTypes.number.isRequired };

  useEffect(() => {
    if (!pdfPreviewUrl) return undefined;

    return () => {
      URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfPreviewUrl]);

  const buildPilgrimPaymentPdf = (deposit) => {
    const doc = new jsPDF("p", "mm", "a4");
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const left = 14;
    const right = pageWidth - 14;
    const primaryGreen = { r: 27, g: 94, b: 32 };
    const lightGray = 245;

    const ref = `SB-${deposit.pilgrimId}-${today.replace(/-/g, "")}-${now
      .getTime()
      .toString()
      .slice(-6)}`;

    doc.setFillColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.rect(0, 0, pageWidth, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("SABEEL AGENCE", left, 12);
    doc.setFontSize(11);
    doc.text("Reçu de paiement (1ère avance)", left, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Référence: ${ref}`, right, 32, { align: "right" });
    doc.text(`Généré le: ${today} à ${time}`, right, 37, { align: "right" });

    doc.setDrawColor(220);
    doc.line(left, 41, right, 41);

    doc.setFontSize(12);
    doc.setTextColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.text("Informations pèlerin", left, 52);
    doc.setTextColor(0, 0, 0);

    doc.setFillColor(lightGray);
    doc.roundedRect(left, 56, right - left, 28, 3, 3, "F");
    doc.setFontSize(11);
    doc.text(`Nom: ${deposit.pilgrimName}`, left + 4, 64);
    doc.text(`Pack: ${deposit.pack}`, left + 4, 71);
    doc.text(`Identifiant: ${deposit.pilgrimId}`, left + 4, 78);

    doc.setFontSize(12);
    doc.setTextColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.text("Détails du paiement", left, 98);
    doc.setTextColor(0, 0, 0);

    doc.setFillColor(255);
    doc.setDrawColor(220);
    doc.roundedRect(left, 102, right - left, 34, 3, 3, "S");

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("TYPE", left + 4, 111);
    doc.text("MONTANT", left + 70, 111);
    doc.text("DATE", left + 120, 111);
    doc.text("STATUT", left + 150, 111);

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text("1ère avance", left + 4, 121);
    doc.text(formatMoney(deposit.amount), left + 70, 121);
    doc.text(deposit.date, left + 120, 121);
    doc.text(deposit.status, left + 150, 121);

    doc.setDrawColor(235);
    doc.line(left + 4, 114, right - 4, 114);

    const relatedLedger = walletLedger.filter(
      (tx) =>
        tx.type === "credit" &&
        typeof tx.source === "string" &&
        tx.source.includes(deposit.pilgrimName)
    );

    doc.setFontSize(12);
    doc.setTextColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.text("Trace wallet (transfert)", left, 156);
    doc.setTextColor(0, 0, 0);

    doc.setFillColor(lightGray);
    doc.roundedRect(left, 160, right - left, 32, 3, 3, "F");
    doc.setFontSize(10);
    if (!relatedLedger.length) {
      doc.text("Aucune entrée wallet associée à ce pèlerin.", left + 4, 170);
    } else {
      let y = 170;
      relatedLedger.slice(0, 3).forEach((tx) => {
        doc.text(`${tx.date}  |  ${formatMoney(tx.amount)}  |  ${tx.source}`, left + 4, y);
        y += 7;
      });
    }

    doc.setDrawColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.setLineWidth(0.4);
    doc.line(left, 208, right, 208);

    doc.setFontSize(12);
    doc.setTextColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.text("Signature électronique", left, 220);
    doc.setTextColor(0, 0, 0);

    doc.setDrawColor(220);
    doc.roundedRect(left, 224, right - left, 36, 3, 3, "S");

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(
      "Ce document est signé électroniquement et généré automatiquement par la plateforme Sabeel.",
      left + 4,
      233
    );
    doc.text(`Référence document: ${ref}`, left + 4, 241);
    doc.text(`Horodatage: ${today} ${time}`, left + 4, 248);

    doc.setTextColor(primaryGreen.r, primaryGreen.g, primaryGreen.b);
    doc.setFontSize(18);
    doc.text("Sabeel", right - 18, 250, { align: "right" });
    doc.setTextColor(120);
    doc.setFontSize(9);
    doc.text("Signature / Cachet", right - 14, 255, { align: "right" });

    doc.setTextColor(120);
    doc.setFontSize(8);
    doc.text("Document confidentiel - Ne pas modifier.", left, 287);
    doc.text(`© ${new Date().getFullYear()} Sabeel Agence`, right, 287, { align: "right" });

    const blob = doc.output("blob");
    const safeName = deposit.pilgrimName.replace(/\s+/g, "_");
    const filename = `Paiement_${safeName}_${today}.pdf`;

    return { blob, filename };
  };

  const handleOpenPdfPreview = (depositId) => {
    const deposit = pilgrimDeposits.find((d) => d.id === depositId);
    if (!deposit) return;

    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    const { blob, filename } = buildPilgrimPaymentPdf(deposit);
    const url = URL.createObjectURL(blob);

    setSelectedDepositId(depositId);
    setPdfPreviewFilename(filename);
    setPdfPreviewUrl(url);
    setOpenPdfPreview(true);
  };

  const handleClosePdfPreview = () => {
    setOpenPdfPreview(false);
    setPdfPreviewUrl("");
  };

  const handleDownloadPdf = () => {
    if (!pdfPreviewUrl) return;
    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = pdfPreviewFilename || "paiement.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactPilgrim = () => {
    navigate("/agency/messages");
  };

  const DepositStatusCell = ({ value }) => (
    <MDBadge
      badgeContent={value}
      color={value === "transféré" ? "success" : "warning"}
      variant="gradient"
      size="xs"
    />
  );
  DepositStatusCell.propTypes = { value: PropTypes.string.isRequired };

  const PaymentTypeCell = ({ value }) => (
    <MDBadge
      badgeContent={value === "en_ligne" ? "En ligne" : "Sur place"}
      color={value === "en_ligne" ? "info" : "warning"}
      variant="gradient"
      size="xs"
    />
  );
  PaymentTypeCell.propTypes = { value: PropTypes.string.isRequired };

  const LedgerTypeCell = ({ value }) => (
    <MDBadge
      badgeContent={value === "credit" ? "Entrée" : "Sortie"}
      color={value === "credit" ? "success" : "error"}
      variant="gradient"
      size="xs"
    />
  );
  LedgerTypeCell.propTypes = { value: PropTypes.string.isRequired };

  const LedgerStatusCell = ({ value }) => (
    <MDBadge badgeContent={value} color="success" variant="gradient" size="xs" />
  );
  LedgerStatusCell.propTypes = { value: PropTypes.string.isRequired };

  const RdvDateCell = ({ value }) => (
    <MDTypography variant="button">{value ? value : "N/A"}</MDTypography>
  );
  RdvDateCell.propTypes = { value: PropTypes.string };

  const TransferActionCell = ({ row }) => {
    const isTransferred = row.original.status === "transféré";
    return (
      <MDBox display="flex" gap={1} justifyContent="flex-end">
        <MDButton
          variant="text"
          color="dark"
          size="small"
          onClick={() => handleOpenPdfPreview(row.original.id)}
        >
          <Icon fontSize="small">picture_as_pdf</Icon>
          &nbsp;PDF
        </MDButton>
        <MDButton variant="outlined" color="success" size="small" disabled={true}>
          {isTransferred ? "Transféré" : "Transfert auto"}
        </MDButton>
      </MDBox>
    );
  };

  TransferActionCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
      }),
    }).isRequired,
  };

  const depositColumns = [
    { Header: "Pèlerin", accessor: "pilgrimName", width: "20%" },
    { Header: "Pack", accessor: "pack", width: "18%" },
    { Header: "1ère avance", accessor: "amount", Cell: AmountCell, width: "12%" },
    { Header: "Type Paiement", accessor: "paymentType", Cell: PaymentTypeCell, width: "12%" },
    { Header: "Date RDV", accessor: "rdvDate", Cell: RdvDateCell, width: "12%" },
    { Header: "Date", accessor: "date", width: "12%" },
    { Header: "Statut", accessor: "status", Cell: DepositStatusCell, width: "10%" },
  ];

  const ledgerColumns = [
    { Header: "Type", accessor: "type", Cell: LedgerTypeCell, width: "12%" },
    { Header: "Source", accessor: "source", width: "45%" },
    { Header: "Montant", accessor: "amount", Cell: AmountCell, width: "15%" },
    { Header: "Date", accessor: "date", width: "15%" },
    { Header: "Statut", accessor: "status", Cell: LedgerStatusCell, width: "13%" },
  ];

  const depositsToShow = showAllDeposits ? pilgrimDeposits : pilgrimDeposits.slice(0, 4);
  const ledgerToShow = showAllLedger ? walletLedger : walletLedger.slice(0, 4);

  const selectedDeposit = pilgrimDeposits.find((d) => d.id === selectedDepositId);

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
        {loadError ? (
          <MDBox mb={2}>
            <MDTypography variant="button" color="error">
              {loadError}
            </MDTypography>
          </MDBox>
        ) : null}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              Wallet & Avances
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Suivez les premières avances des pèlerins, le solde wallet et les retraits.
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1.5}>
            <MDButton variant="outlined" color="info" onClick={handleConnectStripe}>
              <Icon sx={{ fontWeight: "bold" }}>credit_card</Icon>
              &nbsp;
              {connectStatus.connected
                ? `Carte •••• ${connectStatus.last4 || "—"}`
                : "Configurer Stripe"}
            </MDButton>
            <MDButton variant="outlined" color="dark" onClick={handleOpenWithdraw}>
              <Icon sx={{ fontWeight: "bold" }}>south</Icon>
              &nbsp;Retrait
            </MDButton>
          </MDBox>
        </MDBox>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="account_balance_wallet"
              title="Solde Wallet"
              count={formatWalletMoney(walletBalanceMillimes, walletData?.currency)}
              percentage={{ color: "success", amount: "", label: "Disponible" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="info"
              icon="savings"
              title="Total Avance"
              count={formatMoney(totalAdvanceAmount)}
              percentage={{ color: "info", amount: "", label: "Tous les pèlerins" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="primary"
              icon="credit_card"
              title="Avance En Ligne"
              count={formatMoney(onlineAdvanceAmount)}
              percentage={{ color: "info", amount: "", label: "Paiements en ligne" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="warning"
              icon="location_on"
              title="Avance Sur Site"
              count={formatMoney(onSiteAdvanceAmount)}
              percentage={{ color: "warning", amount: "", label: "Paiements sur place" }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3}>
                <MDBox
                  px={3}
                  pb={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="medium">
                      Avances (1ère avance par pèlerin)
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Les paiements sont automatiquement transférés au wallet.
                    </MDTypography>
                  </MDBox>
                  <MDBadge
                    badgeContent={`${pilgrimDeposits.length} pèlerins`}
                    color="success"
                    variant="gradient"
                    size="sm"
                  />
                </MDBox>
                <MDBox px={3} pb={2}>
                  <MDTypography variant="caption" color="text" mb={1}>
                    Note: Les paiements en ligne sont comptabilisés immédiatement dans le Wallet.
                    Les paiements sur place seront ajoutés au Wallet à la date RDV.
                  </MDTypography>
                </MDBox>
                <DataTable
                  table={{ columns: depositColumns, rows: depositsToShow }}
                  isSorted={true}
                  entriesPerPage={true}
                  showTotalEntries={true}
                  noEndBorder
                />
                {pilgrimDeposits.length > 4 && (
                  <MDBox px={3} pb={3} pt={1} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="text"
                      color="info"
                      onClick={() => setShowAllDeposits((prev) => !prev)}
                    >
                      {showAllDeposits ? "Voir moins" : "Voir plus"}
                    </MDButton>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3}>
                <MDBox px={3} pb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Historique Wallet
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Entrées (avances) et sorties (withdraw).
                  </MDTypography>
                </MDBox>
                <Divider />
                <MDBox px={3} pt={2}>
                  <DataTable
                    table={{ columns: ledgerColumns, rows: ledgerToShow }}
                    isSorted={true}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
                {walletLedger.length > 4 && (
                  <MDBox px={3} pb={3} pt={1} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="text"
                      color="info"
                      onClick={() => setShowAllLedger((prev) => !prev)}
                    >
                      {showAllLedger ? "Voir moins" : "Voir plus"}
                    </MDButton>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openTransfer} onClose={handleCloseTransfer} fullWidth maxWidth="sm">
        <DialogTitle>Transférer une avance</DialogTitle>
        <DialogContent>
          <MDBox pt={2} display="flex" flexDirection="column" gap={2.5}>
            <MDBox>
              <MDTypography variant="button" fontWeight="medium">
                Pèlerin
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {selectedDeposit ? selectedDeposit.pilgrimName : "-"}
              </MDTypography>
            </MDBox>
            <MDBox>
              <MDTypography variant="button" fontWeight="medium">
                Montant
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold">
                {selectedDeposit ? formatMoney(selectedDeposit.amount) : "-"}
              </MDTypography>
            </MDBox>
            <MDInput
              label="Note (optionnel)"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              fullWidth
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseTransfer} color="dark">
            Annuler
          </MDButton>
          <MDButton onClick={handleConfirmTransfer} color="success" variant="gradient">
            Confirmer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openWithdraw} onClose={handleCloseWithdraw} fullWidth maxWidth="sm">
        <DialogTitle>Withdraw (Retrait)</DialogTitle>
        <DialogContent>
          <MDBox pt={2} display="flex" flexDirection="column" gap={3}>
            <MDBox
              p={2}
              borderRadius="lg"
              sx={{
                backgroundColor: "rgba(46, 125, 50, 0.08)",
                border: "1px solid rgba(46, 125, 50, 0.15)",
              }}
            >
              <MDTypography variant="caption" color="text">
                Solde disponible
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold">
                {formatMoney(walletBalance)}
              </MDTypography>
            </MDBox>

            <MDInput
              label="Montant (DT)"
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              fullWidth
              error={
                withdrawForm.amount !== "" &&
                (parseFloat(withdrawForm.amount) <= 0 ||
                  parseFloat(withdrawForm.amount) > walletBalance)
              }
            />
            <MDTypography variant="caption" color="text">
              Retrait vers votre carte / compte Stripe Connect (délai max. 48h).
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseWithdraw} color="dark">
            Annuler
          </MDButton>
          <MDButton
            onClick={handleConfirmWithdraw}
            color="success"
            variant="gradient"
            disabled={
              withdrawLoading ||
              !withdrawForm.amount ||
              parseFloat(withdrawForm.amount) <= 0 ||
              parseFloat(withdrawForm.amount) > walletBalance
            }
          >
            {withdrawLoading ? "Envoi..." : "Valider"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openPdfPreview} onClose={handleClosePdfPreview} fullWidth maxWidth="md">
        <DialogTitle>Aperçu PDF - Paiement pèlerin</DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <MDBox
              p={1}
              borderRadius="lg"
              sx={{
                border: "1px solid rgba(0,0,0,0.08)",
                height: { xs: 420, md: 560 },
                overflow: "hidden",
              }}
            >
              {pdfPreviewUrl ? (
                <iframe
                  title="pdf-preview"
                  src={pdfPreviewUrl}
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : null}
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClosePdfPreview} color="dark">
            Fermer
          </MDButton>
          <MDButton onClick={handleContactPilgrim} variant="outlined" color="dark">
            Contacter
          </MDButton>
          <MDButton onClick={handleDownloadPdf} color="success" variant="gradient">
            Télécharger
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default AgencyDepenses;
