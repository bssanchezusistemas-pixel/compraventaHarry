export interface ExtractedProduct {
  name: string;
  type: "vehiculo" | "oro" | "servicio";
  category: "moto" | "carro" | "oro" | "repuestos" | "accesorios" | "alquiler";
  vehicle_type?: "moto" | "carro";
  purpose?: "venta" | "alquiler";
  brand?: string;
  model_year?: number;
  kilometers?: string;
  paper_until?: string;
  price: string;
  karats?: string;
  weight?: string;
  description?: string;
}

export interface AgentDraft {
  id: string;
  product: ExtractedProduct;
  fileId: string;
  mimeType: string;
  createdAt: number;
}
