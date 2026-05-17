import { useMemo, useState } from "react";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import {
  fetchComplaints,
  updateComplaintStatus as updateComplaintStatusApi,
} from "auth/adminAgenceAuth";

function AdminReclamations() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedActionComplaint, setSelectedActionComplaint] = useState(null);

  useState(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await fetchComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    const searchLc = searchTerm.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesFilter = filter === "all" || item.sourceType === filter;
      const matchesSearch =
        !searchLc ||
        item.sender.toLowerCase().includes(searchLc) ||
        item.category.toLowerCase().includes(searchLc) ||
        item.message.toLowerCase().includes(searchLc) ||
        item.target.toLowerCase().includes(searchLc);
      return matchesFilter && matchesSearch;
    });
  }, [complaints, filter, searchTerm]);

  const handleActionMenuClick = (event, complaint) => {
    setActionMenu(event.currentTarget);
    setSelectedActionComplaint(complaint);
  };

  const handleCloseActionMenu = () => {
    setActionMenu(null);
    setSelectedActionComplaint(null);
  };

  const handleComplaintAction = (action) => {
    if (selectedActionComplaint) {
      updateComplaintStatus(action, selectedActionComplaint.id);
    }
    handleCloseActionMenu();
  };

  const updateComplaintStatus = async (status, complaintId = null) => {
    const targetId = complaintId || selectedComplaint?.id;
    if (!targetId) return;

    try {
      await updateComplaintStatusApi(targetId, status);
      setComplaints((prev) =>
        prev.map((complaint) => (complaint.id === targetId ? { ...complaint, status } : complaint))
      );

      if (selectedComplaint?.id === targetId) {
        setSelectedComplaint((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const getStatusColor = (status) => {
    if (status === "nouvelle") return "error";
    if (status === "en_cours") return "warning";
    return "success";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Réclamations
          </MDTypography>
          <MDTypography variant="button" color="text">
            Centralisez les réclamations venant de l&apos;app, des agences, des guides et des
            pèlerins.
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "78vh", display: "flex", flexDirection: "column" }}>
              <MDBox p={2.5}>
                <MDInput
                  fullWidth
                  placeholder="Rechercher une réclamation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MDBox mt={2}>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    fullWidth
                    sx={{ height: 45 }}
                  >
                    <MenuItem value="all">Toutes les sources</MenuItem>
                    <MenuItem value="app">App Sabeel</MenuItem>
                    <MenuItem value="agency">Agence</MenuItem>
                    <MenuItem value="guide">Guide</MenuItem>
                    <MenuItem value="agency_platform">Plateforme agence</MenuItem>
                  </Select>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox sx={{ flex: 1, overflowY: "auto" }}>
                {filteredComplaints.map((item) => (
                  <MDBox
                    key={item.id}
                    px={2.5}
                    py={2}
                    onClick={() => setSelectedComplaint(item)}
                    sx={{
                      cursor: "pointer",
                      borderLeft:
                        selectedComplaint?.id === item.id
                          ? "4px solid #2e7d32"
                          : "4px solid transparent",
                      backgroundColor:
                        selectedComplaint?.id === item.id ? "#f5f5f5" : "transparent",
                    }}
                  >
                    <MDBox
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <MDBox>
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          {item.sender}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          {item.category} - {item.target}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                        <MDBadge
                          badgeContent={item.status}
                          color={getStatusColor(item.status)}
                          size="xs"
                          variant="gradient"
                          container
                        />
                      </MDBox>
                    </MDBox>
                    <MDTypography variant="caption" color="text" display="block" mt={1}>
                      {item.message}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ height: "78vh", display: "flex", flexDirection: "column" }}>
              {selectedComplaint ? (
                <>
                  <MDBox p={2.5} display="flex" justifyContent="space-between" alignItems="center">
                    <MDBox>
                      <MDTypography variant="h5">{selectedComplaint.category}</MDTypography>
                      <MDTypography variant="button" color="text">
                        {selectedComplaint.source} - {selectedComplaint.sender}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" gap={1} alignItems="center">
                      <MDBox display="flex" gap={1}>
                        <MDBadge
                          badgeContent={selectedComplaint.status}
                          color={getStatusColor(selectedComplaint.status)}
                          variant="gradient"
                          size="sm"
                        />
                      </MDBox>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuClick(e, selectedComplaint)}
                        sx={{ ml: 1 }}
                      >
                        <Icon fontSize="small">more_vert</Icon>
                      </IconButton>
                    </MDBox>
                  </MDBox>
                  <Divider />
                  <MDBox p={3} sx={{ flex: 1, overflowY: "auto" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" fontWeight="bold" color="text">
                          SOURCE
                        </MDTypography>
                        <MDTypography variant="button" display="block">
                          {selectedComplaint.source}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" fontWeight="bold" color="text">
                          DATE
                        </MDTypography>
                        <MDTypography variant="button" display="block">
                          {selectedComplaint.date}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12}>
                        <MDTypography variant="caption" fontWeight="bold" color="text">
                          MESSAGE
                        </MDTypography>
                        <MDTypography variant="button" display="block" color="text">
                          {selectedComplaint.message}
                        </MDTypography>
                      </Grid>
                    </Grid>
                  </MDBox>
                </>
              ) : (
                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                  <MDTypography variant="h6" color="text">
                    Aucune réclamation trouvée.
                  </MDTypography>
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={handleCloseActionMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {selectedActionComplaint?.status === "nouvelle" && (
          <MenuItem onClick={() => handleComplaintAction("en_cours")}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              pending_actions
            </Icon>
            Mettre en cours
          </MenuItem>
        )}
        {(selectedActionComplaint?.status === "nouvelle" ||
          selectedActionComplaint?.status === "en_cours") && (
          <MenuItem onClick={() => handleComplaintAction("résolue")}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              task_alt
            </Icon>
            Marquer résolue
          </MenuItem>
        )}
        {selectedActionComplaint?.status === "résolue" && (
          <MenuItem onClick={() => handleComplaintAction("en_cours")}>
            <Icon fontSize="small" sx={{ mr: 1 }}>
              refresh
            </Icon>
            Rouvrir
          </MenuItem>
        )}
        <MenuItem onClick={() => handleComplaintAction("archivée")}>
          <Icon fontSize="small" sx={{ mr: 1 }}>
            archive
          </Icon>
          Archiver
        </MenuItem>
      </Menu>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminReclamations;
