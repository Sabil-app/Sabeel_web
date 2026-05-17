import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Grid from "@mui/material/Grid";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";
import Header from "layouts/agency/profile/components/Header";
import {
  clearAuth,
  fetchCurrentProfile,
  fetchAgencyGuides,
  getCurrentUser,
  submitAgencyProfileCompletion,
  uploadMyCoverImage,
  uploadMyProfileImage,
} from "auth/adminAgenceAuth";

function AgencyProfile() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [agencyType, setAgencyType] = useState("A");
  const [contractDuration, setContractDuration] = useState(12); // months
  const [signatureMethod, setSignatureMethod] = useState("draw");
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadedDocFiles, setUploadedDocFiles] = useState({});
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [agencyStatus, setAgencyStatus] = useState("pending");
  const [guides, setGuides] = useState([]);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureUploadRef = useRef(null);
  const [agencyName, setAgencyName] = useState("Sabeel Voyages");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");
  const [responsibleName, setResponsibleName] = useState("Mohamed Ben Ali");
  const [responsibleTitle, setResponsibleTitle] = useState("Directeur Général");
  const [agencyCode, setAgencyCode] = useState("");
  const [contractFileUrl, setContractFileUrl] = useState("");
  const [contractFileName, setContractFileName] = useState("");
  const [contractExpired, setContractExpired] = useState(false);

  const steps = ["Responsable", "Documents", "Validation & Contrat"];

  const [signatureImage, setSignatureImage] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureFileUrl, setSignatureFileUrl] = useState("");

  // Contract Dates
  const [dates, setDates] = useState({ start: "", end: "" });

  useEffect(() => {
    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + Number(contractDuration));

    const format = (d) =>
      `${d.toLocaleDateString()} à ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    setDates({
      start: format(today),
      end: format(expiry),
    });
  }, [contractDuration]);

  const applyProfileData = (user) => {
    setAgencyName(user.agencyName || user.fullName || "Sabeel Voyages");
    setAgencyCode(user.agencyCode || "");
    setResponsibleName(user.responsibleName || user.fullName || "Mohamed Ben Ali");
    setResponsibleEmail(user.email || "");
    setResponsiblePhone(user.phoneNumber || "");
    setAgencyType(user.agencyType || "A");
    setResponsibleTitle(user.responsibleTitle || "Directeur Général");
    setContractDuration(user.contractDuration || 12);
    setIsFinalized(Boolean(user.profileCompletionSubmitted));
    setAgencyStatus(user.status || "pending");
    setContractFileUrl(user.contractFileUrl || "");
    setContractFileName(user.contractFileName || "");
    setSignatureFileUrl(user.signatureFileUrl || "");
    setContractExpired(Boolean(user.contractExpired));

    setProfileImage(user.profileImageUrl || "");
    setCoverImage(user.coverImageUrl || "");

    if (user.contractStartDate || user.contractEndDate) {
      setDates({
        start: user.contractStartDate ? new Date(user.contractStartDate).toLocaleString() : "",
        end: user.contractEndDate ? new Date(user.contractEndDate).toLocaleString() : "",
      });
    }

    if (Array.isArray(user.agencyDocuments) && user.agencyDocuments.length) {
      const persistedDocs = user.agencyDocuments.reduce((acc, document) => {
        acc[document.label] = document.fileName || document.label;
        return acc;
      }, {});
      setUploadedDocs(persistedDocs);
    }
  };

  const getVerificationStatusLabel = () => {
    if (agencyStatus === "active") return "Dossier validé";
    if (agencyStatus === "refused") return "Dossier refusé";
    if (isFinalized) return "Dossier en cours de vérification";
    return "Profil incomplet";
  };

  const canSubmitProfile = () => {
    return (
      responsibleName.trim() && responsibleTitle.trim() && Object.keys(uploadedDocFiles).length >= 2
    );
  };

  const handleUploadClick = (doc) => {
    setCurrentDoc(doc);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && currentDoc) {
      setUploadedDocs((prev) => ({ ...prev, [currentDoc]: file.name }));
      setUploadedDocFiles((prev) => ({ ...prev, [currentDoc]: file }));
    }
  };

  // Canvas Drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1b5e20";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsSigned(true);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImage(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setSignatureImage(null);
    setSignatureFile(null);
  };

  const buildContractPdfBlob = async () => {
    const element = document.getElementById("printable-contract");
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    return pdf.output("blob");
  };

  const downloadContract = async () => {
    try {
      const pdfBlob = await buildContractPdfBlob();
      if (!pdfBlob) return;

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Contrat_Sabeel_${responsibleName}.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const [showContractPreview, setShowContractPreview] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const isSubmissionLocked = isFinalized && agencyStatus !== "refused";

  useEffect(() => {
    const storedUser = getCurrentUser();

    if (storedUser) {
      applyProfileData(storedUser);
    }

    fetchCurrentProfile()
      .then((user) => {
        applyProfileData(user);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        // Don't clear auth immediately, just log the error
        // User can still use cached data from storedUser
      });

    // Fetch agency guides
    fetchAgencyGuides()
      .then((guidesData) => {
        setGuides(guidesData);
      })
      .catch((err) => {
        console.error("Failed to fetch guides:", err);
      });
  }, [navigate]);

  const dataUrlToFile = async (dataUrl, fileName) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || "image/png" });
  };

  const handleFinalize = async () => {
    if (!canSubmitProfile()) {
      setShowRequirementsModal(true);
      return;
    }

    try {
      setSubmitError("");
      setIsSubmittingProfile(true);

      const documents = Object.entries(uploadedDocFiles).map(([, file]) => file);
      const documentLabels = Object.keys(uploadedDocFiles);

      const contractBlob = await buildContractPdfBlob();
      if (!contractBlob) {
        throw new Error("Impossible de générer le contrat");
      }

      const contractFile = new File([contractBlob], `contrat-${agencyName}.pdf`, {
        type: "application/pdf",
      });

      await submitAgencyProfileCompletion({
        agencyType,
        responsibleName,
        responsibleTitle,
        contractDuration,
        documentLabels,
        documents,
        contractFile,
        contractFileName: "contract",
        submissionStatus: "pending",
      });

      setIsFinalized(true);
      setAgencyStatus("pending");
      setShowSuccessModal(true);
    } catch (error) {
      setSubmitError(error.message || "Impossible de finaliser l'inscription");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  function ContractContent({ isPrint }) {
    return (
      <MDBox
        bgColor="white"
        p={isPrint ? 10 : 5}
        sx={{
          minHeight: isPrint ? "1100px" : "800px",
          width: isPrint ? "800px" : "100%",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        <MDBox textAlign="center" mb={4} pb={3} sx={{ borderBottom: "2px solid #2e7d32" }}>
          <MDTypography variant="h3" fontWeight="bold" color="success">
            Contrat de Partenariat Digital
          </MDTypography>
          <MDTypography variant="h6" color="text">
            Entre la plateforme Sabeel et l’Agence Umrah
          </MDTypography>
        </MDBox>

        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="bold" mb={1} textTransform="uppercase">
            1. Parties du contrat
          </MDTypography>
          <MDTypography variant="body2" color="text">
            <strong>Sabeel</strong> : Plateforme digitale spécialisée dans la gestion et
            l’organisation des services liés à la Omra.
            <br />
            <strong>ET</strong>
            <br />
            <strong>L’Agence</strong> : Nom : <strong>{agencyName}</strong>
            <br />
            Représentée par : <strong>{responsibleName}</strong>
            <br />
            Fonction : <strong>{responsibleTitle}</strong>
          </MDTypography>
        </MDBox>

        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="bold" mb={1} textTransform="uppercase">
            2. Objet du contrat
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Le présent contrat a pour objet de définir les conditions de collaboration entre Sabeel
            et l’Agence pour :
            <ul>
              <li>La gestion des pèlerins</li>
              <li>La publication et gestion des packs Umrah</li>
              <li>La communication avec les clients via la plateforme</li>
              <li>L’utilisation des services digitaux de Sabeel</li>
            </ul>
          </MDTypography>
        </MDBox>

        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="bold" mb={1} textTransform="uppercase">
            3. Obligations de l’Agence
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.6 }}>
            L’Agence s’engage à fournir des informations exactes, respecter les réglementations
            liées à la Omra, garantir la qualité des services (hébergement, transport) et maintenir
            la confidentialité des données.
          </MDTypography>
        </MDBox>

        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="bold" mb={1} textTransform="uppercase">
            7. Durée du contrat
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Le contrat est valable pour une durée de <strong>{contractDuration} mois</strong>.
            <br />
            Date de début : <strong>{dates.start}</strong>
            <br />
            Date d&apos;expiration : <strong>{dates.end}</strong>
          </MDTypography>
        </MDBox>

        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="bold" mb={1} textTransform="uppercase">
            10. Signature électronique
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Ce contrat est validé via signature numérique sécurisée sur la plateforme Sabeel.
          </MDTypography>
        </MDBox>

        <MDBox mt={10} display="flex" justifyContent="space-between" alignItems="flex-end">
          <MDBox textAlign="center" sx={{ borderTop: "1px solid #ccc", minWidth: "200px", pt: 1 }}>
            <MDTypography variant="button" fontWeight="bold">
              Signature Agence
            </MDTypography>
            <MDBox
              mt={1}
              p={1}
              bgcolor="#f0f2f5"
              borderRadius="md"
              height={80}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="Signature"
                  style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
              ) : (
                <MDTypography variant="caption" color="text">
                  [En attente]
                </MDTypography>
              )}
            </MDBox>
            <MDTypography variant="caption" color="success" fontWeight="bold">
              {isSigned ? `Signé par ${responsibleName}` : ""}
            </MDTypography>
          </MDBox>
          <MDBox textAlign="center" sx={{ borderTop: "1px solid #ccc", minWidth: "200px", pt: 1 }}>
            <MDTypography variant="button" fontWeight="bold">
              Validation Sabeel
            </MDTypography>
            <MDBox mt={1}>
              <Icon sx={{ color: "success.main", fontSize: "40px !important" }}>verified</Icon>
            </MDBox>
          </MDBox>
        </MDBox>

        <MDBox mt={5} textAlign="center">
          <MDTypography variant="caption" color="text">
            Document certifié conforme - Sabeel Management Platform
          </MDTypography>
        </MDBox>
      </MDBox>
    );
  }

  ContractContent.propTypes = {
    isPrint: PropTypes.bool,
  };

  ContractContent.defaultProps = {
    isPrint: false,
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Nom du responsable"
                fullWidth
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                disabled={isSubmissionLocked}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Fonction / Poste"
                fullWidth
                value={responsibleTitle}
                onChange={(e) => setResponsibleTitle(e.target.value)}
                disabled={isSubmissionLocked}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {["RNE", "Patente", "Agreement", "Numéro de contrat"].map((doc) => (
              <Grid item xs={12} md={6} key={doc}>
                <MDBox display="flex" flexDirection="column">
                  <MDTypography variant="button" fontWeight="medium" mb={1}>
                    {doc}
                  </MDTypography>
                  <MDButton
                    variant="outlined"
                    color="success"
                    size="small"
                    fullWidth
                    onClick={() => handleUploadClick(doc)}
                    disabled={isSubmissionLocked}
                  >
                    <Icon sx={{ mr: 1 }}>{uploadedDocs[doc] ? "check_circle" : "upload_file"}</Icon>
                    {uploadedDocs[doc] ? uploadedDocs[doc] : `Upload ${doc}`}
                  </MDButton>
                  {uploadedDocs[doc] && (
                    <MDTypography variant="caption" color="success" mt={0.75}>
                      Document soumis : {uploadedDocs[doc]}
                    </MDTypography>
                  )}
                </MDBox>
              </Grid>
            ))}
          </Grid>
        );
      case 2:
        return (
          <MDBox>
            {/* Real content for screenshot, hidden from view but present in DOM */}
            <div id="printable-contract" style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <ContractContent isPrint />
            </div>

            <MDBox
              bgColor="grey-100"
              borderRadius="lg"
              p={3}
              mb={3}
              sx={{
                border: ({ borders: { borderWidth, borderColor } }) =>
                  `${borderWidth[1]} solid ${borderColor}`,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="h6" fontWeight="bold" color="success">
                  Détails & Aperçu du Contrat
                </MDTypography>
                <MDButton
                  variant="text"
                  color="dark"
                  size="small"
                  onClick={() => setShowContractPreview(true)}
                >
                  <Icon sx={{ mr: 1 }}>visibility</Icon> Aperçu Document
                </MDButton>
              </MDBox>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="caption" fontWeight="bold">
                    Durée de l&apos;engagement
                  </MDTypography>
                  <Select
                    value={contractDuration}
                    onChange={(e) => setContractDuration(e.target.value)}
                    fullWidth
                    sx={{ height: "40px", mt: 1 }}
                    disabled={isSubmissionLocked}
                  >
                    <MenuItem value={6}>6 Mois</MenuItem>
                    <MenuItem value={12}>1 An (Recommandé)</MenuItem>
                    <MenuItem value={24}>2 Ans</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mt={1}>
                    <MDTypography variant="caption" color="text" display="block">
                      Début : <strong>{dates.start}</strong>
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Fin : <strong>{dates.end}</strong>
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>

              {(!isSubmissionLocked || !contractExpired) && (
                <>
                  <MDTypography variant="button" fontWeight="bold" mb={1} display="block">
                    Mode de signature
                  </MDTypography>
                  <RadioGroup
                    row
                    value={signatureMethod}
                    onChange={(e) => setSignatureMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="draw"
                      control={<Radio />}
                      label="Dessiner Signature"
                      sx={{ "& .Mui-checked": { color: "#2e7d32 !important" } }}
                    />
                    <FormControlLabel
                      value="upload"
                      control={<Radio />}
                      label="Uploader Image Signature"
                      sx={{ "& .Mui-checked": { color: "#2e7d32 !important" } }}
                    />
                  </RadioGroup>

                  {!isSubmissionLocked && signatureMethod === "draw" ? (
                    <MDBox
                      mt={1}
                      p={1}
                      bgColor="white"
                      borderRadius="md"
                      textAlign="center"
                      sx={{
                        border: "1px dashed #2e7d32",
                        position: "relative",
                        cursor: "crosshair",
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        style={{ width: "100%", height: "100px" }}
                      />
                      <MDButton
                        variant="text"
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 0, right: 0 }}
                        onClick={clearSignature}
                      >
                        Effacer
                      </MDButton>
                    </MDBox>
                  ) : !isSubmissionLocked ? (
                    <MDBox mt={1}>
                      <input
                        type="file"
                        hidden
                        ref={signatureUploadRef}
                        onChange={handleSignatureUpload}
                      />
                      <MDButton
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={() => signatureUploadRef.current.click()}
                      >
                        <Icon sx={{ mr: 1 }}>upload</Icon>
                        {uploadedDocs.signature
                          ? uploadedDocs.signature
                          : "Uploader votre signature"}
                      </MDButton>
                    </MDBox>
                  ) : null}

                  {isSubmissionLocked && !contractExpired && (
                    <MDBox mt={2}>
                      <MDTypography variant="caption" color="success" display="block">
                        Signature enregistrée et conservée jusqu&apos;à la fin du contrat.
                      </MDTypography>
                    </MDBox>
                  )}
                </>
              )}

              <MDBox mt={3} display="flex" justifyContent="center">
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={downloadContract}
                  disabled={!isSigned}
                >
                  <Icon sx={{ mr: 1 }}>download</Icon> Télécharger le Contrat (PDF)
                </MDButton>
              </MDBox>
              {contractFileUrl && !contractExpired && (
                <MDBox mt={2} textAlign="center">
                  <MDTypography variant="caption" color="success" display="block">
                    Contrat disponible : {contractFileName || "Contrat signé"}
                  </MDTypography>
                  <MDButton
                    variant="text"
                    color="success"
                    size="small"
                    component="a"
                    href={contractFileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir le contrat archivé
                  </MDButton>
                </MDBox>
              )}
              {contractExpired && (
                <MDBox mt={2}>
                  <MDTypography variant="caption" color="warning" display="block">
                    Le contrat est expiré. Les pièces archivées ne sont plus affichées dans ce
                    module.
                  </MDTypography>
                </MDBox>
              )}
              {submitError && (
                <MDBox mt={2}>
                  <MDTypography variant="caption" color="error">
                    {submitError}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
            {!isSubmissionLocked && (
              <MDInput label="Nom du signataire" defaultValue={responsibleName} fullWidth />
            )}
          </MDBox>
        );
      default:
        return null;
    }
  };

  return (
    <AgencyPageShell contentPy={0}>
      <MDBox mb={2} />
      <Header
        agencyName={agencyName}
        onAgencyNameChange={setAgencyName}
        profileImage={profileImage}
        onProfileImageChange={setProfileImage}
        onProfileImageUpload={async (file) => {
          const updatedUser = await uploadMyProfileImage(file);
          applyProfileData(updatedUser);
        }}
        coverImage={coverImage}
        onCoverImageChange={setCoverImage}
        onCoverImageUpload={async (file) => {
          const updatedUser = await uploadMyCoverImage(file);
          applyProfileData(updatedUser);
        }}
      >
        <MDBox mt={5} mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDBox
                bgColor="white"
                shadow="sm"
                borderRadius="lg"
                p={3}
                sx={{
                  height: "100%",
                  border: ({ borders: { borderWidth, borderColor } }) =>
                    `${borderWidth[1]} solid ${borderColor}`,
                }}
              >
                <MDTypography variant="h6" fontWeight="bold" mb={1} color="dark">
                  Type de structure
                </MDTypography>
                <MDTypography variant="button" color="text" mb={3} display="block">
                  Classification de votre agence (Type A ou B).
                </MDTypography>
                <Select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  fullWidth
                  sx={{
                    height: "45px",
                    bgcolor: "white",
                    "& .MuiSelect-select": { color: "dark.main" },
                    "& .MuiSvgIcon-root": { color: "dark.main" },
                  }}
                  disabled={isSubmissionLocked}
                >
                  <MenuItem value="A">Agence Type A (Internationale)</MenuItem>
                  <MenuItem value="B">Agence Type B (Locale)</MenuItem>
                </Select>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <ProfileInfoCard
                title="Status d'activation"
                description="Suivi en temps réel de votre dossier."
                info={{
                  "Code agence": agencyCode || "-",
                  Agence: agencyName,
                  Responsable: responsibleName,
                  Email: responsibleEmail,
                  Téléphone: responsiblePhone,
                  Contrat: isSigned ? "Signé" : "Non signé",
                  Validation: getVerificationStatusLabel(),
                  "Fin du contrat": dates.end || "-",
                }}
                social={[]}
                shadow={false}
              />
            </Grid>
          </Grid>

          {isFinalized && (
            <MDBox mt={3}>
              <MDBox
                variant="gradient"
                bgColor={
                  agencyStatus === "active"
                    ? "success"
                    : agencyStatus === "refused"
                    ? "error"
                    : "dark"
                }
                borderRadius="lg"
                coloredShadow={
                  agencyStatus === "active"
                    ? "success"
                    : agencyStatus === "refused"
                    ? "error"
                    : "dark"
                }
                p={3}
                display="flex"
                alignItems="center"
              >
                <Icon sx={{ fontSize: "32px !important", mr: 2, color: "white" }}>info</Icon>
                <MDBox>
                  <MDTypography variant="h6" color="white" fontWeight="bold">
                    {agencyStatus === "active"
                      ? "Dossier validé par l'administration"
                      : agencyStatus === "refused"
                      ? "Dossier refusé par l'administration"
                      : "Dossier en cours de vérification administrative"}
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    {agencyStatus === "active"
                      ? `Votre dossier est validé. Vous avez actuellement ${guides.length} guide(s) et pouvez accéder à toutes les fonctionnalités de la plateforme pour ajouter vos packs Umrah.`
                      : agencyStatus === "refused"
                      ? "Votre dossier a été refusé. Merci de corriger ou compléter votre profil et vos documents avant une nouvelle soumission."
                      : "Vos documents ont été soumis. L'accès complet sera activé après validation par l'équipe Sabeel. Vos modifications sont suspendues durant cette période."}
                  </MDTypography>
                  {!contractExpired && (contractFileUrl || signatureFileUrl) && (
                    <MDTypography
                      variant="caption"
                      color="white"
                      opacity={0.8}
                      display="block"
                      mt={1}
                    >
                      Les documents, le contrat et la signature restent visibles dans les étapes
                      jusqu&apos;à la date de fin du contrat.
                    </MDTypography>
                  )}
                  <MDTypography
                    variant="caption"
                    color="white"
                    opacity={0.85}
                    display="block"
                    mt={1}
                  >
                    Statut actuel : {getVerificationStatusLabel()}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          )}

          <MDBox mt={5}>
            <MDBox
              variant="gradient"
              bgColor={
                isSubmissionLocked ? "dark" : agencyStatus === "refused" ? "error" : "success"
              }
              borderRadius="lg"
              coloredShadow={
                isSubmissionLocked ? "dark" : agencyStatus === "refused" ? "error" : "success"
              }
              p={1}
              textAlign="center"
              mb={-3}
              mx={2}
              position="relative"
              zIndex={1}
            >
              <MDTypography
                variant="button"
                color="white"
                fontWeight="bold"
                textTransform="uppercase"
              >
                {isSubmissionLocked
                  ? "Dossier Soumis - Mode Lecture"
                  : agencyStatus === "refused"
                  ? "Dossier refusé - Correction requise"
                  : "Module de Complétion officielle du profil"}
              </MDTypography>
            </MDBox>
            <MDBox bgColor="white" borderRadius="lg" shadow="sm" p={4} pt={6}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  mb: 5,
                  "& .MuiStepIcon-root.Mui-active": { color: "success.main" },
                  "& .MuiStepIcon-root.Mui-completed": { color: "success.main" },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <MDBox p={2}>
                {renderStepContent(activeStep)}
                <MDBox display="flex" justifyContent="space-between" mt={5}>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Précédent
                  </MDButton>
                  {isSubmissionLocked ? (
                    activeStep < steps.length - 1 && (
                      <MDButton variant="gradient" color="dark" onClick={handleNext}>
                        Suivant
                      </MDButton>
                    )
                  ) : (
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={activeStep === steps.length - 1 ? handleFinalize : handleNext}
                      disabled={isSubmittingProfile}
                    >
                      {activeStep === steps.length - 1
                        ? isSubmittingProfile
                          ? "Envoi en cours..."
                          : "Finaliser Inscription"
                        : "Suivant"}
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Header>

      {/* Contract Document Modal (Detailed Preview) */}
      <Dialog
        open={showContractPreview}
        onClose={() => setShowContractPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 5, bgcolor: "#f8f9fa" }}>
          <MDBox shadow="xl">
            <ContractContent />
          </MDBox>

          <MDBox display="flex" justifyContent="center" mt={3} gap={2}>
            <MDButton
              variant="gradient"
              color="success"
              onClick={() => setShowContractPreview(false)}
            >
              Fermer
            </MDButton>
          </MDBox>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <DialogContent>
          <MDBox textAlign="center" p={3}>
            <Icon sx={{ fontSize: "60px !important", color: "success.main", mb: 2 }}>
              check_circle
            </Icon>
            <MDTypography variant="h4" fontWeight="bold" mb={2}>
              Inscription Finalisée avec Succès !
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              Votre dossier a été transmis à l&apos;équipe administrative de Sabeel. Une
              vérification approfondie sera effectuée sous un délai de <strong>48 heures</strong>.
            </MDTypography>
            <MDButton
              variant="gradient"
              color="success"
              fullWidth
              onClick={() => setShowSuccessModal(false)}
            >
              D&apos;accord, j&apos;ai compris
            </MDButton>
          </MDBox>
        </DialogContent>
      </Dialog>

      <Dialog open={showRequirementsModal} onClose={() => setShowRequirementsModal(false)}>
        <DialogContent>
          <MDBox textAlign="center" p={3}>
            <Icon sx={{ fontSize: "60px !important", color: "warning.main", mb: 2 }}>warning</Icon>
            <MDTypography variant="h4" fontWeight="bold" mb={2}>
              Finalisation impossible pour le moment
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={1}>
              Avant de soumettre votre dossier, vous devez compléter les étapes précédentes.
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              Vérifiez le responsable, ajoutez vos documents obligatoires et signez le contrat avant
              la soumission finale.
            </MDTypography>
            <MDButton
              variant="gradient"
              color="warning"
              fullWidth
              onClick={() => setShowRequirementsModal(false)}
            >
              J&apos;ai compris
            </MDButton>
          </MDBox>
        </DialogContent>
      </Dialog>
    </AgencyPageShell>
  );
}

export default AgencyProfile;
