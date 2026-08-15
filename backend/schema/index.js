import "dotenv/config";
import express from "express";
import cors from "cors";

import duroosRoutes from "./routes/duroos.js";
import playlistRoutes from "./routes/playlists.js";
import resourceRoutes from "./routes/resources.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

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
