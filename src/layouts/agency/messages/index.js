import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import AgencyPageShell from "layouts/agency/shared/AgencyPageShell";

import ReservationCard from "components/ReservationCard";
import AppointmentScheduleModal from "components/AppointmentScheduleModal";
import FileStudyModal from "components/FileStudyModal";
import {
  acceptReservationRequest,
  fetchAgencyReservations,
  fetchConversationDetails,
  fetchMyConversations,
  getOrCreateAgencyGuideConversation,
  rejectReservationRequest,
  sendConversationMessage,
} from "api/reservationMessagingApi";
import { createAdminMessagingSocket } from "api/messagingSocket";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR");
};

const mapReservation = (reservation) => ({
  id: reservation.id,
  pilgrimName: reservation.pilgrimName,
  pilgrimEmail: reservation.pilgrimEmail,
  pilgrimPhone: reservation.pilgrimPhone,
  age: reservation.age,
  hasDisease: reservation.hasDisease,
  medications: reservation.medications,
  packageName: reservation.packageName,
  reservationDate: reservation.reservationDate || formatDate(reservation.createdAt),
  pilgrimCount: reservation.pilgrimCount,
  paymentType: reservation.paymentType,
  guideName: "À confirmer",
  startDate: reservation.reservationDate || "À confirmer",
  endDate: "À confirmer",
  totalPrice: Number(reservation.totalPrice || 0),
  advanceAmount: Number(reservation.advanceAmount || 0),
  notes: reservation.notes,
  status: reservation.status,
  conversationId: reservation.conversationId,
});

const mapBackendMessage = (message, conversation = null) => {
  const isOut = message.senderRole === "agence";
  let senderName = "";
  let senderRole = "";

  if (message.senderRole === "agence") {
    senderName = conversation?.agencyDisplayName || "Agence";
    senderRole = "Agence";
  } else if (message.senderRole === "system") {
    senderName = conversation?.supportDisplayName || "Admin Sabeel";
    senderRole = "Admin";
  } else if (message.senderRole === "guide") {
    senderName = conversation?.guideDisplayName || "Guide";
    senderRole = "Guide";
  } else {
    senderName = conversation?.pilgrimDisplayName || "Pèlerin";
    senderRole = "Pèlerin";
  }

  return {
    id: message.id,
    text: message.content,
    type: isOut ? "out" : "in",
    time: formatTime(message.createdAt),
    senderName,
    senderRole,
  };
};

const buildConversationContext = (conversation) => ({
  supportDisplayName: conversation?.supportDisplayName,
  agencyDisplayName: conversation?.agencyDisplayName,
  guideDisplayName: conversation?.guideDisplayName,
  pilgrimDisplayName: conversation?.pilgrimDisplayName,
});

const mapConversation = (conversation, reservation) => {
  const isSupportConversation = Boolean(conversation.supportAdminId);
  const isPilgrimConversation = Boolean(conversation.pilgrimUserId);

  let name;
  let role;

  if (isSupportConversation) {
    name = conversation.supportDisplayName || "Admin Sabeel";
    role = "Admin";
  } else {
    name =
      (isPilgrimConversation ? conversation.pilgrimDisplayName : null) ||
      (!isPilgrimConversation ? conversation.guideDisplayName : null) ||
      conversation.agencyDisplayName ||
      reservation?.pilgrimName ||
      (isPilgrimConversation ? "Pèlerin" : "Guide");
    role = isPilgrimConversation ? "Pèlerin" : "Guide";
  }

  const lastMsg =
    conversation.lastMessageText || (isPilgrimConversation ? "Demande de réservation" : "");

  return {
    id: conversation.id,
    name,
    role,
    lastMsg,
    time: formatTime(conversation.lastMessageAt || conversation.createdAt),
    online: false,
    hasReservation: Boolean(conversation.reservationId),
    reservationId: conversation.reservationId,
    reservationStatus: reservation?.status || "pending",
    isSupportConversation,
    avatarUrl: isSupportConversation
      ? conversation.supportImageUrl || null
      : isPilgrimConversation
      ? conversation.pilgrimImageUrl || null
      : conversation.guideImageUrl || null,
    conversationMeta: buildConversationContext(conversation),
    messages: [],
  };
};

