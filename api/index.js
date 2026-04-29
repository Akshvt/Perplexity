import connectDB from "../Backend/src/config/database.js";
import app from "../Backend/src/app.js";

// Connect DB on cold start (cached across warm invocations)
await connectDB();

export default app;
