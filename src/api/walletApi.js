import { apiRequest } from "./apiClient";

export function formatWalletMoney(amountMillimes, currency = "TND") {
  const amount = typeof amountMillimes === "number" ? amountMillimes : 0;
  const cur = String(currency || "TND").toUpperCase();
  const divisor = cur === "TND" ? 1000 : 100;
  return `${(amount / divisor).toFixed(2)} ${cur}`;
}

export function buildIdempotencyKey(prefix = "adm") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function fetchAdminWalletOverview() {
  return apiRequest("/wallet/admin/overview");
}

export async function fetchAdminWalletTransactions(limit = 50, offset = 0) {
  return apiRequest(`/wallet/admin/transactions?limit=${limit}&offset=${offset}`);
}

export async function fetchAdminPresentielCommissions(limit = 100, offset = 0) {
  return apiRequest(`/wallet/admin/presentiel-commissions?limit=${limit}&offset=${offset}`);
}

export async function requestAdminWalletWithdrawal({ amountCents, idempotencyKey }) {
  return apiRequest("/wallet/admin/withdrawal/request", {
    method: "POST",
    body: { amountCents, idempotencyKey },
  });
}

export async function fetchWalletMe() {
  return apiRequest("/wallet/me");
}

export async function fetchWalletTransactions(limit = 50, offset = 0) {
  return apiRequest(`/wallet/transactions?limit=${limit}&offset=${offset}`);
}

export async function requestWalletWithdrawal({ amountCents, idempotencyKey }) {
  return apiRequest("/wallet/withdrawal/request", {
    method: "POST",
    body: { amountCents, idempotencyKey },
  });
}

export async function fetchConnectStatus() {
  return apiRequest("/payments/connect/status");
}

export async function createConnectOnboardingLink(ownerType = "AGENCY") {
  return apiRequest("/payments/connect/onboarding-link", {
    method: "POST",
    body: { ownerType },
  });
}
