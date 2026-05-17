import { useState, useEffect } from "react";
import { useMaterialUIController, setDarkMode } from "context";
import {
  getCurrentUser,
  generate2FA,
  enable2FA,
  disable2FA,
  fetchCurrentProfile,
  changePasswordAdmin,
  sendComplaint,
} from "auth/adminAgenceAuth";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

function Settings() {
  const [user, setUser] = useState(getCurrentUser());
  const [twoFactor, setTwoFactor] = useState(user?.isTwoFactorEnabled || false);
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isContactingSupport, setIsContactingSupport] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  useEffect(() => {
    fetchCurrentProfile().then((updatedUser) => {
      setUser(updatedUser);
      setTwoFactor(updatedUser.isTwoFactorEnabled);
    });
  }, []);

  const handleToggle2FA = async () => {
    if (twoFactor) {
      if (window.confirm("Êtes-vous sûr de vouloir désactiver l'authentification 2FA ?")) {
        try {
          await disable2FA();
          setTwoFactor(false);
          setQrCode("");
        } catch (error) {
          alert(error.message);
        }
      }
    } else {
      // Start activation process
      try {
        setIsGenerating(true);
        const { qrCodeDataUrl } = await generate2FA();
        setQrCode(qrCodeDataUrl);
      } catch (error) {
        alert(error.message);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) return;
    try {
      setIsActivating(true);
      await enable2FA(verificationCode);
      setTwoFactor(true);
      setQrCode("");
      setVerificationCode("");
      alert("2FA activé avec succès !");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActivating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs de mot de passe.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await changePasswordAdmin(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Mot de passe mis à jour avec succès !");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendMessage = async () => {
    if (!supportMessage) return;
    try {
      setIsContactingSupport(true);
      await sendComplaint({
        source: "Sabeel Agence",
        sourceType: "agency_platform",
        target: "Plateforme agence",
        category: "Support FAQ",
        sender: `Agence - ${user?.agencyName || user?.fullName}`,
        message: supportMessage,
      });
      setSupportMessage("");
      setIsContactingSupport(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      alert("Erreur lors de l'envoi du message.");
      setIsContactingSupport(false);
    }
  };

  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox display="flex" alignItems="center" gap={2} sx={{ position: "relative", zIndex: 1 }}>
          <MDBox className="agency-icon-chip">
            <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>settings</Icon>
          </MDBox>
          <MDBox>
            <MDTypography className="agency-hero__title" variant="h5" color="white">
              Paramètres
            </MDTypography>
            <MDTypography className="agency-hero__subtitle" variant="button" color="white">
              Personnalisez votre espace et gérez vos préférences.
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <MDBox mb={3}>
              <Card>
                <MDBox p={3} display="flex" alignItems="center" justifyContent="space-between">
                  <MDBox>
                    <MDTypography variant="h5">Apparence</MDTypography>
                    <MDTypography variant="button" color="text">
                      Basculer entre mode clair et sombre
                    </MDTypography>
                  </MDBox>
                  <Switch checked={darkMode} onChange={() => setDarkMode(dispatch, !darkMode)} />
                </MDBox>
              </Card>
            </MDBox>
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5">Sécurité & Mot de Passe</MDTypography>
                </MDBox>
                <MDBox pb={3} px={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MDInput
                        label="Ancien mot de passe"
                        type="password"
                        fullWidth
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        label="Nouveau mot de passe"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <MDBox mt={3} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="dark"
                      size="small"
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Mise à jour..." : "Mettre à jour"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </MDBox>

            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5">Authentification à deux facteurs (2FA)</MDTypography>
                  <MDTypography variant="button" color="text" fontWeight="regular">
                    Ajoutez une couche de sécurité supplémentaire à votre compte.
                  </MDTypography>
                </MDBox>
                <MDBox pb={3} px={3} display="flex" flexDirection="column">
                  <MDBox display="flex" alignItems="center" justifyContent="space-between">
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="medium">
                        Activer 2FA (Authenticator App)
                      </MDTypography>
                      <MDTypography variant="button" color="text" fontWeight="regular">
                        Sécurisez votre compte avec Google Authenticator ou Authy.
                      </MDTypography>
                    </MDBox>
                    <Switch
                      checked={twoFactor}
                      onChange={handleToggle2FA}
                      disabled={isGenerating}
                    />
                  </MDBox>

                  {qrCode && !twoFactor && (
                    <MDBox mt={3} display="flex" flexDirection="column" alignItems="center">
                      <MDTypography variant="button" color="text" fontWeight="bold" mb={2}>
                        Scannez ce code QR avec votre application d&apos;authentification :
                      </MDTypography>
                      <MDBox
                        component="img"
                        src={qrCode}
                        alt="QR Code"
                        width="150px"
                        height="150px"
                        sx={{ border: "1px solid #ddd", borderRadius: "8px", p: 1 }}
                      />
                      <MDBox mt={3} width="100%" maxWidth="200px">
                        <MDInput
                          label="Code de vérification"
                          fullWidth
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <MDBox mt={2}>
                          <MDButton
                            variant="gradient"
                            color="success"
                            fullWidth
                            size="small"
                            onClick={handleVerifyAndEnable}
                            disabled={isActivating || !verificationCode}
                          >
                            {isActivating ? "Activation..." : "Vérifier & Activer"}
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  )}

                  {twoFactor && (
                    <MDBox mt={2}>
                      <MDTypography variant="button" color="success" fontWeight="bold">
                        <Icon sx={{ verticalAlign: "middle", mr: 1 }}>verified_user</Icon>
                        L&apos;authentification 2FA est activée sur votre compte.
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </MDBox>

            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5">Confidentialité</MDTypography>
                </MDBox>
                <MDBox pb={3} px={3}>
                  <MDTypography variant="body2" color="text">
                    Gérez la visibilité de vos données et vos préférences de partage avec
                    l&apos;administration Sabeel.
                  </MDTypography>
                  <MDBox
                    mt={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      cursor: "pointer",
                      p: 1.5,
                      borderRadius: "lg",
                      "&:hover": { bgcolor: "grey-100" },
                      border: ({ borders: { borderWidth, borderColor } }) =>
                        `${borderWidth[1]} solid ${borderColor}`,
                    }}
                  >
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="medium">
                        Politique de Confidentialité
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        Partage d&apos;informations avec Sabeel Admin
                      </MDTypography>
                    </MDBox>
                    <Icon>chevron_right</Icon>
                  </MDBox>
                </MDBox>
              </Card>
            </MDBox>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: "100%" }}>
              <MDBox p={3}>
                <MDTypography variant="h5">FAQ & Aide</MDTypography>
              </MDBox>
              <MDBox pb={3} px={3}>
                {[
                  { q: "Comment modifier mon contrat ?", a: "Contactez le support administratif." },
                  { q: "Délai de validation du dossier", a: "Généralement 48 heures ouvrables." },
                  { q: "Ajouter un nouveau pack Umrah", a: "Allez dans la section 'Packs Umrah'." },
                ].map((item, index) => (
                  <MDBox key={index} mb={2}>
                    <MDTypography variant="h6" fontWeight="bold">
                      {item.q}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      {item.a}
                    </MDTypography>
                    {index < 2 && <Divider sx={{ my: 1 }} />}
                  </MDBox>
                ))}
                <MDBox mt={3}>
                  {isContactingSupport ? (
                    <MDBox>
                      <MDInput
                        label="Votre message au support"
                        multiline
                        rows={4}
                        fullWidth
                        sx={{ mb: 2 }}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                      />
                      <MDBox display="flex" gap={1}>
                        <MDButton
                          variant="gradient"
                          color="success"
                          size="small"
                          fullWidth
                          onClick={handleSendMessage}
                          disabled={!supportMessage || isContactingSupport}
                        >
                          {isContactingSupport ? "Envoi..." : "Envoyer"}
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          color="dark"
                          size="small"
                          onClick={() => setIsContactingSupport(false)}
                        >
                          X
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  ) : (
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      onClick={() => setIsContactingSupport(true)}
                    >
                      Contacter le support
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        PaperProps={{
          sx: { borderRadius: "15px", padding: "20px", textAlign: "center" },
        }}
      >
        <DialogContent>
          <MDBox display="flex" flexDirection="column" alignItems="center">
            <MDBox
              width="60px"
              height="60px"
              bgColor="success"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
              shadow="lg"
            >
              <Icon sx={{ fontSize: "35px !important", color: "white" }}>check</Icon>
            </MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={1}>
              Message Envoyé !
            </MDTypography>
            <MDTypography variant="button" color="text">
              L&apos;équipe support de Sabeel a bien reçu votre demande et vous répondra très
              prochainement.
            </MDTypography>
          </MDBox>
        </DialogContent>
      </Dialog>
    </AgencyPageShell>
  );
}

export default Settings;
