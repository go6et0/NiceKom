"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/products/add-to-cart-button";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/site/locale-provider";

type ProductCardProps = {
  id: string;
  variantId?: string;
  variantLabel?: string;
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
  variantId,
  variantLabel,
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
        className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(148,163,184,0.28),transparent_42%),linear-gradient(155deg,rgba(226,232,240,0.68),rgba(248,250,252,0.9))] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(148,163,184,0.16),transparent_42%),linear-gradient(155deg,rgba(30,41,59,0.72),rgba(2,6,23,0.92))]"
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="bg-transparent object-contain p-3 drop-shadow-[0_12px_18px_rgba(15,23,42,0.28)] dark:drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)]"
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
          {brand} • {variantLabel ?? `${packageSize} ${unitLabel}`}
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
          variantId={variantId}
          variantLabel={variantLabel ?? `${packageSize} ${unitLabel}`}
          name={name}
          price={price}
          image={image}
          maxQuantity={quantity}
        />
      </CardFooter>
    </Card>
  );
}
