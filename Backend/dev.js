import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

const PORT = process.env.PORT || 3000;

await connectDB();

app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
});
