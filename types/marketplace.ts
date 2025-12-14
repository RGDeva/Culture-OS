export type ProductCategory = 'ASSET' | 'SERVICE';
export type ProductType = 'BEAT' | 'KIT' | 'SERVICE' | 'ACCESS';
export type PaymentMethod = 'FLAT_FEE' | 'X402';

export interface Product {
  id: string;
  title: string;
  description: string;
  type: ProductType;
  category: ProductCategory;          // SERVICE for service products, ASSET otherwise
  priceUSDC: number;
  paymentMethod?: PaymentMethod;      // FLAT_FEE (default) or X402
  creatorId?: string;
  creatorName: string;
  coverUrl?: string;
  previewUrl?: string;
  tags?: string[];                    // ['trap', 'r&b', 'mixing']
  bpm?: number | null;
  key?: string | null;
  deliveryType?: 'INSTANT' | 'CUSTOM';
  estDeliveryTimeDays?: number | null;
  rating?: number | null;
  ordersCount?: number | null;
  createdAt?: string;
}

export interface CheckoutResponse {
  downloadUrl?: string;
  accessUrl?: string;
  message?: string;
}
