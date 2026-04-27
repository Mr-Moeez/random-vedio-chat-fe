import apiClient from "./apiClient";

export async function signup(payload) {
  const response = await apiClient.post("/accounts/signup/", payload);
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post("/accounts/login/", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get("/accounts/me/");
  return response.data;
}