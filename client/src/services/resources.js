import api from "./api";
import { localDateString } from "../utils/format";

const get = async (url, params) => (await api.get(url, { params })).data.data;
const post = async (url, body) => (await api.post(url, body)).data.data;
const put = async (url, body) => (await api.put(url, body)).data.data;
const del = async (url) => (await api.delete(url)).data;

// `today` anchors server-side date windows to the user's local calendar day.
const withToday = (params = {}) => ({ ...params, today: localDateString() });

const createResource = (base) => ({
  list: (params) => get(base, params),
  get: (id) => get(`${base}/${id}`),
  create: (body) => post(base, body),
  update: (id, body) => put(`${base}/${id}`, body),
  remove: (id) => del(`${base}/${id}`),
  stats: () => get(`${base}/stats`, withToday()),
});

export const activityService = {
  ...createResource("/activities"),
  exportCsv: async (params) => (await api.get("/activities/export", { params, responseType: "blob" })).data,
};

export const workoutService = createResource("/workouts");

export const routineService = {
  ...createResource("/routines"),
  log: (id, body) => post(`/routines/${id}/log`, body),
};

export const goalService = createResource("/goals");

export const analyticsService = {
  dashboard: () => get("/analytics/dashboard", withToday()),
  overview: (params) => get("/analytics/overview", withToday(params)),
};

export const notificationService = {
  list: (params) => get("/notifications", params),
  markRead: (id) => put(`/notifications/${id}/read`),
  markAllRead: () => put("/notifications/read-all"),
};

export const profileService = {
  get: () => get("/profile"),
  update: (body) => put("/profile", body),
  changePassword: async (body) => (await api.put("/profile/change-password", body)).data,
};
