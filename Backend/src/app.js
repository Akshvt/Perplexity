import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// Serve frontend static files (built dist copied to Backend/public/)
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// SPA fallback — serve index.html for all non-API routes (Express 5 syntax)
app.get("{*path}", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

export default app;