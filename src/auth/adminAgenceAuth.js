import { apiRequest, BACKEND_URL, fetchWithTimeout } from "api/apiClient";

const API_BASE_URL = `${BACKEND_URL}/admin-agence/auth`;
const STORAGE_KEY = "sabeel_admin_agence_auth";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function isSessionExpired(authData) {
  if (!authData?.sessionStartedAt) {
    console.warn("[AdminAuth] isSessionExpired: sessionStartedAt missing, assuming valid for now");
    return false;
  }

  const elapsed = Date.now() - Number(authData.sessionStartedAt);
  const expired = elapsed >= SESSION_DURATION_MS;

  if (expired) {
    console.log("[AdminAuth] isSessionExpired: session has expired", {
      elapsed,
      duration: SESSION_DURATION_MS,
    });
  }

  return expired;
}

export function getStoredAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const authData = raw ? JSON.parse(raw) : null;

    if (authData && isSessionExpired(authData)) {
      clearAuth();
      return null;
    }

    return authData;
  } catch (error) {
    return null;
  }
}

export function storeAuth(authData) {
  const currentAuth = getStoredAuth();

  // Ensure we don't lose sessionStartedAt if it exists in currentAuth
  const sessionStartedAt = authData.sessionStartedAt || currentAuth?.sessionStartedAt || Date.now();

  const nextAuth = {
    ...currentAuth,
    ...authData,
    sessionStartedAt: Number(sessionStartedAt),
  };

  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("token");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));

  console.log("[AdminAuth] storeAuth success", {
    hasAccessToken: Boolean(nextAuth?.accessToken),
    activeRole: nextAuth?.user?.activeRole,
    sessionStartedAt: nextAuth?.sessionStartedAt,
  });
}

export function clearAuth() {
  console.log("[AdminAuth] clearAuth triggered - clearing local storage");
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("token");
  window.localStorage.removeItem(STORAGE_KEY);
}

export const getAccessToken = () => {
  return getStoredAuth()?.accessToken || "";
};

