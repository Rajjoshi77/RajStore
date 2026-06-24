import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const tokenKey = "token";
export const userKey = "user";

export const getToken = () => localStorage.getItem(tokenKey);
export const setToken = (token) => {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
};

export const getUser = () => {
  const stored = localStorage.getItem(userKey);
  return stored ? JSON.parse(stored) : null;
};

export const setUser = (user) => {
  if (user) localStorage.setItem(userKey, JSON.stringify(user));
  else localStorage.removeItem(userKey);
};

export const logout = () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

export const authApi = axios.create({
  baseURL: API_BASE,
});

export const register = async ({ name, email, password, role }) => {
  const res = await authApi.post("/auth/register", { name, email, password, role });
  if (res.data?.token) {
    setToken(res.data.token);
    setUser(res.data.user);
  }
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await authApi.post("/auth/login", { email, password });
  if (res.data?.token) {
    setToken(res.data.token);
    setUser(res.data.user);
  }
  return res.data;
};

