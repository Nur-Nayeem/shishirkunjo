import { prisma } from "../../lib/prisma.js";

/**
 * Delivery charge from Settings table.
 * Keys: local_delivery_charge, dhaka_delivery_charge, outside_dhaka_delivery_charge
 * Fallback defaults if settings not seeded yet.
 */
const DEFAULTS = {
  local: 60,
  dhaka: 80,
  outside: 130,
};

async function getSettingNumber(key: string, fallback: number): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return fallback;
  const n = Number(setting.value);
  return Number.isFinite(n) ? n : fallback;
}

export async function calculateDeliveryCharge(district: string, _area?: string) {
  const normalized = district.trim().toLowerCase();

  // Simple rule: Dhaka city vs outside
  // Local = same area delivery can be refined later via settings
  const isDhaka =
    normalized === "dhaka" ||
    normalized === "ঢাকা" ||
    normalized.includes("dhaka");

  if (isDhaka) {
    const charge = await getSettingNumber(
      "dhaka_delivery_charge",
      DEFAULTS.dhaka
    );
    return {
      method: "OWN" as const,
      zone: "DHAKA",
      charge,
    };
  }

  const charge = await getSettingNumber(
    "outside_dhaka_delivery_charge",
    DEFAULTS.outside
  );
  return {
    method: "COURIER" as const,
    zone: "OUTSIDE_DHAKA",
    charge,
  };
}

export async function getDeliverySettings() {
  const [local, dhaka, outside, freeThreshold, minOrder] = await Promise.all([
    getSettingNumber("local_delivery_charge", DEFAULTS.local),
    getSettingNumber("dhaka_delivery_charge", DEFAULTS.dhaka),
    getSettingNumber("outside_dhaka_delivery_charge", DEFAULTS.outside),
    getSettingNumber("free_delivery_threshold", 0),
    getSettingNumber("minimum_order_amount", 0),
  ]);

  return {
    local,
    dhaka,
    outside,
    freeDeliveryThreshold: freeThreshold,
    minimumOrderAmount: minOrder,
  };
}
