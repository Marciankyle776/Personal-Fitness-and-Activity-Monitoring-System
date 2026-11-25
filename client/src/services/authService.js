import api from "./api";

export const authService = {
  register: async (body) => (await api.post("/auth/register", body)).data.data,
  login: async (body) => (await api.post("/auth/login", body)).data.data,
  logout: async () => (await api.post("/auth/logout")).data,
  me: async () => (await api.get("/auth/me")).data.data,
  forgotPassword: async (body) => (await api.post("/auth/forgot-password", body)).data,
  resetPassword: async (body) => (await api.post("/auth/reset-password", body)).data,
};
