import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Sabeel Admin components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import AppointmentScheduleModal from "components/AppointmentScheduleModal";

import {
  fetchConversationDetails,
  fetchSupportConversations,
  getOrCreateSupportConversation,
  sendConversationMessage,
} from "api/reservationMessagingApi";
import { createAdminMessagingSocket } from "api/messagingSocket";

import {
  fetchAllAgenciesForAdmin,
  fetchAllGuides,
  fetchAllPilgrimsForAdmin,
} from "auth/adminAgenceAuth";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const mapBackendMessage = (message) => ({
  id: message.id,
  text: message.content,
  sender: message.senderRole === "system" ? "me" : message.senderRole === "admin" ? "me" : "other",
  time: formatTime(message.createdAt),
});

const mapSupportConversationToContact = (conversation) => {
  const role = conversation.agencyId ? "Agence" : conversation.guideId ? "Guide" : "Pèlerin";

  const name = conversation.agencyDisplayName || conversation.guideDisplayName || "Pèlerin";

  const avatar =
    conversation.agencyImageUrl ||
    conversation.guideImageUrl ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200";

  return {
    id: conversation.id,
    name,
    role,
    lastMessage: conversation.lastMessageText || "",
    time: formatTime(
      conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt
    ),
    unread: 0,
    messageCount: 0,
    online: false,
    avatar,
    details: {
      type: role,
      contact: name,
      email: "-",
      phone: "-",
    },
    messages: [],
  };
};

