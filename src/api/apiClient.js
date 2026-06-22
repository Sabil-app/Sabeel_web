const DEFAULT_BACKEND_URL = "http://localhost:3000";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || DEFAULT_BACKEND_URL;

export const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Vérifiez que le backend est démarré et accessible.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const getToken = () => {
  const adminAuthRaw = localStorage.getItem("sabeel_admin_agence_auth");
  if (adminAuthRaw) {
    try {
      const authData = JSON.parse(adminAuthRaw);
      if (authData?.accessToken) {
        console.log("[AdminApi] getToken from admin storage", {
          hasAccessToken: true,
          activeRole: authData?.user?.activeRole,
        });
        return authData.accessToken;
      }
    } catch (err) {
      console.error("Error parsing admin auth data:", err);
    }
  }

  const simpleToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
  if (simpleToken) {
    console.warn("[AdminApi] getToken falling back to legacy token storage");
    return simpleToken;
  }

  console.warn("[AdminApi] getToken found no token");
  return null;
};

const apiClient = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const url = `${BACKEND_URL}${endpoint}`;

  try {
    console.log("[AdminApi] request", {
      endpoint,
      method: config.method || "GET",
      hasAuthorization: Boolean(headers["Authorization"]),
    });
    const response = await fetchWithTimeout(url, config);
    const data = await response.json().catch(() => ({}));

    console.log("[AdminApi] response", {
      endpoint,
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw { message: data.message || "Request failed", status: response.status, data };
    }

    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

const formatApiErrorMessage = (message, fallback) => {
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallback;
};

export const apiUpload = async (endpoint, formData) => {
  const token = getToken();

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  const url = `${BACKEND_URL}${endpoint}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers,
        body: formData,
      },
      120000
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        formatApiErrorMessage(errorData.message, `Échec de l'upload (HTTP ${response.status}).`)
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API upload failed:", error);
    throw error;
  }
};

export const apiRequest = apiClient;

export default apiClient;
