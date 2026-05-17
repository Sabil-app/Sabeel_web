import { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function AppointmentScheduleModal({ open, onClose, onConfirm, reservationData }) {
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    location: "",
    notes: "",
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
    if (!formData.appointmentDate) newErrors.appointmentDate = "Date requise";
    if (!formData.appointmentTime) newErrors.appointmentTime = "Heure requise";
    if (!formData.location) newErrors.location = "Localisation requise";
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
      appointmentDate: "",
      appointmentTime: "",
      location: "",
      notes: "",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon sx={{ color: "info.main" }}>event</Icon>
        Programmer un rendez-vous
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <MDBox display="flex" flexDirection="column" gap={2}>
          {/* Date */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              📅 Date du rendez-vous
            </MDTypography>
            <MDInput
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.appointmentDate)}
            />
            {errors.appointmentDate && (
              <MDTypography variant="caption" color="error">
                {errors.appointmentDate}
              </MDTypography>
            )}
          </MDBox>

          {/* Heure */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              🕐 Heure du rendez-vous
            </MDTypography>
            <MDInput
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.appointmentTime)}
            />
            {errors.appointmentTime && (
              <MDTypography variant="caption" color="error">
                {errors.appointmentTime}
              </MDTypography>
            )}
          </MDBox>

          {/* Localisation */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              📍 Localisation
            </MDTypography>
            <MDInput
              name="location"
              placeholder="Adresse ou endroit de rendez-vous"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.location)}
            />
            {errors.location && (
              <MDTypography variant="caption" color="error">
                {errors.location}
              </MDTypography>
            )}
          </MDBox>

          {/* Notes */}
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="bold" display="block" mb={1}>
              📝 Notes (optionnel)
            </MDTypography>
            <MDInput
              name="notes"
              placeholder="Informations supplémentaires..."
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </MDBox>

          {/* Info */}
          <MDBox
            p={1.5}
            sx={{
              backgroundColor: "info.main",
              backgroundColor: "rgba(66, 165, 245, 0.1)",
              borderLeft: "3px solid #42a5f5",
              borderRadius: 1,
            }}
          >
            <MDTypography variant="caption" color="text">
              ℹ️ Une notification sera envoyée au pèlerin avec les détails du rendez-vous.
            </MDTypography>
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
        <MDButton variant="gradient" color="info" onClick={handleSubmit}>
          Programmer
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

AppointmentScheduleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  reservationData: PropTypes.object,
};

export default AppointmentScheduleModal;
