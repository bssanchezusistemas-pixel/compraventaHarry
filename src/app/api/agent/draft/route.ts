import { NextRequest, NextResponse } from "next/server";
import { extractProductWithAI } from "@/lib/agent/extractor";
import { publishProductFromAgent } from "@/lib/agent/publisher";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = (formData.get("text") as string) || "";
    const action = formData.get("action") as string; // "extract" or "publish"

    if (action === "extract") {
      const files = formData.getAll("files") as File[];
      const singleFile = formData.get("file") as File | null;
      const targetFile = files.length > 0 ? files[0] : singleFile;

      if (!targetFile) {
        return NextResponse.json({ error: "Debes subir al menos una foto." }, { status: 400 });
      }
      const arrayBuffer = await targetFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extracted = await extractProductWithAI(buffer, targetFile.type, text);
      return NextResponse.json({ ok: true, product: extracted });
    }

    if (action === "publish") {
      const productJson = formData.get("product") as string;
      const files = formData.getAll("files") as File[];
      const singleFile = formData.get("file") as File | null;
      const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

      if (!productJson || allFiles.length === 0) {
        return NextResponse.json({ error: "Faltan datos del producto o imágenes." }, { status: 400 });
      }

      const product = JSON.parse(productJson);
      const buffers: Buffer[] = [];
      for (const f of allFiles) {
        const ab = await f.arrayBuffer();
        buffers.push(Buffer.from(ab));
      }

      const result = await publishProductFromAgent(product, buffers);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Draft API error details:", err);
    const detailedMessage = err?.message || String(err);
    const crypto = await import("crypto");
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || "";
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://crvvcnzrwbxdzgifiblc.supabase.co";
    const keyHash = sbKey ? crypto.createHash("sha256").update(sbKey).digest("hex").slice(0, 10) : "NONE";
    const urlHash = sbUrl ? crypto.createHash("sha256").update(sbUrl).digest("hex").slice(0, 10) : "NONE";
    const keyStatus = `GEMINI: ${geminiKey ? `${geminiKey.length} chars` : 'FALTA'} | SB_URL_HASH: ${urlHash} (${sbUrl}) | SB_KEY_HASH: ${keyHash} (${sbKey.length} chars, starts: ${sbKey.slice(0, 8)}... ends: ...${sbKey.slice(-6)})`;
    return NextResponse.json({ 
      error: detailedMessage,
      debug: keyStatus
    }, { status: 500 });
  }
}
