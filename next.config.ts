import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Copy secret_brackets.jpg to favicon.ico automatically on startup
try {
  const sourcePath = path.join(process.cwd(), "public", "secret_brackets.jpg");
  const destPath1 = path.join(process.cwd(), "src", "app", "favicon.ico");
  const destPath2 = path.join(process.cwd(), "public", "favicon.ico");
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath1);
    fs.copyFileSync(sourcePath, destPath2);
    console.log("Successfully updated favicon to secret_brackets.jpg");
  }
} catch (e) {
  console.error("Failed to copy favicon automatically:", e);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
