export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  children?: Category[];
  parentId?: string | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  regularPrice: number | string;
  salePrice?: number | string | null;
  stockQuantity: number;
  material?: string | null;
  color?: string | null;
  size?: string | null;
  isHandmade?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  status?: string;
  category?: Category | null;
  images?: ProductImage[];
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string | null;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  productImage?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number | string;
  deliveryCharge: number | string;
  discount: number | string;
  total: number | string;
  items: OrderItem[];
  createdAt: string;
  address?: {
    fullName: string;
    phone: string;
    district: string;
    area: string;
    addressLine: string;
  };
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  position?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code?: string; details?: unknown };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
