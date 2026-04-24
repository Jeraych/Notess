import { getToken } from "./auth";
const BASE_URL = "http://localhost:5000/api/notes";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Get all
export const getNotes = async () => {
  const res = await fetch(BASE_URL, { headers: authHeaders() });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  return data.notes;
};

// Get by ID
export const getNote = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
  return res.json();
};

// Post create
export const createNote = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// Patch update
export const updateNote = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// Delete
export const deleteNote = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
