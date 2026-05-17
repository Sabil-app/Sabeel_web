import { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function FileStudyModal({ open, onClose, onConfirm, reservationData }) {
  const [formData, setFormData] = useState({
    studyDate: "",
    studyTime: "",
    status: "in_progress",
    comments: "",
    documents: [],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l&apos;erreur quand on commence à taper
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studyDate) newErrors.studyDate = "Date requise";
    if (!formData.studyTime) newErrors.studyTime = "Heure requise";
    if (
      formData.status !== "in_progress" &&
      (!formData.comments || formData.comments.trim() === "")
    ) {
      newErrors.comments = "Commentaires requis pour cette action";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      studyDate: "",
      studyTime: "",
      status: "in_progress",
      comments: "",
      documents: [],
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon sx={{ color: "info.main" }}>assignment</Icon>
        Étude du dossier
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <MDBox display="flex" flexDirection="column" gap={2}>
          {/* Infos de la réservation */}
          {reservationData && (
            <Card sx={{ p: 1.5, backgroundColor: "#f5f5f5" }}>
              <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={1}>
                📋 Réservation
              </MDTypography>
              <MDBox display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                <MDBox>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Package
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {reservationData.packageName}
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Pèlerins
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {reservationData.pilgrimCount} personne(s)
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Dates
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {reservationData.startDate} - {reservationData.endDate}
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Prix
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {reservationData.totalPrice} DT
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          )}

          {/* Date d&apos;étude */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              📅 Date de l&apos;étude
            </MDTypography>
            <MDInput
              type="date"
              name="studyDate"
              value={formData.studyDate}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.studyDate)}
            />
            {errors.studyDate && (
              <MDTypography variant="caption" color="error">
                {errors.studyDate}
              </MDTypography>
            )}
          </MDBox>

          {/* Heure d&apos;étude */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              🕐 Heure de l&apos;étude
            </MDTypography>
            <MDInput
              type="time"
              name="studyTime"
              value={formData.studyTime}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.studyTime)}
            />
            {errors.studyTime && (
              <MDTypography variant="caption" color="error">
                {errors.studyTime}
              </MDTypography>
            )}
          </MDBox>

          {/* État d&apos;étude */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              📊 État de l&apos;étude
            </MDTypography>
            <MDBox
              component="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              sx={{
                width: "100%",
                p: 1.5,
                borderRadius: 1,
                border: "1px solid #ddd",
                fontFamily: "inherit",
                fontSize: "0.875rem",
                "&:focus": {
                  outline: "none",
                  borderColor: "#1a1a1a",
                },
              }}
            >
              <option value="in_progress">En cours d&apos;étude</option>
              <option value="accepted">Acceptée</option>
              <option value="rejected">Refusée</option>
            </MDBox>
          </MDBox>

          {/* Info sur le statut sélectionné */}
          <MDBox
            p={1.5}
            sx={{
              backgroundColor:
                formData.status === "rejected"
                  ? "#ffebee"
                  : formData.status === "accepted"
                  ? "#e8f5e9"
                  : "#e3f2fd",
              border:
                formData.status === "rejected"
                  ? "1px solid #ef5350"
                  : formData.status === "accepted"
                  ? "1px solid #66bb6a"
                  : "1px solid #90caf9",
              borderRadius: 1,
            }}
          >
            <MDTypography variant="caption" color="text">
              {formData.status === "rejected"
                ? "❌ Le pèlerin recevra une notification de rejet avec les raisons."
                : formData.status === "accepted"
                ? "✅ Le pèlerin recevra une notification d&apos;acceptation."
                : "⏳ L&apos;étude est en cours. Vous pouvez ajouter des commentaires ultérieurement."}
            </MDTypography>
          </MDBox>

          {/* Commentaires */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              💬 Commentaires {formData.status !== "in_progress" && "(requis)"}
            </MDTypography>
            <MDInput
              name="comments"
              placeholder="Détails de l'étude, observations, raisons du rejet..."
              value={formData.comments}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              error={Boolean(errors.comments)}
            />
            {errors.comments && (
              <MDTypography variant="caption" color="error">
                {errors.comments}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 2, display: "flex", gap: 1 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={() => {
            onClose();
            handleReset();
          }}
        >
          Annuler
        </MDButton>
        <MDButton
          variant="gradient"
          color={
            formData.status === "rejected"
              ? "error"
              : formData.status === "accepted"
              ? "success"
              : "info"
          }
          onClick={handleSubmit}
        >
          Enregistrer l&apos;Étude
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

FileStudyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  reservationData: PropTypes.object,
};

export default FileStudyModal;
