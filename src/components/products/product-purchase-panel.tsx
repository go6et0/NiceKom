"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "@/components/products/add-to-cart-button";
import { useLocale } from "@/components/site/locale-provider";
import { formatCurrency } from "@/lib/format";

type PurchaseVariant = {
  id: string;
  packageSize: number;
  unit: "LITERS" | "KILOGRAMS";
  price: number;
  quantity: number;
};

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  image?: string;
  variants: PurchaseVariant[];
};

function getUnitShort(unit: "LITERS" | "KILOGRAMS", locale: "en" | "bg") {
  if (unit === "LITERS") return locale === "bg" ? "л" : "L";
  return locale === "bg" ? "кг" : "kg";
}

export default function ProductPurchasePanel({
  productId,
  productName,
  image,
  variants,
}: ProductPurchasePanelProps) {
  const { t, locale } = useLocale();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? variants[0],
    [selectedVariantId, variants]
  );

  if (!selectedVariant) return null;

  const unitLabel =
    selectedVariant.unit === "LITERS" ? t.product.unit.LITERS : t.product.unit.KILOGRAMS;
  const unitShort = getUnitShort(selectedVariant.unit, locale);
  const variantLabel = `${selectedVariant.packageSize} ${unitShort}`;

  return (
    <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-5 text-sm shadow-sm">
      <div className="grid gap-2">
        <label htmlFor="variant" className="font-medium">
          {t.product.packageSize}
        </label>
        <select
          id="variant"
          value={selectedVariant.id}
          onChange={(event) => setSelectedVariantId(event.target.value)}
          className="h-10 rounded-md border border-border/60 bg-background px-3 text-sm"
        >
          {variants.map((variant) => {
            const optionUnit = getUnitShort(variant.unit, locale);
            return (
              <option key={variant.id} value={variant.id}>
                {variant.packageSize} {optionUnit} - {formatCurrency(variant.price)}
              </option>
            );
          })}
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span>{t.product.unitLabel}</span>
        <span className="font-medium">{unitLabel}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t.product.availableQuantity}</span>
        <span className="font-medium">{selectedVariant.quantity}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t.product.price}</span>
        <span className="text-lg font-semibold">{formatCurrency(selectedVariant.price)}</span>
      </div>
      <AddToCartButton
        productId={productId}
        variantId={selectedVariant.id.startsWith("fallback-") ? undefined : selectedVariant.id}
        variantLabel={variantLabel}
        name={productName}
        price={selectedVariant.price}
        image={image}
        maxQuantity={selectedVariant.quantity}
      />
    </div>
  );
}
