import useSWR from "swr";
import { apiFetch } from "../lib/api";
import { requireAdminAuth } from "../lib/authGuard";

const fetcher = (path) => apiFetch(path);

export default function QueuePage() {
  requireAdminAuth();

  const { data: queue, mutate } = useSWR("/duroos/admin/queue", fetcher);

  async function requestTranslation(id) {
    await apiFetch(`/duroos/${id}/request-translation`, { method: "POST" });
    mutate();
  }

  async function publish(id) {
    await apiFetch(`/duroos/${id}/publish`, { method: "POST" });
    mutate();
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Review Queue</h1>
      {!queue && <p>Loading…</p>}
      {queue?.length === 0 && <p>Nothing pending.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {queue?.map((d) => (
          <li key={d.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <strong>{d.title}</strong> <span style={{ color: "#888" }}>({d.status})</span>
            <p style={{ margin: "4px 0" }}>{d.description}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {d.status === "DRAFT" && (
                <button onClick={() => requestTranslation(d.id)}>Request AI translation/captions</button>
              )}
              {(d.status === "IN_REVIEW" || d.status === "DRAFT") && (
                <button onClick={() => publish(d.id)}>Publish</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