export const getCurrentUser = () => {
  return getStoredAuth()?.user || null;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

export async function signInAdminAgence(payload) {
  const data = await apiRequest("/admin-agence/auth/login", {
    method: "POST",
    body: payload,
  });

  if (data?.mfaRequired) {
    clearAuth();
    return data;
  }

  if (!data?.accessToken || !data?.user) {
    throw new Error("Réponse de connexion invalide");
  }

  storeAuth({
    accessToken: data.accessToken,
    user: data.user,
  });
  return data;
}

export async function forgotPasswordAdminAgence(email) {
  return apiRequest("/admin-agence/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function verifyOtpAdminAgence(email, otp) {
  return apiRequest("/admin-agence/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export async function resetPasswordAdminAgence(email, otp, password) {
  return apiRequest("/admin-agence/auth/reset-password", {
    method: "POST",
    body: { email, otp, password },
  });
}

export async function uploadMyProfileImage(file) {
  console.log("[uploadMyProfileImage] Received file:", file);
  const authData = getStoredAuth();

  if (!authData?.accessToken) {
    throw new Error("Session expired, please sign in again");
  }

  if (!file) {
    console.error("[uploadMyProfileImage] No file provided");
    throw new Error("File is required");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(
    `${BACKEND_URL}/admin-agence/auth/me/profile-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
      body: formData,
    },
    120000
  );

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuth();
    }
    const message =
      data.message ||
      (Array.isArray(data.message) ? data.message.join(", ") : null) ||
      `Unable to upload profile image (${response.status})`;
    throw new Error(message);
  }

  storeAuth({
    accessToken: authData.accessToken,
    user: data.user,
    sessionStartedAt: authData.sessionStartedAt,
  });

  return data.user;
}

export async function uploadMyCoverImage(file) {
  const authData = getStoredAuth();

  if (!authData?.accessToken) {
    throw new Error("Session expired, please sign in again");
  }

  if (!file) {
    throw new Error("File is required");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(
    `${BACKEND_URL}/admin-agence/auth/me/cover-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
      body: formData,
    },
    120000
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuth();
    }
    throw new Error(data.message || "Unable to upload cover image");
  }

  storeAuth({
    accessToken: authData.accessToken,
    user: data.user,
    sessionStartedAt: authData.sessionStartedAt,
  });

  return data.user;
}

export async function fetchAgencyGuides() {
  const data = await apiRequest("/admin-agence/guides/me");
  return data.guides || [];
}

export async function createAgencyGuide(payload) {
  const data = await apiRequest("/admin-agence/guides", {
    method: "POST",
    body: payload,
  });
  return data.guide;
}

export async function updateAgencyGuide(guideId, payload) {
  const data = await apiRequest(`/admin-agence/guides/${guideId}`, {
    method: "PATCH",
    body: payload,
  });
  return data.guide;
}

export async function deleteAgencyGuide(guideId) {
  return apiRequest(`/admin-agence/guides/${guideId}`, {
    method: "DELETE",
  });
}

export async function fetchAllGuides(type = "all") {
  const data = await apiRequest(`/admin-agence/guides?type=${encodeURIComponent(type)}`);
  return data.guides || [];
}

export async function verifyGuideDocuments(guideId) {
  return apiRequest(`/admin-agence/guides/${guideId}/verify-documents`, {
    method: "POST",
  });
}

export async function rejectGuideDocuments(guideId, reason) {
  return apiRequest(`/admin-agence/guides/${guideId}/reject-documents`, {
    method: "POST",
    body: { reason },
  });
}

export async function fetchAllPilgrimsForAdmin() {
  const data = await apiRequest("/sabeel/auth/admin/pilgrims");
  return data.pilgrims || [];
}

export async function fetchAdminDashboardOverview() {
  return apiRequest("/admin-agence/dashboard/overview");
}

export async function fetchWalletSummary() {
  return apiRequest("/wallet/me");
}

export async function fetchWalletTransactions(limit = 50, offset = 0) {
  return apiRequest(`/wallet/transactions?limit=${limit}&offset=${offset}`);
}

export async function signUpAgence(payload) {
  const data = await apiRequest("/admin-agence/auth/signup/agence", {
    method: "POST",
    body: payload,
  });

  storeAuth({
    accessToken: data.accessToken,
    user: data.user,
  });
  return data;
}

export async function fetchCurrentProfile() {
  const authData = getStoredAuth();

  if (!authData?.accessToken) {
    console.warn("[AdminAuth] fetchCurrentProfile aborted: no access token in storage");
    throw new Error("Session expired, please sign in again");
  }

  let data;
  try {
    console.log("[AdminAuth] fetchCurrentProfile request", {
      hasAccessToken: true,
      activeRole: authData?.user?.activeRole,
    });
    data = await apiRequest("/admin-agence/auth/me");
  } catch (error) {
    console.error("[AdminAuth] fetchCurrentProfile failed", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }

  storeAuth({
    accessToken: authData.accessToken,
    user: data.user,
    sessionStartedAt: authData.sessionStartedAt,
  });

  return data.user;
}

export async function createSubAdmin(payload) {
  return apiRequest("/admin-agence/auth/sub-admin", {
    method: "POST",
    body: payload,
  });
}

export async function updateSubAdmin(adminId, payload) {
  return apiRequest(`/admin-agence/auth/sub-admin/${adminId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteSubAdmin(adminId) {
  return apiRequest(`/admin-agence/auth/sub-admin/${adminId}`, {
    method: "DELETE",
  });
}

export async function fetchAdmins() {
  const data = await apiRequest("/admin-agence/auth/admins");
  return data.admins || [];
}

export async function submitAgencyProfileCompletion(payload) {
  const authData = getStoredAuth();

  if (!authData?.accessToken) {
    throw new Error("Session expired, please sign in again");
  }

  const formData = new FormData();
  formData.append("agencyType", payload.agencyType || "");
  formData.append("responsibleName", payload.responsibleName || "");
  formData.append("responsibleTitle", payload.responsibleTitle || "");
  formData.append("contractDuration", `${payload.contractDuration || ""}`);
  formData.append("submissionStatus", payload.submissionStatus || "pending");
  formData.append("documentLabels", JSON.stringify(payload.documentLabels || []));
  formData.append("contractFileName", payload.contractFileName || "contract");

  (payload.documents || []).forEach((file) => {
    formData.append("documents", file);
  });

  if (payload.contractFile) {
    formData.append("contract", payload.contractFile);
  }

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/agency-profile-completion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
      body: formData,
    },
    240000
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuth();
    }

    throw new Error(data.message || "Unable to submit agency profile");
  }

  storeAuth({
    accessToken: authData.accessToken,
    user: data.user,
    sessionStartedAt: authData.sessionStartedAt,
  });

  return data;
}

export async function fetchAgencySubmissions() {
  const data = await apiRequest("/admin-agence/auth/agencies/submissions");
  return data.agencies || [];
}

export async function fetchAllAgenciesForAdmin() {
  const data = await apiRequest("/admin-agence/auth/agencies/submissions");
  return data.agencies || [];
}

export async function fetchAgencyById(agencyId) {
  const data = await apiRequest(`/admin-agence/auth/agencies/${agencyId}`);
  return data.agency;
}

export async function verifyAgencySubmission(agencyId) {
  return apiRequest(`/admin-agence/auth/agencies/${agencyId}/verify`, {
    method: "POST",
  });
}

export async function rejectAgencySubmission(agencyId) {
  return apiRequest(`/admin-agence/auth/agencies/${agencyId}/reject`, {
    method: "POST",
  });
}

export async function fetchAgencyPackUmrah() {
  const data = await apiRequest("/admin-agence/pack-umrah/me");
  return data.packs || [];
}

export async function createPackUmrah(payload) {
  const data = await apiRequest("/admin-agence/pack-umrah", {
    method: "POST",
    body: payload,
  });
  return data.pack;
}

export async function updatePackUmrah(packId, payload) {
  const data = await apiRequest(`/admin-agence/pack-umrah/${packId}`, {
    method: "PATCH",
    body: payload,
  });
  return data.pack;
}

export async function deletePackUmrah(packId) {
  return apiRequest(`/admin-agence/pack-umrah/${packId}`, {
    method: "DELETE",
  });
}

export async function fetchAdminPackUmrah() {
  const data = await apiRequest("/admin-agence/pack-umrah");
  return data.packs || [];
}

export async function approvePackUmrah(packId) {
  const data = await apiRequest(`/admin-agence/pack-umrah/${packId}/approve`, {
    method: "POST",
  });
  return data.pack;
}

export async function rejectPackUmrah(packId) {
  const data = await apiRequest(`/admin-agence/pack-umrah/${packId}/reject`, {
    method: "POST",
  });
  return data.pack;
}

export async function fetchAgencyPackUmrahCountForAdmin(agencyId) {
  const data = await apiRequest(`/admin-agence/pack-umrah/agency/${agencyId}/count`);
  return data.count ?? 0;
}

export async function fetchAgencyPackUmrahForAdmin(agencyId) {
  const data = await apiRequest(`/admin-agence/pack-umrah/agency/${agencyId}`);
  return data.packs || [];
}

export async function fetchPackUmrahByIdForAdmin(packId) {
  const data = await apiRequest(`/admin-agence/pack-umrah/${packId}`);
  return data.pack;
}

export function getHomeRouteForRole(role) {
  return role === "agence" ? "/agency/dashboard" : "/dashboard";
}

export async function generate2FA() {
  return apiRequest("/admin-agence/auth/2fa/generate", { method: "POST" });
}

export async function enable2FA(code) {
  return apiRequest("/admin-agence/auth/2fa/enable", {
    method: "POST",
    body: { code },
  });
}

export async function disable2FA() {
  return apiRequest("/admin-agence/auth/2fa/disable", { method: "POST" });
}

export async function verify2FALogin(userId, code) {
  console.log("[AdminAuth] verify2FALogin starting", { userId });
  const data = await apiRequest("/admin-agence/auth/2fa/verify-login", {
    method: "POST",
    body: { userId, code },
  });

  if (!data?.accessToken || !data?.user) {
    console.error("[AdminAuth] verify2FALogin failed: invalid response data", data);
    throw new Error("Réponse de vérification 2FA invalide");
  }

  // Explicitly clear before storing new auth to ensure a fresh session start
  clearAuth();

  storeAuth({
    accessToken: data.accessToken,
    user: data.user,
    sessionStartedAt: Date.now(), // Force a fresh session start time
  });

  console.log("[AdminAuth] verify2FALogin success", {
    userId,
    activeRole: data?.user?.activeRole,
  });

  return data;
}

export async function changePasswordAdmin(oldPassword, newPassword) {
  return apiRequest("/admin-agence/auth/change-password", {
    method: "POST",
    body: { oldPassword, newPassword },
  });
}

// Complaints
export async function sendComplaint(complaintData) {
  return apiRequest("/admin-agence/complaints", {
    method: "POST",
    body: complaintData,
  });
}

export async function fetchComplaints() {
  return apiRequest("/admin-agence/complaints");
}

export async function updateComplaintStatus(id, status) {
  return apiRequest(`/admin-agence/complaints/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

// Groups
export async function fetchGroups() {
  return apiRequest("/admin-agence/groups");
}

export async function createGroup(groupData) {
  return apiRequest("/admin-agence/groups", {
    method: "POST",
    body: groupData,
  });
}

export async function updateGroup(id, groupData) {
  return apiRequest(`/admin-agence/groups/${id}`, {
    method: "PATCH",
    body: groupData,
  });
}

export async function archiveGroup(id) {
  return apiRequest(`/admin-agence/groups/${id}/archive`, {
    method: "POST",
  });
}

export async function unarchiveGroup(id) {
  return apiRequest(`/admin-agence/groups/${id}/unarchive`, {
    method: "POST",
  });
}

export async function deleteGroup(id) {
  return apiRequest(`/admin-agence/groups/${id}`, {
    method: "DELETE",
  });
}

export async function fetchGroupById(id) {
  return apiRequest(`/admin-agence/groups/${id}`);
}

export async function fetchAvailablePilgrims() {
  return apiRequest("/admin-agence/groups/available-pilgrims");
}

export async function assignPilgrimsToGroup(groupId, pilgrimIds) {
  return apiRequest(`/admin-agence/groups/${groupId}/assign-pilgrims`, {
    method: "POST",
    body: { pilgrimIds },
  });
}

export async function removePilgrimFromGroup(groupId, pilgrimId) {
  return apiRequest(`/admin-agence/groups/${groupId}/pilgrims/${pilgrimId}`, {
    method: "DELETE",
  });
}

export async function fetchConfirmedPilgrims() {
  return apiRequest("/admin-agence/bookings/confirmed");
}
