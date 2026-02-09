"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(2),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  advantages: z.string().min(3),
  type: z.enum(["OIL", "GREASE"]),
  viscosity: z.string().min(1),
  unit: z.enum(["LITERS", "KILOGRAMS"]),
  packageSize: z.coerce.number().positive(),
  application: z.string().min(2).optional(),
  certification: z.string().min(2).optional(),
  baseOil: z.enum(["MINERAL", "SEMI_SYNTHETIC", "SYNTHETIC"]).optional(),
  operatingTempMin: z.coerce.number().int().optional(),
  operatingTempMax: z.coerce.number().int().optional(),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1),
});

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  if (value === null) return value;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return typeof value === "string" ? value.replace(",", ".").trim() : value;
}

function parseProductForm(formData: FormData) {
  const raw = {
    name: normalizeText(formData.get("name")),
    brand: normalizeText(formData.get("brand")),
    shortDescription: normalizeText(formData.get("shortDescription")),
    description: normalizeText(formData.get("description")),
    advantages: normalizeText(formData.get("advantages")),
    type: normalizeText(formData.get("type")),
    viscosity: normalizeText(formData.get("viscosity")),
    unit: normalizeText(formData.get("unit")),
    packageSize: normalizeNumber(formData.get("packageSize")),
    application: normalizeText(formData.get("application")),
    certification: normalizeText(formData.get("certification")),
    baseOil: normalizeText(formData.get("baseOil")),
    operatingTempMin: normalizeNumber(formData.get("operatingTempMin")),
    operatingTempMax: normalizeNumber(formData.get("operatingTempMax")),
    price: normalizeNumber(formData.get("price")),
    quantity: normalizeNumber(formData.get("quantity")),
    images: formData.getAll("images"),
  };

  const parsed = productSchema.safeParse({
    ...raw,
    application: raw.application || undefined,
    certification: raw.certification || undefined,
    baseOil: raw.baseOil || undefined,
    advantages: String(raw.advantages || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n"),
    images: raw.images.map((img) => String(img)),
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid product data. ${details}`);
  }

  return {
    ...parsed.data,
    advantages: parsed.data.advantages
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

export async function createProduct(formData: FormData) {
  const data = parseProductForm(formData);

  await prisma.product.create({
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const data = parseProductForm(formData);

  await prisma.product.update({
    where: { id: productId },
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}
