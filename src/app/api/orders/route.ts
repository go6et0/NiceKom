import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getLocale } from "@/lib/locale";
import { getProductText } from "@/lib/product-text";

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().min(5).max(40),
  customerAddress: z.string().trim().min(5).max(500),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.coerce.number().int().positive().max(999),
      })
    )
    .min(1)
    .max(100),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const locale = await getLocale();

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone, customerAddress } = parsed.data;
  const items = Array.from(
    parsed.data.items.reduce((acc, item) => {
      const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
      const current = acc.get(key);
      if (!current) {
        acc.set(key, { ...item });
        return acc;
      }
      current.quantity += item.quantity;
      return acc;
    }, new Map<string, { productId: string; variantId?: string; quantity: number }>())
  ).map(([, value]) => value);

  const uniqueProductIds = Array.from(new Set(items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (products.length !== uniqueProductIds.length) {
    return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const itemsWithResolvedVariant = items.map((item) => {
    if (item.variantId) return item;
    const fallbackVariant = productMap.get(item.productId)?.variants[0];
    return fallbackVariant ? { ...item, variantId: fallbackVariant.id } : item;
  });

  const variantIds = Array.from(
    new Set(
      itemsWithResolvedVariant
        .map((item) => item.variantId)
        .filter((value): value is string => Boolean(value))
    )
  );

  const variants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
      })
    : [];
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  if (variants.length !== variantIds.length) {
    return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }

  try {
    const total = itemsWithResolvedVariant.reduce((sum, item) => {
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      const product = productMap.get(item.productId);
      const price = variant ? Number(variant.price) : Number(product?.price ?? 0);
      return sum + price * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of itemsWithResolvedVariant) {
        if (item.variantId) {
          const variant = variantMap.get(item.variantId);
          const product = productMap.get(item.productId);
          if (!variant || variant.productId !== item.productId) {
            throw new Error("PRODUCT_NOT_FOUND");
          }

          const updatedVariant = await tx.productVariant.updateMany({
            where: { id: item.variantId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          });

          if (updatedVariant.count === 0) {
            const name = product ? getProductText(product, locale).name : "";
            const unitLabel = variant.unit === "LITERS" ? "L" : "kg";
            throw new Error(
              `INSUFFICIENT_STOCK:${name} ${Number(variant.packageSize)} ${unitLabel}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
          continue;
        }

        const updated = await tx.product.updateMany({
          where: { id: item.productId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const product = productMap.get(item.productId);
          const name = product ? getProductText(product, locale).name : "";
          throw new Error(`INSUFFICIENT_STOCK:${name}`);
        }
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          total,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          items: {
            create: itemsWithResolvedVariant.map((item) => {
              const product = productMap.get(item.productId)!;
              const variant = item.variantId ? variantMap.get(item.variantId) : null;
              const text = getProductText(product, locale);
              const unitLabel = variant ? (variant.unit === "LITERS" ? "L" : "kg") : null;
              return {
                productId: product.id,
                name: variant
                  ? `${text.name} - ${Number(variant.packageSize)} ${unitLabel}`
                  : text.name,
                price: variant?.price ?? product.price,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK")) {
      const [, productName] = error.message.split(":");
      return NextResponse.json(
        { error: "INSUFFICIENT_STOCK", productName: productName || undefined },
        { status: 400 }
      );
    }

    console.error("CreateOrderError", error);
    return NextResponse.json({ error: "ORDER_FAILED" }, { status: 500 });
  }
}

