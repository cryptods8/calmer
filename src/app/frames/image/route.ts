import fs from "fs";
import path from "path";

export async function GET() {
  // serve the static /og-share.png image
  const image = fs.readFileSync(
    path.join(process.cwd(), "public", "og-share.png")
  );
  return new Response(image, {
    headers: { "Content-Type": "image/png" },
  });
}
