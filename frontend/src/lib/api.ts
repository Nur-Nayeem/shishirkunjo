import type { ApiResponse, Product, Category, Collection, Banner, User, Cart, Order, Address } from "@/types";
import { getSessionId } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  sessionId?: boolean;
  cache?: RequestCache;
  tags?: string[];
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, token, sessionId = false, cache, tags } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (sessionId && typeof window !== "undefined") {
    headers["x-session-id"] = getSessionId();
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next: tags ? { tags } : undefined,
  });

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Invalid server response", res.status);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(
      json.message || "Request failed",
      res.status,
      json.error?.code,
      json.error?.details
    );
  }

  return json;
}

/** Backend wraps lists as { items: T[] } and singles as { product } etc. */
function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

function asPagination(data: unknown): {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
} {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj.pagination && typeof obj.pagination === "object") {
      return obj.pagination as {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      };
    }
  }
  return {};
}

function unwrapKey<T>(data: unknown, key: string): T | null {
  if (data && typeof data === "object" && key in (data as object)) {
    return (data as Record<string, T>)[key] ?? null;
  }
  return (data as T) ?? null;
}

// ─── Public helpers ───────────────────────────────────────────

export const productsApi = {
  list: async (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") q.set(k, String(v));
      });
    }
    const qs = q.toString();
    const res = await api<unknown>(`/products${qs ? `?${qs}` : ""}`);
    const items = asArray<Product>(res.data);
    const pagination = asPagination(res.data);
    return {
      ...res,
      data: items,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    };
  },
  featured: async () => {
    const res = await api<unknown>("/products/featured");
    return { ...res, data: asArray<Product>(res.data) };
  },
  newArrivals: async () => {
    const res = await api<unknown>("/products/new-arrivals");
    return { ...res, data: asArray<Product>(res.data) };
  },
  bestSellers: async () => {
    const res = await api<unknown>("/products/best-sellers");
    return { ...res, data: asArray<Product>(res.data) };
  },
  bySlug: async (slug: string) => {
    const res = await api<unknown>(`/products/${slug}`);
    return { ...res, data: unwrapKey<Product>(res.data, "product") };
  },
};

export const categoriesApi = {
  list: async () => {
    const res = await api<unknown>("/categories");
    return { ...res, data: asArray<Category>(res.data) };
  },
  bySlug: async (slug: string) => {
    const res = await api<unknown>(`/categories/${slug}`);
    return { ...res, data: unwrapKey<Category>(res.data, "category") };
  },
};

export const collectionsApi = {
  list: async () => {
    const res = await api<unknown>("/collections");
    return { ...res, data: asArray<Collection>(res.data) };
  },
  bySlug: async (slug: string) => {
    const res = await api<unknown>(`/collections/${slug}`);
    return { ...res, data: unwrapKey<Collection>(res.data, "collection") };
  },
};

export const bannersApi = {
  active: async () => {
    const res = await api<unknown>("/banners");
    return { ...res, data: asArray<Banner>(res.data) };
  },
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api<{ user: User; accessToken: string }>("/auth/register", {
      method: "POST",
      body: data,
    }),
  login: (data: { email: string; password: string; sessionId?: string }) =>
    api<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body: data,
    }),
  me: (token: string) => api<User>("/auth/me", { token }),
  logout: (token: string) => api<null>("/auth/logout", { method: "POST", token }),
};

export const cartApi = {
  get: async (token?: string | null) => {
    const res = await api<unknown>("/cart", { token, sessionId: true });
    return { ...res, data: unwrapKey<Cart>(res.data, "cart") };
  },
  add: async (
    data: { productId: string; quantity: number; variantId?: string },
    token?: string | null
  ) => {
    const res = await api<unknown>("/cart/items", {
      method: "POST",
      body: data,
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Cart>(res.data, "cart") };
  },
  update: async (itemId: string, quantity: number, token?: string | null) => {
    const res = await api<unknown>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Cart>(res.data, "cart") };
  },
  remove: async (itemId: string, token?: string | null) => {
    const res = await api<unknown>(`/cart/items/${itemId}`, {
      method: "DELETE",
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Cart>(res.data, "cart") };
  },
  clear: async (token?: string | null) => {
    const res = await api<unknown>("/cart", {
      method: "DELETE",
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Cart>(res.data, "cart") };
  },
};

export const ordersApi = {
  place: async (
    data: {
      items?: { productId: string; quantity: number; variantId?: string }[];
      addressId?: string;
      address?: {
        fullName: string;
        phone: string;
        district: string;
        area: string;
        addressLine: string;
        landmark?: string;
      };
      couponCode?: string;
      notes?: string;
    },
    token?: string | null
  ) => {
    const res = await api<unknown>("/orders", {
      method: "POST",
      body: data,
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Order>(res.data, "order") };
  },
  validate: (data: unknown, token?: string | null) =>
    api<unknown>("/orders/checkout/validate", {
      method: "POST",
      body: data,
      token,
      sessionId: true,
    }),
  mine: async (token: string) => {
    const res = await api<unknown>("/orders/my", { token });
    return { ...res, data: asArray<Order>(res.data) };
  },
  byNumber: async (orderNumber: string, token?: string | null) => {
    const res = await api<unknown>(`/orders/${orderNumber}`, {
      token,
      sessionId: true,
    });
    return { ...res, data: unwrapKey<Order>(res.data, "order") };
  },
};

export const deliveryApi = {
  calculate: async (data: { district: string; area?: string }) => {
    const res = await api<Record<string, unknown>>("/delivery/calculate", {
      method: "POST",
      body: data,
    });
    const d = res.data ?? {};
    const charge =
      typeof d.charge === "number"
        ? d.charge
        : typeof (d.delivery as { charge?: number })?.charge === "number"
          ? (d.delivery as { charge: number }).charge
          : 0;
    return {
      ...res,
      data: { charge, isDhaka: Boolean(d.isDhaka) },
    };
  },
};

export const couponsApi = {
  validate: async (code: string, subtotal: number) => {
    const res = await api<Record<string, unknown>>("/coupons/validate", {
      method: "POST",
      body: { code, subtotal },
    });
    const d = res.data ?? {};
    return {
      ...res,
      data: {
        code: String(d.code ?? code),
        discount: Number(d.discount ?? 0),
        type: String(d.type ?? ""),
      },
    };
  },
};

export const addressesApi = {
  list: async (token: string) => {
    const res = await api<unknown>("/addresses", { token });
    return { ...res, data: asArray<Address>(res.data) };
  },
  create: (data: Omit<Address, "id">, token: string) =>
    api<Address>("/addresses", { method: "POST", body: data, token }),
  update: (id: string, data: Partial<Address>, token: string) =>
    api<Address>(`/addresses/${id}`, { method: "PATCH", body: data, token }),
  remove: (id: string, token: string) =>
    api<null>(`/addresses/${id}`, { method: "DELETE", token }),
};
