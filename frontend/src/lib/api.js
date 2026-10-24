import axios from "axios";

const rawBackendUrl = process.env.REACT_APP_BACKEND_URL || "";
const cleanBackendUrl = rawBackendUrl.replace(/\/+$/, "");
export const API = cleanBackendUrl ? `${cleanBackendUrl}/api` : "/api";

const TOKEN_KEY = "sentinel_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export async function verifyPassword(password) {
  const res = await axios.get(`${API}/admin/verify`, {
    headers: { Authorization: `Bearer ${password}` },
  });
  return res.data;
}

// Stats
export const getStats = () => client.get("/admin/stats").then((r) => r.data);

// Users
export const getUsers = (params) => client.get("/admin/users", { params }).then((r) => r.data);
export const getUserDetails = (id) => client.get(`/admin/users/${id}`).then((r) => r.data);
export const createUser = (body) => client.post("/admin/users", body).then((r) => r.data);
export const updateUser = (id, body) => client.put(`/admin/users/${id}`, body).then((r) => r.data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`).then((r) => r.data);
export const resetDevice = (username) => client.post("/admin/devices/reset", { username }).then((r) => r.data);

// Logs
export const getLogs = (params) => client.get("/admin/logs", { params }).then((r) => r.data);

// Settings
export const getSettings = () => client.get("/admin/settings").then((r) => r.data);
export const updateSettings = (body) => client.put("/admin/settings", body).then((r) => r.data);

// Versions
export const getVersions = () => client.get("/admin/versions").then((r) => r.data);
export const addVersion = (body) => client.post("/admin/versions", body).then((r) => r.data);
export const updateVersion = (id, body) => client.put(`/admin/versions/${id}`, body).then((r) => r.data);
export const deleteVersion = (id) => client.delete(`/admin/versions/${id}`).then((r) => r.data);

export default client;
