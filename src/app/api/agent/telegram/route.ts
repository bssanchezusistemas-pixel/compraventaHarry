import { NextRequest, NextResponse } from "next/server";
import { extractProductWithAI } from "@/lib/agent/extractor";
import { publishProductFromAgent } from "@/lib/agent/publisher";
import { saveDraft, getDraft, deleteDraft } from "@/lib/agent/draftStore";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

// Envía mensaje con botones inline a Telegram
async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

// Descarga un archivo de Telegram como Buffer
async function downloadTelegramFile(fileId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const getFileUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
  const fileRes = await fetch(getFileUrl);
  const fileData = await fileRes.json();
  const filePath = fileData.result?.file_path;
  if (!filePath) throw new Error("Could not resolve Telegram file path");

  const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
  const res = await fetch(downloadUrl);
  const arrayBuf = await res.arrayBuffer();
  const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
  return { buffer: Buffer.from(arrayBuf), mimeType };
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. MANEJO DE BOTONES INTERACTIVOS (Callback Query)
    if (update.callback_query) {
      const cb = update.callback_query;
      const dataStr = cb.data as string;
      const chatId = cb.message.chat.id;

      if (dataStr.startsWith("publish_")) {
        const draftId = dataStr.replace("publish_", "");
        const draft = getDraft(draftId);

        if (!draft) {
          await sendTelegramMessage(chatId, "⚠️ El borrador expiró o ya fue procesado. Envía la foto de nuevo.");
          return NextResponse.json({ ok: true });
        }

        await sendTelegramMessage(chatId, "⏳ <i>Optimizando imagen y publicando en la web...</i>");

        try {
          const { buffer } = await downloadTelegramFile(draft.fileId);
          const { productId } = await publishProductFromAgent(draft.product, buffer);
          deleteDraft(draftId);

          await sendTelegramMessage(
            chatId,
            `🎉 <b>¡Producto publicado con éxito en la web!</b>\n\n` +
            `🔗 <b>Nombre:</b> ${draft.product.name}\n` +
            `💰 <b>Precio:</b> $${draft.product.price}\n` +
            `🌐 Ya es visible para tus clientes en el catálogo.`
          );
        } catch (publishErr: any) {
          console.error("Publishing error:", publishErr);
          await sendTelegramMessage(chatId, `❌ Error al publicar: ${publishErr.message || publishErr}`);
        }

        return NextResponse.json({ ok: true });
      }

      if (dataStr.startsWith("cancel_")) {
        const draftId = dataStr.replace("cancel_", "");
        deleteDraft(draftId);
        await sendTelegramMessage(chatId, "❌ Publicación cancelada. El borrador fue descartado.");
        return NextResponse.json({ ok: true });
      }
    }

    // 2. MANEJO DE MENSAJES CON FOTO (Subida de nuevo producto)
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const textOrCaption = message.caption || message.text || "";

    // Si envían comando /start o saludo
    if (textOrCaption.startsWith("/start")) {
      await sendTelegramMessage(
        chatId,
        "👋 <b>¡Bienvenido al Asistente de Compraventa Harry!</b>\n\n" +
        "Para subir un producto al catálogo web, simplemente:\n" +
        "1. 📸 <b>Envía la foto</b> de la moto, carro, oro o accesorio.\n" +
        "2. ✍️ <b>Añade como texto</b> el precio, año, kilometraje o detalles.\n\n" +
        "La Inteligencia Artificial organizará la ficha y te pedirá confirmar antes de publicar."
      );
      return NextResponse.json({ ok: true });
    }

    // Si tiene foto adjunta
    if (message.photo && message.photo.length > 0) {
      const bestPhoto = message.photo[message.photo.length - 1]; // Mayor resolución
      const fileId = bestPhoto.file_id;

      await sendTelegramMessage(chatId, "🤖 <i>Analizando foto y datos con Inteligencia Artificial...</i>");

      const { buffer, mimeType } = await downloadTelegramFile(fileId);
      const extracted = await extractProductWithAI(buffer, mimeType, textOrCaption);

      const draftId = crypto.randomUUID().slice(0, 8);
      saveDraft({
        id: draftId,
        product: extracted,
        fileId,
        mimeType,
        createdAt: Date.now(),
      });

      const summaryText =
        `📋 <b>Ficha generada para el producto:</b>\n\n` +
        `🏷️ <b>Nombre:</b> ${extracted.name}\n` +
        `📂 <b>Categoría:</b> ${extracted.category.toUpperCase()}\n` +
        (extracted.model_year ? `📅 <b>Año:</b> ${extracted.model_year}\n` : "") +
        (extracted.kilometers ? `🛣️ <b>Kilometraje:</b> ${extracted.kilometers}\n` : "") +
        (extracted.paper_until ? `📄 <b>Papeles:</b> ${extracted.paper_until}\n` : "") +
        `💵 <b>Precio:</b> $${extracted.price || "A consultar"}\n` +
        (extracted.description ? `📝 <b>Descripción:</b> <i>${extracted.description}</i>\n` : "") +
        `\n¿Deseas publicarlo de inmediato en el catálogo de la web?`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "✅ Sí, Publicar en la Web", callback_data: `publish_${draftId}` },
            { text: "❌ Cancelar", callback_data: `cancel_${draftId}` },
          ],
        ],
      };

      await sendTelegramMessage(chatId, summaryText, replyMarkup);
      return NextResponse.json({ ok: true });
    }

    // Si envía solo texto sin foto
    if (message.text && !message.text.startsWith("/")) {
      await sendTelegramMessage(
        chatId,
        "💡 <i>Recuerda adjuntar la foto del producto junto con la descripción para que la IA arme la ficha completa.</i>"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
