import useSWR from "swr";
import { apiFetch } from "../lib/api";

const fetcher = (path) => apiFetch(path);

export default function ResourcesPage() {
  const { data: pending, mutate } = useSWR("/resources/admin/pending", fetcher);

  async function approve(id) {
    await apiFetch(`/resources/${id}/approve`, { method: "POST" });
    mutate();
  }

  async function reject(id) {
    await apiFetch(`/resources/${id}/reject`, { method: "POST" });
    mutate();
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AI Resources — Pending Approval</h1>
      {!pending && <p>Loading…</p>}
      {pending?.length === 0 && <p>Nothing pending.</p>}
      {pending?.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <strong>{r.title}</strong> <span style={{ color: "#888" }}>({r.language})</span>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.content}</p>
          {r.citations?.length > 0 && (
            <ul>
              {r.citations.map((c) => (
                <li key={c.id}>
                  <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                    {c.sourceTitle || c.sourceUrl}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => approve(r.id)}>Approve</button>
            <button onClick={() => reject(r.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
