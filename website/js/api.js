// Point this at your backend's address (the .replit.dev URL from your
// backend Repl, or your production API domain once you have one).
const API_BASE = "https://duroos-app.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("duroos_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const api = {
  signup: (email, password, name) =>
    apiFetch("/users/signup", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: (email, password) =>
    apiFetch("/users/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => apiFetch("/users/me"),
  listDuroos: (language) => apiFetch(`/duroos${language ? `?language=${language}` : ""}`),
  getDuroos: (id) => apiFetch(`/duroos/${id}`),
  getComments: (duroosId) => apiFetch(`/comments/duroos/${duroosId}`),
  postComment: (duroosId, body) =>
    apiFetch(`/comments/duroos/${duroosId}`, { method: "POST", body: JSON.stringify({ body }) }),
};
