import { io } from "socket.io-client/dist/socket.io.js";
import { BACKEND_URL } from "./reservationMessagingApi";
import { getAccessToken } from "../auth/adminAgenceAuth";

export function createAdminMessagingSocket() {
  return io(`${BACKEND_URL}/messaging`, {
    transports: ["websocket"],
    auth: {
      token: getAccessToken(),
    },
  });
}