function AgencyMessages() {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState("");
  const [showReservations, setShowReservations] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [fileStudyModalOpen, setFileStudyModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationDetailsId, setReservationDetailsId] = useState(null);
  const [openReservationDetails, setOpenReservationDetails] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, id: null });
  const [actionToast, setActionToast] = useState({ open: false, type: "success", text: "" });
  const [loadingData, setLoadingData] = useState(true);

  const [reservations, setReservations] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    let socket;

    const loadData = async () => {
      try {
        setLoadingData(true);
        const [reservationResponse, conversationResponse] = await Promise.all([
          fetchAgencyReservations(),
          fetchMyConversations(),
        ]);

        const mappedReservations = (reservationResponse || []).map(mapReservation);
        const reservationsByConversation = Object.fromEntries(
          mappedReservations.map((item) => [item.conversationId, item])
        );
        const mappedChats = (conversationResponse || []).map((conversation) =>
          mapConversation(
            conversation,
            reservationsByConversation[conversation.id] ||
              reservationsByConversation[conversation.reservationId]
          )
        );

        setReservations(mappedReservations);
        setChats(mappedChats);

        if (mappedChats.length > 0) {
          setActiveChat(mappedChats[0].id);
        }

        socket = createAdminMessagingSocket();
        socket.on("reservation_created", (payload) => {
          const nextReservation = mapReservation(payload.reservation);
          const nextChat = mapConversation(payload.conversation, nextReservation);

          setReservations((prev) => {
            if (prev.some((item) => item.id === nextReservation.id)) return prev;
            return [nextReservation, ...prev];
          });
          setChats((prev) => {
            if (prev.some((item) => item.id === nextChat.id)) return prev;
            return [nextChat, ...prev];
          });
        });

        socket.on("message_created", (payload) => {
          if (!payload?.conversation?.id || !payload?.message) return;

          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== payload.conversation.id) return chat;
              const context = buildConversationContext({
                ...chat.conversationMeta,
                ...payload.conversation,
              });
              const nextMsg = mapBackendMessage(payload.message, context);
              if (chat.messages.some((msg) => msg.id === nextMsg.id)) return chat;
              return {
                ...chat,
                ...(chat.isSupportConversation && payload.conversation?.supportDisplayName
                  ? {
                      name: payload.conversation.supportDisplayName,
                      role: "Admin",
                    }
                  : {}),
                conversationMeta: context,
                lastMsg: nextMsg.text || chat.lastMsg,
                time: nextMsg.time,
                messages: [...chat.messages, nextMsg],
              };
            })
          );
        });

        socket.on("reservation_updated", (payload) => {
          if (!payload?.reservation) return;
          const nextReservation = mapReservation(payload.reservation);

          setReservations((prev) =>
            prev.map((item) => (item.id === nextReservation.id ? nextReservation : item))
          );

          setChats((prev) =>
            prev.map((chat) => {
              if (
                chat.reservationId !== nextReservation.id &&
                chat.id !== payload?.conversation?.id
              ) {
                return chat;
              }
              const nextMessages = payload?.message
                ? chat.messages.some((msg) => msg.id === payload.message.id)
                  ? chat.messages
                  : [
                      ...chat.messages,
                      mapBackendMessage(
                        payload.message,
                        buildConversationContext(payload.conversation)
                      ),
                    ]
                : chat.messages;
              return {
                ...chat,
                reservationStatus: nextReservation.status,
                lastMsg: payload?.message?.content || chat.lastMsg,
                time: payload?.message ? formatTime(payload.message.createdAt) : chat.time,
                messages: nextMessages,
              };
            })
          );
        });
      } catch (error) {
        setActionToast({
          open: true,
          type: "error",
          text: error.message || "Impossible de charger les réservations.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) return;

      try {
        const details = await fetchConversationDetails(activeChat);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? {
                  ...chat,
                  messages: (details.messages || []).map((message) =>
                    mapBackendMessage(message, buildConversationContext(details.conversation))
                  ),
                  lastMsg: details.conversation?.lastMessageText || chat.lastMsg,
                  time: formatTime(
                    details.conversation?.lastMessageAt || details.conversation?.createdAt
                  ),
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Failed to load conversation details", error);
      }
    };

    loadMessages();
  }, [activeChat]);

  // Handle companion contact from pilgrim detail page
  useEffect(() => {
    const companionName = location.state?.contactCompanion;
    if (!companionName) return;

    // Check if a chat already exists for this companion
    const existingIndex = chats.findIndex(
      (c) => c.name.toLowerCase() === companionName.toLowerCase()
    );

    if (existingIndex !== -1) {
      setActiveChat(chats[existingIndex]?.id);
    } else {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newChat = {
        id: chats.length,
        name: companionName,
        role: "Accompagnant",
        lastMsg: "",
        time: currentTime,
        online: false,
        hasReservation: false,
        reservationId: null,
        reservationStatus: null,
        messages: [],
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChat(newChat.id);
    }

    setShowReservations(false);
    // Clear navigation state to avoid re-triggering
    window.history.replaceState({}, document.title);
    // eslint-disable-next-line
  }, [location.state]);

  // Handle guide contact from guides list
  useEffect(() => {
    const guideId = location.state?.contactGuideId;
    if (!guideId) return;

    const openGuideChat = async () => {
      try {
        const res = await getOrCreateAgencyGuideConversation(guideId);
        const conversationId = res?.conversation?.id;
        if (!conversationId) return;

        setChats((prev) => {
          if (prev.some((c) => c.id === conversationId)) return prev;
          const name = location.state?.contactGuideName || "Guide";
          return [
            {
              id: conversationId,
              name,
              role: "Guide",
              lastMsg: "",
              time: "",
              online: false,
              hasReservation: false,
              reservationId: null,
              reservationStatus: null,
              messages: [],
            },
            ...prev,
          ];
        });

        setActiveChat(conversationId);
        setShowReservations(false);

        window.history.replaceState({}, document.title);
      } catch (error) {
        setActionToast({
          open: true,
          type: "error",
          text:
            error.message ||
            "Impossible d'ouvrir la conversation guide. Vérifiez que le guide a un compte actif (guideUserId).",
        });
      }
    };

    openGuideChat();
    // eslint-disable-next-line
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentChat = chats.find((chat) => chat.id === activeChat);
    if (currentChat?.hasReservation && currentChat?.reservationStatus === "pending") return;

    if (!currentChat?.id) return;

    try {
      const response = await sendConversationMessage(currentChat.id, message.trim());
      const nextMessage = mapBackendMessage(
        response.message,
        currentChat.conversationMeta
      );

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChat.id) return chat;
          if (chat.messages.some((msg) => msg.id === nextMessage.id)) return chat;
          return {
            ...chat,
            messages: [...chat.messages, nextMessage],
            lastMsg: nextMessage.text,
            time: nextMessage.time,
          };
        })
      );
      setMessage("");
    } catch (error) {
      setActionToast({
        open: true,
        type: "error",
        text: error.message || "Impossible d'envoyer le message.",
      });
    }
  };

  const handleAcceptReservation = async (reservationId) => {
    const response = await acceptReservationRequest(reservationId);
    const nextReservation = mapReservation(response.reservation);

    setReservations((prev) =>
      prev.map((item) => (item.id === reservationId ? nextReservation : item))
    );
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.reservationId !== reservationId) return chat;
        const nextMessages = response.message
          ? chat.messages.some((msg) => msg.id === response.message.id)
            ? chat.messages
            : [
                ...chat.messages,
                mapBackendMessage(response.message, chat.conversationMeta),
              ]
          : chat.messages;
        return {
          ...chat,
          reservationStatus: "accepted",
          lastMsg: response.message?.content || chat.lastMsg,
          time: response.message ? formatTime(response.message.createdAt) : chat.time,
          messages: nextMessages,
        };
      })
    );
  };

  const handleRejectReservation = async (reservationId) => {
    const response = await rejectReservationRequest(reservationId);
    const nextReservation = mapReservation(response.reservation);

    setReservations((prev) =>
      prev.map((item) => (item.id === reservationId ? nextReservation : item))
    );
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.reservationId !== reservationId) return chat;
        const nextMessages = response.message
          ? chat.messages.some((msg) => msg.id === response.message.id)
            ? chat.messages
            : [
                ...chat.messages,
                mapBackendMessage(response.message, chat.conversationMeta),
              ]
          : chat.messages;
        return {
          ...chat,
          reservationStatus: "rejected",
          lastMsg: response.message?.content || chat.lastMsg,
          time: response.message ? formatTime(response.message.createdAt) : chat.time,
          messages: nextMessages,
        };
      })
    );
  };

  const handleScheduleRDV = (reservationId) => {
    setSelectedReservation(reservationId);
    setAppointmentModalOpen(true);
  };

  const handleFileStudy = (reservationId) => {
    setSelectedReservation(reservationId);
    setFileStudyModalOpen(true);
  };

  const handleAppointmentConfirm = (appointmentData) => {
    console.log("RDV programmé:", appointmentData);
    setActionToast({
      open: true,
      type: "success",
      text: "RDV programmé avec succès !",
    });
    setAppointmentModalOpen(false);
    setSelectedReservation(null);
  };

  const handleFileStudyConfirm = (studyData) => {
    console.log("Étude enregistrée:", studyData);
    setActionToast({
      open: true,
      type: "success",
      text: "Dossier mis à jour !",
    });
    setFileStudyModalOpen(false);
    setSelectedReservation(null);
  };

  const requestReservationDecision = (action, reservationId) => {
    setConfirmDialog({ open: true, action, id: reservationId });
  };

  const handleConfirmDecision = async () => {
    if (!confirmDialog.id || !confirmDialog.action) {
      setConfirmDialog({ open: false, action: null, id: null });
      return;
    }

    try {
      if (confirmDialog.action === "accept") {
        await handleAcceptReservation(confirmDialog.id);
        setActionToast({
          open: true,
          type: "success",
          text: "Réservation confirmée.",
        });
      }

      if (confirmDialog.action === "reject") {
        await handleRejectReservation(confirmDialog.id);
        setActionToast({
          open: true,
          type: "error",
          text: "Réservation refusée.",
        });
      }
    } catch (error) {
      setActionToast({
        open: true,
        type: "error",
        text: error.message || "Impossible de mettre à jour la réservation.",
      });
    }

    setConfirmDialog({ open: false, action: null, id: null });
  };

  const handleContactPilgrim = (chatId) => {
    setActiveChat(chatId);
    setShowReservations(false);
  };

  const currentChat = chats.find((chat) => chat.id === activeChat) || {
    id: null,
    name: "Aucune conversation",
    role: "Pèlerin",
    lastMsg: "",
    time: "",
    online: false,
    hasReservation: false,
    reservationId: null,
    reservationStatus: null,
    messages: [],
  };
  const selectedReservationData = reservations.find((r) => r.id === selectedReservation);
  const reservationDetails = reservations.find((r) => r.id === reservationDetailsId);
  const currentChatReservation = reservations.find((r) => r.id === currentChat?.reservationId);

  const isChatLocked = currentChat?.hasReservation && currentChat?.reservationStatus === "pending";

  const messagerieToggleSx = {
    px: 3,
    color: "white !important",
    backgroundColor: !showReservations ? "#1a1a1a !important" : "transparent !important",
    boxShadow: !showReservations ? 1 : 0,
    opacity: !showReservations ? 1 : 0.7,
  };

  const reservationsToggleSx = {
    px: 3,
    color: "white !important",
    backgroundColor: showReservations ? "#1a1a1a !important" : "transparent !important",
    boxShadow: showReservations ? 1 : 0,
    opacity: showReservations ? 1 : 0.7,
  };

  return (
    <AgencyPageShell>
      <MDBox className="agency-hero reveal-up" mb={3}>
        <MDBox
          display="flex"
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          flexDirection={{ xs: "column", md: "row" }}
          flexWrap="wrap"
          gap={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDBox className="agency-icon-chip">
              <Icon sx={{ color: "white !important", fontSize: "22px !important" }}>forum</Icon>
            </MDBox>
            <MDBox>
              <MDTypography className="agency-hero__title" variant="h5" color="white">
                Messages
              </MDTypography>
              <MDTypography className="agency-hero__subtitle" variant="button" color="white">
                Messagerie et réservations en un seul endroit.
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox
            display="flex"
            p={0.5}
            borderRadius="12px"
            width="fit-content"
            sx={{
              backgroundColor: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <MDButton onClick={() => setShowReservations(false)} sx={messagerieToggleSx}>
              Messagerie
            </MDButton>
            <MDButton onClick={() => setShowReservations(true)} sx={reservationsToggleSx}>
              Réservations ({reservations.length})
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>

      <Card className="reveal-up reveal-up-1">
        <MDBox py={3} px={3}>
          {!showReservations ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "calc(100vh - 300px)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <MDBox p={2} borderBottom="1px solid #eee">
                    <MDInput fullWidth placeholder="Rechercher..." />
                  </MDBox>

                  <MDBox sx={{ overflowY: "auto", flex: 1 }}>
                    {chats.map((chat) => (
                      <MDBox
                        key={chat.id}
                        p={2}
                        display="flex"
                        alignItems="center"
                        sx={{
                          cursor: "pointer",
                          backgroundColor: activeChat === chat.id ? "#f0f2f5" : "transparent",
                          borderLeft:
                            activeChat === chat.id ? "4px solid #4CAF50" : "4px solid transparent",
                          "&:hover": { backgroundColor: "#f8f9fa" },
                        }}
                        onClick={() => setActiveChat(chat.id)}
                      >
                        <MDBox position="relative">
                          <Avatar
                            src={chat.avatarUrl || undefined}
                            sx={{ bgcolor: "success.main" }}
                          >
                            {chat.name[0]}
                          </Avatar>
                          {chat.online && (
                            <MDBox
                              position="absolute"
                              bottom={0}
                              right={0}
                              width="12px"
                              height="12px"
                              borderRadius="50%"
                              bgColor="success"
                              sx={{ border: "2px solid #fff" }}
                            />
                          )}
                        </MDBox>
                        <MDBox ml={2} sx={{ overflow: "hidden", flex: 1 }}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center">
                            <MDBox display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                              <MDTypography
                                variant="button"
                                fontWeight="bold"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {chat.name}
                              </MDTypography>
                              {chat.hasReservation && chat.reservationStatus === "pending" && (
                                <MDTypography variant="caption" fontWeight="bold" color="warning">
                                  En attente
                                </MDTypography>
                              )}
                            </MDBox>
                            <MDTypography variant="caption" color="text">
                              {chat.time}
                            </MDTypography>
                          </MDBox>
                          <MDTypography
                            variant="caption"
                            color="text"
                            fontWeight="regular"
                            sx={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {chat.lastMsg}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    height: "calc(100vh - 300px)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <MDBox p={2} display="flex" alignItems="center" borderBottom="1px solid #eee">
                    <Avatar
                      src={currentChat.avatarUrl || undefined}
                      sx={{ bgcolor: "success.main" }}
                    >
                      {currentChat.name[0]}
                    </Avatar>
                    <MDBox ml={2} flex={1}>
                      <MDTypography variant="button" fontWeight="bold" display="block">
                        {currentChat.name}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {currentChat.role} • {currentChat.online ? "En ligne" : "Hors ligne"}
                      </MDTypography>
                    </MDBox>
                    <MDButton
                      variant="text"
                      color="dark"
                      onClick={() => {
                        if (!currentChatReservation) return;
                        setReservationDetailsId(currentChatReservation.id);
                        setOpenReservationDetails(true);
                      }}
                      disabled={!currentChatReservation}
                      sx={{ minWidth: 40, px: 1 }}
                    >
                      <Icon>info</Icon>
                    </MDButton>
                  </MDBox>

                  <MDBox
                    p={3}
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      backgroundColor: "#f8f9fa",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {currentChat.messages.map((msg) => (
                      <MDBox
                        key={msg.id}
                        alignSelf={msg.type === "out" ? "flex-end" : "flex-start"}
                        maxWidth="70%"
                      >
                        {msg.type === "in" && msg.senderName ? (
                          <MDBox mb={0.5} ml={0.5}>
                            <MDTypography variant="caption" fontWeight="bold" color="dark">
                              {msg.senderName}
                            </MDTypography>
                            {msg.senderRole ? (
                              <MDTypography variant="caption" color="text" display="block">
                                {msg.senderRole}
                              </MDTypography>
                            ) : null}
                          </MDBox>
                        ) : null}
                        <MDBox
                          p={1.5}
                          borderRadius="lg"
                          sx={{
                            backgroundColor: msg.type === "out" ? "#1a1a1a" : "#fff",
                            color: msg.type === "out" ? "#fff" : "#344767",
                            boxShadow: 1,
                          }}
                        >
                          <MDTypography variant="button" color="inherit">
                            {msg.text}
                          </MDTypography>
                        </MDBox>
                        <MDTypography
                          variant="caption"
                          color="text"
                          align={msg.type === "out" ? "right" : "left"}
                          display="block"
                          mt={0.5}
                        >
                          {msg.time}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>

                  <MDBox p={2} borderTop="1px solid #eee">
                    {isChatLocked ? (
                      <MDBox>
                        <MDTypography variant="caption" color="warning" display="block">
                          Votre réservation est en attente de validation par l&apos;agence.
                        </MDTypography>
                        <MDTypography variant="caption" color="warning" display="block">
                          La messagerie est temporairement désactivée jusqu&apos;à
                          l&apos;acceptation.
                        </MDTypography>
                        <MDTypography variant="caption" color="warning" display="block">
                          Dès que la réservation est confirmée, vous pourrez envoyer des messages.
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <MDBox display="flex" gap={2}>
                        <MDInput
                          fullWidth
                          placeholder="Tapez votre message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                        />
                        <MDButton
                          variant="contained"
                          sx={{
                            backgroundColor: "#4CAF50",
                            color: "white !important",
                            "&:hover": { backgroundColor: "#388E3C" },
                          }}
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                        >
                          Envoyer
                        </MDButton>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <MDBox display="flex" flexDirection="column" gap={1.5}>
                  {reservations.map((reservation) => (
                    <Card
                      key={reservation.id}
                      onClick={() => setReservationDetailsId(reservation.id)}
                      sx={{
                        p: 1.75,
                        cursor: "pointer",
                        borderRadius: 2,
                        border:
                          reservationDetailsId === reservation.id
                            ? "1px solid rgba(46, 125, 50, 0.45)"
                            : "1px solid rgba(0,0,0,0.06)",
                        backgroundColor:
                          reservation.status === "pending"
                            ? "#fffdf5"
                            : reservation.status === "accepted"
                            ? "#f6fff7"
                            : "#fffafa",
                      }}
                    >
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                          <MDTypography variant="button" fontWeight="bold" color="dark">
                            {reservation.pilgrimName}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {reservation.packageName}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color={
                              reservation.status === "pending"
                                ? "warning"
                                : reservation.status === "accepted"
                                ? "success"
                                : "error"
                            }
                          >
                            {reservation.status === "pending"
                              ? "En attente"
                              : reservation.status === "accepted"
                              ? "Confirmée"
                              : "Refusée"}
                          </MDTypography>
                        </MDBox>
                        {reservation.status === "pending" && (
                          <MDBox display="flex" gap={1}>
                            <MDButton
                              size="small"
                              variant="contained"
                              sx={{ backgroundColor: "#4CAF50", color: "white !important" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                requestReservationDecision("accept", reservation.id);
                              }}
                            >
                              Accepter
                            </MDButton>
                          </MDBox>
                        )}
                      </MDBox>
                    </Card>
                  ))}
                </MDBox>
              </Grid>
              <Grid item xs={12} md={7}>
                {reservationDetails ? (
                  <MDBox>
                    <ReservationCard
                      reservation={reservationDetails}
                      onAccept={(id) => requestReservationDecision("accept", id)}
                      onReject={(id) => requestReservationDecision("reject", id)}
                      onScheduleRDV={handleScheduleRDV}
                      onContactPilgrim={(id) => {
                        const res = reservations.find((r) => r.id === id);
                        if (!res) return;
                        const chat = chats.find((c) => c.name === res.pilgrimName);
                        if (chat) handleContactPilgrim(chat.id);
                      }}
                    />
                  </MDBox>
                ) : (
                  <Card sx={{ p: 3, textAlign: "center" }}>
                    <MDTypography variant="button" color="text">
                      Sélectionnez une réservation pour voir les détails.
                    </MDTypography>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          <AppointmentScheduleModal
            open={appointmentModalOpen}
            onClose={() => setAppointmentModalOpen(false)}
            onConfirm={handleAppointmentConfirm}
          />

          <FileStudyModal
            open={fileStudyModalOpen}
            onClose={() => setFileStudyModalOpen(false)}
            onConfirm={handleFileStudyConfirm}
          />

          <Dialog open={openReservationDetails} onClose={() => setOpenReservationDetails(false)}>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogContent>
              {reservationDetails ? (
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold" mb={1}>
                    Détails de la réservation
                  </MDTypography>
                  <ReservationCard
                    reservation={reservationDetails}
                    onAccept={(id) => requestReservationDecision("accept", id)}
                    onReject={(id) => requestReservationDecision("reject", id)}
                    onScheduleRDV={handleScheduleRDV}
                    onContactPilgrim={(id) => {
                      const res = reservations.find((r) => r.id === id);
                      if (!res) return;
                      const chat = chats.find((c) => c.name === res.pilgrimName);
                      if (chat) {
                        handleContactPilgrim(chat.id);
                        setOpenReservationDetails(false);
                      }
                    }}
                  />
                </MDBox>
              ) : (
                <MDTypography variant="button" color="text">
                  Aucune réservation liée.
                </MDTypography>
              )}
            </DialogContent>
            <DialogActions>
              <MDButton onClick={() => setOpenReservationDetails(false)} color="dark">
                Fermer
              </MDButton>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, action: null, id: null })}
            fullWidth
          >
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent>
              <MDTypography variant="button" color="text">
                {confirmDialog.action === "accept"
                  ? "Voulez-vous accepter cette réservation ?"
                  : "Voulez-vous refuser cette réservation ?"}
              </MDTypography>
            </DialogContent>
            <DialogActions>
              <MDButton
                onClick={() => setConfirmDialog({ open: false, action: null, id: null })}
                color="dark"
              >
                Annuler
              </MDButton>
              <MDButton
                onClick={handleConfirmDecision}
                variant="contained"
                sx={{
                  backgroundColor: confirmDialog.action === "accept" ? "#4CAF50" : "#F44336",
                  color: "white !important",
                }}
              >
                Confirmer
              </MDButton>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={actionToast.open}
            autoHideDuration={2500}
            onClose={() => setActionToast((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              severity={actionToast.type}
              onClose={() => setActionToast((prev) => ({ ...prev, open: false }))}
              sx={{ width: "100%" }}
            >
              {actionToast.text}
            </Alert>
          </Snackbar>
        </MDBox>
      </Card>
    </AgencyPageShell>
  );
}

export default AgencyMessages;
