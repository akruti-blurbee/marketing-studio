/**
 * Typed auth API functions — all calls go through the apiFetch wrapper.
 */

import { apiFetch } from "./api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: AuthUser;
  message?: string;
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

export async function signUp(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ message: string; email: string }> {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Verify OTP ────────────────────────────────────────────────────────────────

export async function verifyOtp(params: {
  email: string;
  code: string;
}): Promise<AuthTokenResponse> {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Resend OTP ────────────────────────────────────────────────────────────────

export async function resendOtp(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function logIn(params: {
  email: string;
  password: string;
}): Promise<AuthTokenResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refreshToken(): Promise<AuthTokenResponse> {
  return apiFetch("/auth/refresh", { method: "POST" });
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logOut(): Promise<{ message: string }> {
  return apiFetch("/auth/logout", { method: "POST" });
}

// ── Get current user ──────────────────────────────────────────────────────────

export async function getMe(): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/me");
}

// ── Google OAuth redirect ─────────────────────────────────────────────────────
// Navigates the browser to the backend Google OAuth flow.

export function redirectToGoogleLogin() {
  window.location.href = "/auth/google";
}
