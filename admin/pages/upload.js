import { useState } from "react";
import { apiFetch } from "../lib/api";

// Extracts the YouTube video id from common URL formats.
function parseYoutubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export default function UploadPage() {
  const [form, setForm] = useState({
    title: "",
    titleArabic: "",
    description: "",
    language: "ENGLISH",
    youtubeUrl: "",
  });
  const [status, setStatus] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    try {
      await apiFetch("/duroos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          youtubeVideoId: parseYoutubeId(form.youtubeUrl),
        }),
      });
      setStatus("saved");
      setForm({ title: "", titleArabic: "", description: "", language: "ENGLISH", youtubeUrl: "" });
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Upload a Durs</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          YouTube link
          <input value={form.youtubeUrl} onChange={update("youtubeUrl")} required style={inputStyle} />
        </label>
        <label>
          Title (English)
          <input value={form.title} onChange={update("title")} required style={inputStyle} />
        </label>
        <label>
          Title (Arabic)
          <input value={form.titleArabic} onChange={update("titleArabic")} dir="rtl" style={inputStyle} />
        </label>
        <label>
          What is covered
          <textarea value={form.description} onChange={update("description")} rows={4} style={inputStyle} />
        </label>
        <label>
          Original language
          <select value={form.language} onChange={update("language")} style={inputStyle}>
            <option value="ENGLISH">English</option>
            <option value="ARABIC">Arabic</option>
          </select>
        </label>
        {/* Speaker / book / playlist pickers would go here — typeahead
            selects backed by /api/speakers, /api/books, /api/playlists */}
        <button type="submit" disabled={status === "saving"}>
          Save as draft
        </button>
        {status === "saved" && <p>Saved. Trigger translation from the review queue.</p>}
        {status && status !== "saving" && status !== "saved" && <p style={{ color: "red" }}>{status}</p>}
      </form>
    </div>
  );
}

const inputStyle = { display: "block", width: "100%", padding: 8, marginTop: 4 };
