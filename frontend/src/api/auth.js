const BASE_URL = import.meta.env.VITE_API_URL;
const API = `${BASE_URL}/API/users`;

export const register = async (username, password) => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json(); // { token }
};

export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

// Decode the JWT payload (it's just base64 — not secret)
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check if expired
    if (payload.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return payload; // { userId, username, ... }
  } catch {
    return null;
  }
};
