import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

/**
 * GET /api/flower?seed=xxx&bloom=0.6&message=...
 * Python flower_generator.py를 실행하고 JSON 응답 반환
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seed = searchParams.get("seed") ?? "default";
  const bloom = Math.min(1, Math.max(0, parseFloat(searchParams.get("bloom") ?? "0.6")));
  const flowers = searchParams.get("flowers") ?? "";
  const message = searchParams.get("message") ?? "";
  const color = searchParams.get("color") ?? "";
  const colors = searchParams.get("colors") ?? "";

  const scriptPath = path.join(process.cwd(), "python", "flower_generator.py");
  const args = ["--seed", seed, "--bloom", String(bloom), "--message", message, "--json"];
  if (flowers) args.splice(-1, 0, "--flowers", flowers);
  if (colors) args.splice(-1, 0, "--colors", colors);
  else if (color) args.splice(-1, 0, "--color", color);

  const py = process.platform === "win32" ? "python" : "python3";

  return new Promise<NextResponse>((resolve) => {
    const proc = spawn(py, [scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error("[flower] Python stderr:", stderr);
        resolve(
          NextResponse.json(
            { error: "Flower generation failed", detail: stderr || "Unknown error" },
            { status: 500 }
          )
        );
        return;
      }

      try {
        const data = JSON.parse(stdout.trim());
        resolve(NextResponse.json(data));
      } catch {
        resolve(
          NextResponse.json(
            { error: "Invalid JSON from flower generator", raw: stdout.slice(0, 200) },
            { status: 500 }
          )
        );
      }
    });

    proc.on("error", (err) => {
      resolve(
        NextResponse.json(
          { error: "Failed to run Python", detail: String(err.message) },
          { status: 500 }
        )
      );
    });
  });
}
