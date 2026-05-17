import { useState, useRef } from "react";

import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

function AgencyDocuments() {
  const fileInputRef = useRef(null);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [currentDoc, setCurrentDoc] = useState(null);

  const handleUploadClick = (doc) => {
    setCurrentDoc(doc);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && currentDoc) {
      setUploadedDocs((prev) => ({ ...prev, [currentDoc]: file.name }));
    }
  };

  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox display="flex" alignItems="center" gap={2} sx={{ position: "relative", zIndex: 1 }}>
          <MDBox className="agency-icon-chip">
            <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>folder</Icon>
          </MDBox>
          <MDBox>
            <MDTypography className="agency-hero__title" variant="h5" color="white">
              Documents
            </MDTypography>
            <MDTypography className="agency-hero__subtitle" variant="button" color="white">
              Ajoutez les documents officiels de votre agence.
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox
        bgColor="white"
        borderRadius="lg"
        shadow="sm"
        p={3}
        className="reveal-up reveal-up-1"
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Grid container spacing={3}>
          {["RNE", "Patente", "Agreement", "Numéro de contrat"].map((doc, idx) => (
            <Grid item xs={12} md={6} key={doc}>
              <MDBox
                display="flex"
                flexDirection="column"
                className={`reveal-up reveal-up-${(idx % 5) + 1}`}
              >
                <MDTypography variant="button" fontWeight="medium" mb={1}>
                  {doc}
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="success"
                  size="small"
                  fullWidth
                  onClick={() => handleUploadClick(doc)}
                >
                  <Icon sx={{ mr: 1 }}>{uploadedDocs[doc] ? "check_circle" : "upload_file"}</Icon>
                  {uploadedDocs[doc] ? uploadedDocs[doc] : `Upload ${doc}`}
                </MDButton>
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </AgencyPageShell>
  );
}

export default AgencyDocuments;
