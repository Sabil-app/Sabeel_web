import { useRef, useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDInput from "components/MDInput";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({
  children,
  agencyName,
  onAgencyNameChange,
  profileImage,
  onProfileImageChange,
  onProfileImageUpload,
  coverImage,
  onCoverImageChange,
  onCoverImageUpload,
}) {
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleImageChange = async (e, callback, uploadCallback) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);

    if (uploadCallback) {
      try {
        await uploadCallback(file);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert(error?.message || "Échec de l'upload de l'image.");
      }
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  return (
    <MDBox position="relative" mb={5}>
      <input
        type="file"
        hidden
        ref={profileInputRef}
        onChange={(e) => handleImageChange(e, onProfileImageChange, onProfileImageUpload)}
      />
      <input
        type="file"
        hidden
        ref={coverInputRef}
        onChange={(e) => handleImageChange(e, onCoverImageChange, onCoverImageUpload)}
      />

      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: coverImage
            ? `url(${coverImage})`
            : ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
                `${linearGradient(
                  rgba(gradients.success.main, 0.6),
                  rgba(gradients.success.state, 0.6)
                )}`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      >
        <MDBox
          position="absolute"
          top={14}
          right={14}
          sx={{ cursor: "pointer", zIndex: 1 }}
          onClick={() => coverInputRef.current.click()}
        >
          <MDBox
            bgColor="success"
            borderRadius="50%"
            width="34px"
            height="34px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="sm"
            sx={{ border: "2px solid white" }}
          >
            <Icon sx={{ fontSize: "16px !important", color: "white" }}>photo_camera</Icon>
          </MDBox>
        </MDBox>
      </MDBox>

      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item position="relative">
            <MDAvatar
              src={profileImage}
              bgColor="success"
              icon="business"
              alt="profile-image"
              size="xl"
              shadow="sm"
              sx={{ borderRadius: "50% !important" }}
            />
            <MDBox
              position="absolute"
              bottom={0}
              right={0}
              sx={{ cursor: "pointer" }}
              onClick={() => profileInputRef.current.click()}
            >
              <MDBox
                bgColor="success"
                borderRadius="50%"
                width="24px"
                height="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
                sx={{ border: "2px solid white" }}
              >
                <Icon sx={{ fontSize: "14px !important", color: "white" }}>photo_camera</Icon>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDBox display="flex" alignItems="center">
                {isEditingName ? (
                  <MDInput
                    variant="standard"
                    value={agencyName}
                    onChange={(e) => onAgencyNameChange(e.target.value)}
                    sx={{
                      "& .MuiInput-root": { fontSize: "1.25rem", fontWeight: "500" },
                    }}
                    autoFocus
                  />
                ) : (
                  <MDTypography variant="h5" fontWeight="medium">
                    {agencyName}
                  </MDTypography>
                )}
                <Icon
                  sx={{
                    ml: 1,
                    color: isEditingName ? "success.main" : "text",
                    fontSize: "20px !important",
                    cursor: "pointer",
                    "&:hover": { color: "success.main" },
                  }}
                  onClick={() => setIsEditingName(!isEditingName)}
                >
                  {isEditingName ? "done" : "edit"}
                </Icon>
              </MDBox>
              <MDTypography variant="button" color="text" fontWeight="regular">
                Responsable Agence / Gestionnaire
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
  profileImage: "",
  coverImage: "",
  onProfileImageUpload: null,
  onCoverImageUpload: null,
};

Header.propTypes = {
  children: PropTypes.node,
  agencyName: PropTypes.string.isRequired,
  onAgencyNameChange: PropTypes.func.isRequired,
  profileImage: PropTypes.string,
  onProfileImageChange: PropTypes.func.isRequired,
  onProfileImageUpload: PropTypes.func,
  coverImage: PropTypes.string,
  onCoverImageChange: PropTypes.func.isRequired,
  onCoverImageUpload: PropTypes.func,
};

export default Header;
