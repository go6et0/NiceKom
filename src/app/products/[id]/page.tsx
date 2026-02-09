import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/products/product-gallery";
import AddToCartButton from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductPageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  if (!resolvedParams?.id) notFound();

  const locale = await getLocale();
  const t = getDictionary(locale);

  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!product) notFound();

  const unitLabel =
    product.unit === "LITERS"
      ? t.product.unit.LITERS
      : t.product.unit.KILOGRAMS;
  const baseOilLabel =
    product.baseOil === "MINERAL"
      ? t.product.baseOil.MINERAL
      : product.baseOil === "SEMI_SYNTHETIC"
      ? t.product.baseOil.SEMI_SYNTHETIC
      : product.baseOil === "SYNTHETIC"
      ? t.product.baseOil.SYNTHETIC
      : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <ProductGallery images={product.images} name={product.name} />
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{t.product.type[product.type]}</Badge>
          <span className="text-sm text-muted-foreground">
            {t.product.viscosityLabel}: {product.viscosity}
          </span>
        </div>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          {product.brand}
        </p>
        <p className="text-lg text-muted-foreground">{product.description}</p>
        <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-5 text-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span>{t.product.packageSize}</span>
            <span className="font-medium">
              {Number(product.packageSize)} {unitLabel}
            </span>
          </div>
          {product.application && (
            <div className="flex items-center justify-between">
              <span>{t.product.application}</span>
              <span className="font-medium">{product.application}</span>
            </div>
          )}
          {product.certification && (
            <div className="flex items-center justify-between">
              <span>{t.product.certification}</span>
              <span className="font-medium">{product.certification}</span>
            </div>
          )}
          {baseOilLabel && (
            <div className="flex items-center justify-between">
              <span>{t.product.baseOilLabel}</span>
              <span className="font-medium">{baseOilLabel}</span>
            </div>
          )}
          {(product.operatingTempMin !== null &&
            product.operatingTempMin !== undefined) ||
          (product.operatingTempMax !== null &&
            product.operatingTempMax !== undefined) ? (
            <div className="flex items-center justify-between">
              <span>{t.product.tempRange}</span>
              <span className="font-medium">
                {product.operatingTempMin ?? "—"}°C {t.product.tempRangeTo}{" "}
                {product.operatingTempMax ?? "—"}°C
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span>{t.product.unitLabel}</span>
            <span className="font-medium">{unitLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.product.availableQuantity}</span>
            <span className="font-medium">{product.quantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.product.price}</span>
            <span className="text-lg font-semibold">
              {formatCurrency(Number(product.price))}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t.product.advantages}
          </p>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {product.advantages.map((advantage) => (
              <li key={advantage}>{advantage}</li>
            ))}
          </ul>
        </div>
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={Number(product.price)}
          image={product.images[0]}
          maxQuantity={product.quantity}
        />
      </div>
    </main>
  );
}
