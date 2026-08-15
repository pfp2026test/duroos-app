import "dotenv/config";
import express from "express";
import cors from "cors";

import duroosRoutes from "./lib/routes/duroos.js";
import playlistRoutes from ".lib/routes/playlists.js";
import resourceRoutes from ".lib/routes/resources.js";
import commentRoutes from ".lib/routes/comments.js";
import authRoutes from ".lib/routes/auth.js";
import userRoutes from ".lib/routes/users.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/duroos", duroosRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/comments", commentRoutes);

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Duroos API listening on port ${PORT}`));
