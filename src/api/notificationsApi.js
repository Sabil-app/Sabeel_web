import { io } from "socket.io-client/dist/socket.io.js";
import { apiRequest, BACKEND_URL } from "./apiClient";
import { getAccessToken } from "../auth/adminAgenceAuth";

export async function fetchMyNotifications({ limit = 30, offset = 0 } = {}) {
  return apiRequest(`/notifications/me?limit=${limit}&offset=${offset}`);
}

export async function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiRequest("/notifications/me/mark-all-read", { method: "POST" });
}

export function createNotificationsSocket() {
  return io(`${BACKEND_URL}/notifications`, {
    transports: ["websocket"],
    auth: {
      token: getAccessToken(),
    },
  });
}

export { BACKEND_URL };
