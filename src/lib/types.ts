export type ProductStatus = "borrador" | "publicado" | "vendido" | "reservado";
export type ProductType = "vehiculo" | "oro" | "tramite" | "divisa" | "servicio";

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  storage_path?: string | null;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  status: ProductStatus;
  price: string | null;
  price_numeric: number | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
}

export interface DashboardStats {
  totalProducts: number;
  totalVehicles: number;
  totalGold: number;
  totalServices: number;
  published: number;
  sold: number;
}

export const PRODUCT_STATUSES: ProductStatus[] = ["borrador", "publicado", "vendido", "reservado"];
export const PRODUCT_TYPES: ProductType[] = ["vehiculo", "oro", "tramite", "divisa", "servicio"];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  vendido: "Vendido",
  reservado: "Reservado",
};

export const TYPE_LABELS: Record<ProductType, string> = {
  vehiculo: "Vehículo",
  oro: "Oro",
  tramite: "Trámite",
  divisa: "Divisa",
  servicio: "Servicio",
};
