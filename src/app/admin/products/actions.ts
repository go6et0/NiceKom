"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ProductFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(2),
  shortDescription: z.string().min(10),
  shortDescriptionBg: z.string().min(10).optional(),
  description: z.string().min(20),
  descriptionBg: z.string().min(20).optional(),
  advantages: z.string().min(3),
  advantagesBg: z.string().min(3).optional(),
  type: z.enum(["OIL", "GREASE"]),
  viscosity: z.string().min(1),
  unit: z.enum(["LITERS", "KILOGRAMS"]),
  packageSize: z.coerce.number().positive(),
  application: z.string().min(2).optional(),
  applicationBg: z.string().min(2).optional(),
  certification: z.string().min(2).optional(),
  baseOil: z.enum(["MINERAL", "SEMI_SYNTHETIC", "SYNTHETIC"]).optional(),
  operatingTempMin: z.coerce.number().int().optional(),
  operatingTempMax: z.coerce.number().int().optional(),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1),
});

const variantSchema = z.object({
  packageSize: z.coerce.number().positive(),
  unit: z.enum(["LITERS", "KILOGRAMS"]),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().nonnegative(),
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
    shortDescriptionBg: normalizeText(formData.get("shortDescriptionBg")),
    description: normalizeText(formData.get("description")),
    descriptionBg: normalizeText(formData.get("descriptionBg")),
    advantages: normalizeText(formData.get("advantages")),
    advantagesBg: normalizeText(formData.get("advantagesBg")),
    type: normalizeText(formData.get("type")),
    viscosity: normalizeText(formData.get("viscosity")),
    packageSize: normalizeNumber(formData.get("packageSize")),
    unit: normalizeText(formData.get("unit")),
    application: normalizeText(formData.get("application")),
    applicationBg: normalizeText(formData.get("applicationBg")),
    certification: normalizeText(formData.get("certification")),
    baseOil: normalizeText(formData.get("baseOil")),
    operatingTempMin: normalizeNumber(formData.get("operatingTempMin")),
    operatingTempMax: normalizeNumber(formData.get("operatingTempMax")),
    price: normalizeNumber(formData.get("price")),
    quantity: normalizeNumber(formData.get("quantity")),
    extraPackageSizes: formData.getAll("extraPackageSize"),
    extraUnits: formData.getAll("extraUnit"),
    extraPrices: formData.getAll("extraPrice"),
    extraQuantities: formData.getAll("extraQuantity"),
    images: formData.getAll("images"),
  };

  const normalizedAdvantages = String(raw.advantages || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
  const normalizedAdvantagesBg = String(raw.advantagesBg || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");

  const parsed = productSchema.safeParse({
    ...raw,
    shortDescriptionBg: raw.shortDescriptionBg || undefined,
    descriptionBg: raw.descriptionBg || undefined,
    application: raw.application || undefined,
    applicationBg: raw.applicationBg || undefined,
    certification: raw.certification || undefined,
    baseOil: raw.baseOil || undefined,
    advantages: normalizedAdvantages,
    advantagesBg: normalizedAdvantagesBg || undefined,
    images: raw.images.map((img) => String(img)),
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid product data. ${details}`);
  }

  const extraVariantsRaw = raw.extraPackageSizes.map((value, index) => ({
    packageSize:
      typeof value === "string" && value.trim() !== ""
        ? value.replace(",", ".").trim()
        : undefined,
    unit:
      typeof raw.extraUnits[index] === "string"
        ? raw.extraUnits[index]
        : undefined,
    price:
      typeof raw.extraPrices[index] === "string" && raw.extraPrices[index].trim() !== ""
        ? raw.extraPrices[index].replace(",", ".").trim()
        : undefined,
    quantity:
      typeof raw.extraQuantities[index] === "string" &&
      raw.extraQuantities[index].trim() !== ""
        ? raw.extraQuantities[index].trim()
        : undefined,
  }));

  const normalizedExtraVariants = extraVariantsRaw.filter(
    (variant) =>
      variant.packageSize !== undefined ||
      variant.price !== undefined ||
      variant.quantity !== undefined
  );

  const parsedExtraVariants = normalizedExtraVariants.map((variant) => {
    const parsedVariant = variantSchema.safeParse(variant);
    if (!parsedVariant.success) {
      const details = parsedVariant.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid additional variant data. ${details}`);
    }
    return parsedVariant.data;
  });

  const baseVariant = variantSchema.parse({
    packageSize: parsed.data.packageSize,
    unit: parsed.data.unit,
    price: parsed.data.price,
    quantity: parsed.data.quantity,
  });

  const variants = [baseVariant, ...parsedExtraVariants];
  const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);
  const primaryVariant = variants[0];

  return {
    ...parsed.data,
    packageSize: primaryVariant.packageSize,
    unit: primaryVariant.unit,
    price: primaryVariant.price,
    quantity: totalQuantity,
    variants,
    advantages: parsed.data.advantages
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    advantagesBg: parsed.data.advantagesBg
      ? parsed.data.advantagesBg
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  };
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();
    const data = parseProductForm(formData);
    const { variants, ...productData } = data;

    await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((variant, index) => ({
            packageSize: variant.packageSize,
            unit: variant.unit,
            price: variant.price,
            quantity: variant.quantity,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save product.",
    };
  }
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();
    const data = parseProductForm(formData);
    const { variants, ...productData } = data;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        variants: {
          deleteMany: {},
          create: variants.map((variant, index) => ({
            packageSize: variant.packageSize,
            unit: variant.unit,
            price: variant.price,
            quantity: variant.quantity,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${productId}`);

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save product.",
    };
  }
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}
