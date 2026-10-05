import { SettingType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const PUBLIC_KEYS = [
  "store_name",
  "store_phone",
  "store_email",
  "local_delivery_charge",
  "dhaka_delivery_charge",
  "outside_dhaka_delivery_charge",
  "free_delivery_threshold",
  "minimum_order_amount",
];

export async function getPublicSettings() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });

  const map: Record<string, string | number | boolean> = {};
  for (const s of settings) {
    map[s.key] =
      s.type === "NUMBER"
        ? Number(s.value)
        : s.type === "BOOLEAN"
          ? s.value === "true"
          : s.value;
  }
  return map;
}

export async function getAllSettings() {
  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });
  return settings;
}

export async function updateSettings(
  updates: Record<string, string | number | boolean>
) {
  const results = [];

  for (const [key, value] of Object.entries(updates)) {
    const strValue = String(value);
    const type: SettingType =
      typeof value === "number"
        ? SettingType.NUMBER
        : typeof value === "boolean"
          ? SettingType.BOOLEAN
          : SettingType.STRING;

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: strValue, type },
      create: { key, value: strValue, type },
    });
    results.push(setting);
  }

  return results;
}
