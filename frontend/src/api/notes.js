const BASE_URL = "http://localhost:5000/api/notes";

// Get all
export const getNotes = async () => {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data.notes;
};

// Get by ID
export const getNote = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
};

// Post create
export const createNote = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Patch update
export const updateNote = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Delete
export const deleteNote = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
