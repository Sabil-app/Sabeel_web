/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useRef } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDInput from "components/MDInput";

// Images
import burceMars from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({
  children,
  userName,
  onUserNameChange,
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

  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e, callback, uploadCallback) => {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);

    if (uploadCallback) {
      try {
        setUploading(true);
        await uploadCallback(file);
      } catch (error) {
        console.error("[Header] image upload failed:", error);
        window.alert(
          error?.message ||
            "Échec de l'envoi de l'image. Vérifiez que le serveur est démarré et réessayez."
        );
      } finally {
        setUploading(false);
      }
    }

    // Reset so selecting the same file again re-triggers onChange
    input.value = "";
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
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            coverImage
              ? `url(${coverImage})`
              : linearGradient(rgba(gradients.dark.main, 0.8), rgba(gradients.dark.state, 0.8)),
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
          backgroundColor: ({ palette: { dark } }) => dark.main,
        }}
      >
        <MDBox
          position="absolute"
          top={16}
          right={16}
          sx={{
            cursor: uploading ? "default" : "pointer",
            zIndex: 1,
            opacity: uploading ? 0.5 : 1,
          }}
          onClick={() => !uploading && coverInputRef.current.click()}
        >
          <MDBox
            bgColor="success"
            borderRadius="50%"
            width="32px"
            height="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="sm"
            sx={{ border: "2px solid white" }}
          >
            <Icon sx={{ fontSize: "18px !important", color: "white" }}>photo_camera</Icon>
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
              src={profileImage || burceMars}
              alt="profile-image"
              size="xl"
              shadow="sm"
              sx={{ borderRadius: "50% !important" }}
            />
            <MDBox
              position="absolute"
              bottom={0}
              right={0}
              sx={{ cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}
              onClick={() => !uploading && profileInputRef.current.click()}
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
                    value={userName}
                    onChange={(e) => onUserNameChange(e.target.value)}
                    sx={{
                      "& .MuiInput-root": { fontSize: "1.25rem", fontWeight: "500" },
                    }}
                    autoFocus
                  />
                ) : (
                  <MDTypography variant="h5" fontWeight="medium">
                    {userName}
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
                Sabeel Administrator
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
  profileImage: "",
  coverImage: "",
  onProfileImageUpload: null,
  onCoverImageUpload: null,
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
  userName: PropTypes.string.isRequired,
  onUserNameChange: PropTypes.func.isRequired,
  profileImage: PropTypes.string,
  onProfileImageChange: PropTypes.func.isRequired,
  onProfileImageUpload: PropTypes.func,
  coverImage: PropTypes.string,
  onCoverImageChange: PropTypes.func.isRequired,
  onCoverImageUpload: PropTypes.func,
};

export default Header;
