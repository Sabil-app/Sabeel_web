import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Stack from "@mui/material/Stack";

import {
  createNotificationsSocket,
  fetchMyNotifications,
  markNotificationRead,
} from "api/notificationsApi";
import { getAccessToken } from "auth/adminAgenceAuth";

const severityForType = (type) => {
  switch (type) {
    case "agency_submission":
    case "guide_submission":
      return "info";
    case "sos":
    case "sos_alert":
      return "error";
    case "reservation":
      return "success";
    case "chat":
    case "admin_message":
      return "warning";
    default:
      return "info";
  }
};

function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const reloadTimer = useRef(null);

  const loadUnread = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const res = await fetchMyNotifications({ limit: 30, offset: 0 });
      const items = Array.isArray(res?.items) ? res.items : [];
      setNotifications(items.filter((n) => !n.readAt));
    } catch (e) {
      // ignore – keep showing whatever is already displayed
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) return undefined;

    loadUnread();

    let socket;
    try {
      socket = createNotificationsSocket();
      socket.on("new_notification", () => {
        // Persistence happens asynchronously on the backend; give it a moment
        // so the reloaded list contains the new record (with its id).
        if (reloadTimer.current) clearTimeout(reloadTimer.current);
        reloadTimer.current = setTimeout(() => loadUnread(), 700);
      });
    } catch (e) {
      // socket optional
    }

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      if (socket) socket.disconnect();
    };
  }, [loadUnread]);

  const handleDismiss = async (notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    try {
      if (notification.id) await markNotificationRead(notification.id);
    } catch (e) {
      // ignore
    }
  };

  const handleOpen = async (notification) => {
    const link = notification?.data?.link;
    await handleDismiss(notification);
    if (link) navigate(link);
  };

  if (!notifications.length) return null;

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 2000,
        width: { xs: "calc(100% - 32px)", sm: 380 },
        maxHeight: "85vh",
        overflowY: "auto",
      }}
    >
      {notifications.map((notification) => {
        const type = notification?.data?.type;
        const hasLink = Boolean(notification?.data?.link);
        return (
          <Alert
            key={notification.id}
            severity={severityForType(type)}
            variant="filled"
            icon={<Icon>notifications_active</Icon>}
            sx={{ boxShadow: 4, borderRadius: 2, alignItems: "flex-start" }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => handleDismiss(notification)}
                sx={{ fontWeight: "bold" }}
              >
                OK
              </Button>
            }
          >
            <AlertTitle sx={{ fontWeight: "bold", mb: 0.5 }}>{notification.title}</AlertTitle>
            {notification.body}
            {hasLink && (
              <Button
                color="inherit"
                size="small"
                onClick={() => handleOpen(notification)}
                sx={{ display: "block", mt: 1, pl: 0, textDecoration: "underline" }}
              >
                Voir
              </Button>
            )}
          </Alert>
        );
      })}
    </Stack>
  );
}

export default NotificationCenter;
