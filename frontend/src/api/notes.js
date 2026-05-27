import { getToken } from "./auth";
const BASE_URL = import.meta.env.VITE_API_URL;
const API = `${BASE_URL}/api/notes`;
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS = [1200, 2800, 5000];

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseError = async (res) => {
  try {
    return await res.json();
  } catch {
    return { error: res.statusText || "Request failed" };
  }
};

const requestJson = async (url, options = {}, { retry = false } = {}) => {
  let lastError;
  const attempts = retry ? RETRY_DELAYS.length + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res.json();

      const error = await parseError(res);
      if (!retry || !RETRYABLE_STATUSES.has(res.status) || attempt === attempts - 1) {
        throw error;
      }
      lastError = error;
    } catch (error) {
      lastError = error;
      if (!retry || attempt === attempts - 1) throw error;
    }

    await sleep(RETRY_DELAYS[attempt]);
  }

  throw lastError || { error: "Request failed" };
};

// Get all
export const getNotes = async () => {
  const data = await requestJson(`${API}?limit=100`, { headers: authHeaders() });
  return data.notes;
};

// Get by ID
export const getNote = async (id) => {
  return requestJson(`${API}/${id}`, { headers: authHeaders() });
};

// Post create
export const createNote = async (data) => {
  return requestJson(
    API,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
    { retry: true },
  );
};

// Patch update
export const updateNote = async (id, data) => {
  return requestJson(
    `${API}/${id}`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
    { retry: true },
  );
};

// Delete
export const deleteNote = async (id) => {
  return requestJson(
    `${API}/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
    { retry: true },
  );
};
