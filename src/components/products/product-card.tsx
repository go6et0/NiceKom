"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/products/add-to-cart-button";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/site/locale-provider";

type ProductCardProps = {
  id: string;
  name: string;
  brand: string;
  price: number;
  shortDescription: string;
  image?: string;
  type: "OIL" | "GREASE";
  quantity: number;
  unit: "LITERS" | "KILOGRAMS";
  packageSize: number;
};

export default function ProductCard({
  id,
  name,
  brand,
  price,
  shortDescription,
  image,
  type,
  quantity,
  unit,
  packageSize,
}: ProductCardProps) {
  const { t } = useLocale();
  const unitLabel =
    unit === "LITERS" ? t.product.unitShort.LITERS : t.product.unitShort.KILOGRAMS;
  const typeLabel = t.product.type[type];
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${id}`}
        className="relative aspect-[4/3] w-full bg-card/70"
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3"
          loading="lazy"
        />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <Link href={`/products/${id}`} className="text-lg font-semibold">
            {name}
          </Link>
          <Badge variant="secondary">{typeLabel}</Badge>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {brand} • {packageSize} {unitLabel}
        </p>
        {quantity === 0 && (
          <span className="text-xs font-semibold uppercase text-destructive">
            {t.product.outOfStock}
          </span>
        )}
        <p className="text-sm text-muted-foreground">{shortDescription}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-5 pt-0">
        <span className="text-base font-semibold">
          {formatCurrency(price)}
        </span>
        <AddToCartButton
          productId={id}
          name={name}
          price={price}
          image={image}
          maxQuantity={quantity}
        />
      </CardFooter>
    </Card>
  );
}
