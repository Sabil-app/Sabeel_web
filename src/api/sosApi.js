import { apiRequest } from "./apiClient";

export async function fetchAgencySosAlerts() {
  const data = await apiRequest("/sos/agency/alerts");
  return data.alerts || [];
}

export async function updateAgencySosAlertStatus(alertId, status) {
  return apiRequest(`/sos/agency/alerts/${alertId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function addAgencySosAlertNote(alertId, text) {
  return apiRequest(`/sos/agency/alerts/${alertId}/notes`, {
    method: "POST",
    body: { text },
  });
}
