import { useCallback, useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import {
  createNotificationsSocket,
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "api/notificationsApi";

const iconForType = (type) => {
  switch (type) {
    case "agency_submission":
      return "storefront";
    case "guide_submission":
      return "groups";
    case "reservation":
      return "event_available";
    case "chat":
    case "admin_message":
      return "chat";
    case "sos":
    case "sos_alert":
      return "sos";
    case "review":
      return "star";
    default:
      return "notifications";
  }
};

const colorForType = (type) => {
  switch (type) {
    case "sos":
    case "sos_alert":
      return "error.main";
    case "reservation":
      return "success.main";
    case "chat":
    case "admin_message":
      return "warning.main";
    default:
      return "info.main";
  }
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("fr-FR");
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMyNotifications({ limit: 100, offset: 0 });
      setNotifications(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    let socket;
    let timer;
    try {
      socket = createNotificationsSocket();
      socket.on("new_notification", () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => load(), 700);
      });
    } catch (e) {
      // socket optional
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (socket) socket.disconnect();
    };
  }, [load]);

  const handleMarkRead = async (notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    try {
      await markNotificationRead(notification.id);
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    try {
      await markAllNotificationsRead();
    } catch (e) {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={9}>
            <Card>
              <MDBox
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <MDBox display="flex" alignItems="center" gap={1}>
                  <MDTypography variant="h5">Notifications</MDTypography>
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} non lue(s)`} color="success" size="small" />
                  )}
                </MDBox>
                <MDBox display="flex" gap={1}>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    size="small"
                    onClick={load}
                    startIcon={<Icon>refresh</Icon>}
                  >
                    Actualiser
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="success"
                    size="small"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    startIcon={<Icon>done_all</Icon>}
                  >
                    Tout marquer lu
                  </MDButton>
                </MDBox>
              </MDBox>
              <Divider />

              <MDBox p={2}>
                {loading && (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="button" color="text">
                      Chargement des notifications...
                    </MDTypography>
                  </MDBox>
                )}

                {!loading && notifications.length === 0 && (
                  <MDBox p={4} textAlign="center">
                    <Icon sx={{ fontSize: "48px !important", color: "grey-400" }}>
                      notifications_off
                    </Icon>
                    <MDTypography variant="h6" color="text" mt={1}>
                      Aucune notification
                    </MDTypography>
                  </MDBox>
                )}

                {!loading &&
                  notifications.map((notification) => {
                    const type = notification?.data?.type;
                    const isUnread = !notification.readAt;
                    return (
                      <MDBox
                        key={notification.id}
                        display="flex"
                        alignItems="flex-start"
                        gap={1.5}
                        p={1.5}
                        mb={1}
                        sx={{
                          borderRadius: 2,
                          backgroundColor: isUnread ? "rgba(46,125,50,0.06)" : "transparent",
                          border: "1px solid",
                          borderColor: isUnread ? "success.main" : "grey-200",
                        }}
                      >
                        <MDBox
                          width={40}
                          height={40}
                          borderRadius="50%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          sx={{ backgroundColor: colorForType(type), flexShrink: 0 }}
                        >
                          <Icon sx={{ color: "white !important" }}>{iconForType(type)}</Icon>
                        </MDBox>
                        <MDBox flex={1} minWidth={0}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center">
                            <MDTypography variant="button" fontWeight="bold">
                              {notification.title}
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {formatDate(notification.createdAt)}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="caption" color="text" display="block">
                            {notification.body}
                          </MDTypography>
                        </MDBox>
                        {isUnread && (
                          <MDButton
                            variant="text"
                            color="success"
                            size="small"
                            onClick={() => handleMarkRead(notification)}
                          >
                            OK
                          </MDButton>
                        )}
                      </MDBox>
                    );
                  })}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
