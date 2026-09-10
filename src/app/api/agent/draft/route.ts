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
    console.error("Draft API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
