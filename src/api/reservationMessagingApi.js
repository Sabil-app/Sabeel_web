import { apiRequest, BACKEND_URL } from "./apiClient";

export async function fetchAgencyReservations() {
  return apiRequest("/sabeel/reservations/agency");
}

export async function acceptReservationRequest(reservationId) {
  return apiRequest(`/sabeel/reservations/${reservationId}/accept`, {
    method: "POST",
  });
}

export async function rejectReservationRequest(reservationId) {
  return apiRequest(`/sabeel/reservations/${reservationId}/reject`, {
    method: "POST",
  });
}

export async function fetchMyConversations() {
  return apiRequest("/messaging/conversations");
}

export async function fetchSupportConversations() {
  return apiRequest("/messaging/support/conversations");
}

export async function fetchConversationDetails(conversationId) {
  return apiRequest(`/messaging/conversations/${conversationId}`);
}

export async function getOrCreateAgencyGuideConversation(guideId) {
  return apiRequest("/messaging/conversations/agency-guide", {
    method: "POST",
    body: { guideId },
  });
}

export async function getOrCreateSupportConversation(targetRole, targetId) {
  return apiRequest("/messaging/support/conversations", {
    method: "POST",
    body: { targetRole, targetId },
  });
}

export async function sendConversationMessage(conversationId, content) {
  return apiRequest(`/messaging/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { content },
  });
}

export { BACKEND_URL };