function Messages() {
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactTab, setContactTab] = useState(0);
  const [contactSearch, setContactSearch] = useState("");
  const [agencies, setAgencies] = useState([]);
  const [guides, setGuides] = useState([]);
  const [pilgrims, setPilgrims] = useState([]);

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || null;

  useEffect(() => {
    let socket;
    const load = async () => {
      try {
        const res = await fetchSupportConversations();
        const list = Array.isArray(res) ? res : res?.conversations;
        const mapped = (list || []).map(mapSupportConversationToContact);
        setContacts(mapped);
        if (mapped.length && !selectedContactId) {
          setSelectedContactId(mapped[0].id);
        }

        socket = createAdminMessagingSocket();
        socket.on("message_created", (payload) => {
          if (!payload?.conversation?.id || !payload?.message) return;
          setContacts((prev) =>
            prev.map((c) => {
              if (c.id !== payload.conversation.id) return c;
              const nextMsg = mapBackendMessage(payload.message);
              if (c.messages.some((m) => m.id === nextMsg.id)) return c;
              return {
                ...c,
                lastMessage: payload.message.content,
                time: formatTime(payload.message.createdAt),
                messages: [...c.messages, nextMsg],
              };
            })
          );
        });
      } catch (e) {
        setContacts([]);
      }
    };

    load();
    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedContactId) return;
      try {
        const details = await fetchConversationDetails(selectedContactId);
        setContacts((prev) =>
          prev.map((c) =>
            c.id !== selectedContactId
              ? c
              : {
                  ...c,
                  messages: (details.messages || []).map(mapBackendMessage),
                  lastMessage: details.conversation?.lastMessageText || c.lastMessage,
                  time: formatTime(
                    details.conversation?.lastMessageAt || details.conversation?.createdAt
                  ),
                }
          )
        );
      } catch (e) {
        // ignore
      }
    };

    loadMessages();
  }, [selectedContactId]);

  const openContactDialog = async () => {
    setContactDialogOpen(true);
    try {
      const [agencesData, guidesData, pilgrimsData] = await Promise.all([
        fetchAllAgenciesForAdmin(),
        fetchAllGuides("all"),
        fetchAllPilgrimsForAdmin(),
      ]);
      setAgencies(Array.isArray(agencesData) ? agencesData : []);
      setGuides(Array.isArray(guidesData) ? guidesData : []);
      setPilgrims(Array.isArray(pilgrimsData) ? pilgrimsData : []);
    } catch (e) {
      setAgencies([]);
      setGuides([]);
      setPilgrims([]);
    }
  };

  const handlePickContact = async (targetRole, targetId, displayInfo = {}) => {
    if (!targetId) {
      // eslint-disable-next-line no-alert
      window.alert(
        "Ce guide n'a pas encore de compte associé pour la messagerie. Impossible de le contacter."
      );
      return;
    }
    try {
      const res = await getOrCreateSupportConversation(targetRole, targetId);
      const conversation = res?.conversation;
      if (!conversation?.id) return;

      const roleLabel =
        targetRole === "agence" ? "Agence" : targetRole === "guide" ? "Guide" : "Pèlerin";

      setContacts((prev) => {
        const base = mapSupportConversationToContact(conversation);
        const enriched = {
          ...base,
          name: displayInfo.name || base.name,
          role: roleLabel,
          avatar: displayInfo.avatar || base.avatar,
          details: {
            ...base.details,
            type: roleLabel,
            contact: displayInfo.name || base.details.contact,
            email: displayInfo.email || base.details.email,
            phone: displayInfo.phone || base.details.phone,
          },
        };
        const existingIndex = prev.findIndex((c) => c.id === conversation.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...prev[existingIndex],
            ...enriched,
            messages: prev[existingIndex].messages,
          };
          return next;
        }
        return [enriched, ...prev];
      });
      setSelectedContactId(conversation.id);
      setContactDialogOpen(false);
      setContactSearch("");
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.alert(e.message || "Impossible d'ouvrir la conversation.");
    }
  };

  useEffect(() => {
    const incoming = location.state?.contactSupport;
    if (!incoming?.targetRole) return;

    handlePickContact(incoming.targetRole, incoming.targetId, {
      name: incoming.name,
      avatar: incoming.avatar,
      email: incoming.email,
      phone: incoming.phone,
    });

    window.history.replaceState({}, document.title);
    // eslint-disable-next-line
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContactId) return;
    try {
      const res = await sendConversationMessage(selectedContactId, messageText.trim());
      const nextMsg = mapBackendMessage(res.message);
      setContacts((prev) =>
        prev.map((c) =>
          c.id !== selectedContactId
            ? c
            : {
                ...c,
                lastMessage: nextMsg.text,
                time: nextMsg.time,
                messages: c.messages.some((m) => m.id === nextMsg.id)
                  ? c.messages
                  : [...c.messages, nextMsg],
              }
        )
      );
      setMessageText("");
    } catch (e) {
      // ignore
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fileMessage = `Document envoyé : ${file.name}`;

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedContactId
          ? {
              ...contact,
              lastMessage: fileMessage,
              time: currentTime,
              messages: [
                ...contact.messages,
                { id: Date.now(), text: fileMessage, sender: "me", time: currentTime },
              ],
            }
          : contact
      )
    );

    event.target.value = "";
  };

  const handleMeetingConfirm = (meetingData) => {
    if (!selectedContact) return;
    const summary = `Meeting planifié le ${meetingData.appointmentDate} à ${meetingData.appointmentTime}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedContactId
          ? {
              ...contact,
              lastMessage: summary,
              time: currentTime,
              messages: [
                ...contact.messages,
                { id: Date.now(), text: summary, sender: "me", time: currentTime },
              ],
            }
          : contact
      )
    );

    setMeetingOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "78vh", display: "flex", flexDirection: "column" }}>
              <MDBox p={2.5}>
                <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <MDTypography variant="h5" fontWeight="medium">
                    Messages
                  </MDTypography>
                  <MDButton
                    variant="gradient"
                    color="success"
                    size="small"
                    onClick={openContactDialog}
                    startIcon={<Icon>add_comment</Icon>}
                  >
                    Contacter
                  </MDButton>
                </MDBox>
                <MDInput
                  fullWidth
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>
              <Divider />
              <MDBox sx={{ flex: 1, overflowY: "auto" }}>
                <List sx={{ py: 0 }}>
                  {contacts
                    .filter(
                      (contact) =>
                        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.role.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((contact) => (
                      <ListItem
                        button
                        key={contact.id}
                        onClick={() => setSelectedContactId(contact.id)}
                        sx={{ px: 2, py: 1.5 }}
                        secondaryAction={
                          <MDBox display="flex" alignItems="center" gap={1}>
                            {contact.unread > 0 && (
                              <MDBadge
                                badgeContent={contact.unread}
                                color="success"
                                variant="gradient"
                                size="xs"
                                circular
                              />
                            )}
                          </MDBox>
                        }
                      >
                        <MDBox
                          width="100%"
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          sx={{
                            backgroundColor:
                              selectedContact?.id === contact.id ? "grey-200" : "transparent",
                            borderLeft: selectedContact?.id === contact.id ? "3px solid" : "none",
                            borderColor: "success.main",
                            borderRadius: "10px",
                            px: 1.25,
                            py: 1,
                            "&:hover": { backgroundColor: "grey-100" },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 42 }}>
                            <MDBox position="relative">
                              <MDAvatar
                                src={contact.avatar}
                                alt={contact.name}
                                size="sm"
                                shadow="sm"
                              />
                              {contact.online && (
                                <MDBox
                                  position="absolute"
                                  bottom={0}
                                  right={0}
                                  width={10}
                                  height={10}
                                  bgColor="success"
                                  borderRadius="50%"
                                  border="2px solid white"
                                />
                              )}
                            </MDBox>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <MDBox
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <MDTypography variant="button" fontWeight="medium">
                                  {contact.name}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {contact.time}
                                </MDTypography>
                              </MDBox>
                            }
                            secondary={
                              <MDBox>
                                <MDTypography variant="caption" color="text" display="block">
                                  {contact.role}
                                </MDTypography>
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "180px",
                                  }}
                                >
                                  {contact.lastMessage}
                                </MDTypography>
                              </MDBox>
                            }
                          />
                        </MDBox>
                      </ListItem>
                    ))}
                </List>
              </MDBox>
            </Card>
          </Grid>

          {/* Chat Window */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: "78vh", display: "flex", flexDirection: "column" }}>
              {selectedContact ? (
                <>
                  <MDBox p={2.5} display="flex" alignItems="center" justifyContent="space-between">
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <MDAvatar
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        shadow="sm"
                      />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          {selectedContact.name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {selectedContact.role} -{" "}
                          {selectedContact.online ? "En ligne" : "Hors ligne"}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDBox display="flex" gap={1}>
                      <IconButton color="info" onClick={() => setMeetingOpen(true)}>
                        <Icon>calendar_month</Icon>
                      </IconButton>
                      <IconButton color="dark" onClick={() => setDetailsOpen(true)}>
                        <Icon>info</Icon>
                      </IconButton>
                    </MDBox>
                  </MDBox>
                  <Divider />

                  <MDBox
                    p={3}
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      backgroundColor: "grey-100",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {selectedContact.messages.map((msg) => (
                      <MDBox
                        key={msg.id}
                        display="flex"
                        justifyContent={msg.sender === "me" ? "flex-end" : "flex-start"}
                      >
                        <MDBox
                          sx={{
                            maxWidth: "70%",
                            padding: "10px 16px",
                            borderRadius:
                              msg.sender === "me" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                            backgroundColor: msg.sender === "me" ? "success.main" : "white",
                            color: msg.sender === "me" ? "white" : "dark",
                            boxShadow: 1,
                          }}
                        >
                          <MDTypography variant="body2" color="inherit">
                            {msg.text}
                          </MDTypography>
                          <MDBox textAlign="right" mt={0.5}>
                            <MDTypography
                              variant="caption"
                              color={msg.sender === "me" ? "white" : "text"}
                              opacity={0.7}
                            >
                              {msg.time}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ))}
                  </MDBox>

                  <Divider />

                  <MDBox p={2} display="flex" gap={2} alignItems="center">
                    <IconButton
                      color="success"
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon>attach_file</Icon>
                    </IconButton>
                    <MDInput
                      fullWidth
                      placeholder="Écrire un message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <MDButton
                      variant="gradient"
                      color="success"
                      iconOnly
                      onClick={handleSendMessage}
                      sx={{ color: "white !important" }}
                    >
                      <Icon>send</Icon>
                    </MDButton>
                  </MDBox>
                </>
              ) : (
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Icon sx={{ fontSize: "64px !important", color: "grey-300", mb: 2 }}>forum</Icon>
                  <MDTypography variant="h6" color="text">
                    Sélectionnez une conversation pour commencer
                  </MDTypography>
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <AppointmentScheduleModal
        open={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        onConfirm={handleMeetingConfirm}
        reservationData={selectedContact}
      />

      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Contacter</DialogTitle>
        <DialogContent>
          <Tabs value={contactTab} onChange={(e, v) => setContactTab(v)} sx={{ mb: 2 }}>
            <Tab label="Agences" />
            <Tab label="Guides" />
            <Tab label="Pèlerins" />
          </Tabs>

          <MDInput
            fullWidth
            placeholder="Rechercher..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <List dense>
            {contactTab === 0 &&
              agencies
                .filter((a) => {
                  const name = (a.agencyName || a.fullName || "").toLowerCase();
                  return name.includes(contactSearch.toLowerCase());
                })
                .slice(0, 50)
                .map((a) => (
                  <ListItem
                    key={a.id}
                    secondaryAction={
                      <MDButton
                        variant="text"
                        color="success"
                        size="small"
                        onClick={() =>
                          handlePickContact("agence", a.id, {
                            name: a.agencyName || a.fullName,
                            avatar: a.profileImageUrl || a.profileImagePath,
                            email: a.email,
                            phone: a.phoneNumber || a.phone,
                          })
                        }
                      >
                        Contacter
                      </MDButton>
                    }
                  >
                    <ListItemText
                      primary={a.agencyName || a.fullName || "-"}
                      secondary={a.email || ""}
                    />
                  </ListItem>
                ))}

            {contactTab === 1 &&
              guides
                .filter((g) => {
                  const name = (g.name || g.email || "").toLowerCase();
                  return name.includes(contactSearch.toLowerCase());
                })
                .slice(0, 50)
                .map((g) => (
                  <ListItem
                    key={g.id}
                    secondaryAction={
                      <MDButton
                        variant="text"
                        color="success"
                        size="small"
                        onClick={() =>
                          handlePickContact("guide", g.type === "agency" ? g.guideUserId : g.id, {
                            name: g.name,
                            avatar: g.photo,
                            email: g.email,
                            phone: g.phone,
                          })
                        }
                      >
                        Contacter
                      </MDButton>
                    }
                  >
                    <ListItemText primary={g.name || "-"} secondary={g.email || ""} />
                  </ListItem>
                ))}

            {contactTab === 2 &&
              pilgrims
                .filter((p) => {
                  const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
                  const email = (p.email || "").toLowerCase();
                  return (
                    name.includes(contactSearch.toLowerCase()) ||
                    email.includes(contactSearch.toLowerCase())
                  );
                })
                .slice(0, 50)
                .map((p) => (
                  <ListItem
                    key={p.id}
                    secondaryAction={
                      <MDButton
                        variant="text"
                        color="success"
                        size="small"
                        onClick={() =>
                          handlePickContact("pelerin", p.id, {
                            name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
                            avatar: p.photo,
                            email: p.email,
                            phone: p.phoneNumber || p.phone,
                          })
                        }
                      >
                        Contacter
                      </MDButton>
                    }
                  >
                    <ListItemText
                      primary={`${p.firstName || ""} ${p.lastName || ""}`.trim() || "-"}
                      secondary={p.email || ""}
                    />
                  </ListItem>
                ))}
          </List>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setContactDialogOpen(false)} color="dark">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Détails du contact</DialogTitle>
        <DialogContent>
          {selectedContact && (
            <MDBox display="flex" flexDirection="column" gap={1.5} py={1}>
              <MDTypography variant="button">
                <strong>Type:</strong> {selectedContact.details.type}
              </MDTypography>
              <MDTypography variant="button">
                <strong>Nom:</strong> {selectedContact.details.contact}
              </MDTypography>
              <MDTypography variant="button">
                <strong>Email:</strong> {selectedContact.details.email}
              </MDTypography>
              <MDTypography variant="button">
                <strong>Téléphone:</strong> {selectedContact.details.phone}
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDetailsOpen(false)} color="dark">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

// Helper to provide Icon Buttons with MD style if needed, or just use MUI
function IconButton({ children, color, size, ...rest }) {
  return (
    <MDButton variant="text" color={color} size={size} iconOnly {...rest}>
      {children}
    </MDButton>
  );
}

IconButton.defaultProps = {
  color: "success",
  size: "medium",
};

IconButton.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  size: PropTypes.string,
};

export default Messages;
