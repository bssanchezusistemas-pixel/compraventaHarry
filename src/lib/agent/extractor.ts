import { GoogleGenAI } from "@google/genai";
import { ExtractedProduct } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
});

export async function extractProductWithAI(
  imageBuffer: Buffer,
  mimeType: string,
  userText: string = ""
): Promise<ExtractedProduct> {
  const prompt = `
Eres un asistente experto en catalogar productos para Compraventa Harry (Colombia).
Analiza la imagen adjunta y la descripción textual/voz del usuario: "${userText}".

Determina los datos del producto siguiendo estrictamente las categorías del negocio:
1. Categorías disponibles:
   - "oro": Joyería en oro (cadenas, dijes, tobilleras, pulseras, anillos, manillas).
   - "moto": Motocicletas en venta (ej. Yamaha NMAX, Crypton FI, Suzuki DR650, etc.).
   - "carro": Vehículos o automóviles en venta (sedanes, SUVs, camionetas).
   - "alquiler": Motos o carros expresamente para alquiler.
   - "repuestos" o "accesorios": Partes o accesorios de vehículos.

2. Mapeo de Tipo ('type'):
   - Si category es "oro" -> type es "oro".
   - Si category es "moto", "carro" o "alquiler" -> type es "vehiculo".
   - Si category es "repuestos" o "accesorios" -> type es "servicio".

3. Formato del precio:
   - Extrae el precio exacto numérico. Ejemplo: si dice "3’200.000", "3.200.000" o "3200000", escribe "3.200.000".
   - Usa puntos como separador de miles en pesos colombianos.
   - Si no se menciona precio, deja "".

4. Reglas específicas según categoría:
   - Si es "oro":
     * "name": Nombre conciso y elegante (ej. "Tobillera Oro Rústico", "Cadena Oro 18k Tejido Chino").
     * "karats": Kilates (ej. "Oro 18k").
     * "weight": Peso en gramos o medidas (ej. "7,6 Gr", "28 Cm").
     * "description": Puede incluir peso, medidas, tejido o características completas copiadas o formateadas.
   - Si es "vehiculo" (moto / carro):
     * "name": Nombre comercial (ej. "Yamaha NMAX 155", "Crypton FI").
     * "model_year": Año numérico (ej. 2024, 2025).
     * "kilometers": Kilometraje con formato legible (ej. "12.500 km", "0 km").
     * "paper_until": Vigencia de papeles si se menciona (ej. "Diciembre 2026", "Al día").
     * "description": Breve descripción comercial en español.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura:
{
  "name": "Tobillera Oro Rústico",
  "type": "oro",
  "category": "oro",
  "price": "3.200.000",
  "karats": "Oro 18k",
  "weight": "7,6 Gr - 28 Cm",
  "description": "Tobillera en oro rústico. Peso: 7,6 Gr. Longitud: 28 Cm."
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: mimeType || "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim() || "{}";
  const parsed = JSON.parse(text);

  return {
    name: parsed.name || "Producto sin nombre",
    type: parsed.type || "vehiculo",
    category: parsed.category || "moto",
    vehicle_type: parsed.vehicle_type || (parsed.category === "carro" ? "carro" : "moto"),
    purpose: parsed.purpose || "venta",
    brand: parsed.brand || "",
    model_year: parsed.model_year ? Number(parsed.model_year) : undefined,
    kilometers: parsed.kilometers || "Consultar",
    paper_until: parsed.paper_until || "",
    price: parsed.price || "",
    karats: parsed.karats || (parsed.category === "oro" ? "Oro 18k" : undefined),
    weight: parsed.weight || undefined,
    description: parsed.description || "",
  };
}
