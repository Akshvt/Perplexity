import { cpSync, rmSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const src = resolve(root, "Frontend", "dist");
const dest = resolve(root, "Backend", "public");

// Clean old public/ if exists
if (existsSync(dest)) {
    rmSync(dest, { recursive: true });
}

// Copy Frontend/dist → Backend/public
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log("✓ Copied Frontend/dist → Backend/public/");
