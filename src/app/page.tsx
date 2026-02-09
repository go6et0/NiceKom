import Link from "next/link";
import { BaseOil, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<
    string,
    string | string[] | undefined
  >;
};

export default async function Home({ searchParams }: HomeProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const getParam = (key: string) => {
    const value = resolvedSearchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const parseNumber = (value?: string) => {
    if (!value) return undefined;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const brand = getParam("brand");
  const type = getParam("type");
  const viscosity = getParam("viscosity");
  const application = getParam("application");
  const certification = getParam("certification");
  const baseOil = getParam("baseOil");
  const unit = getParam("unit");
  const availability = getParam("availability");
  const sort = getParam("sort");
  const minPrice = parseNumber(getParam("minPrice"));
  const maxPrice = parseNumber(getParam("maxPrice"));
  const minSize = parseNumber(getParam("minSize"));
  const maxSize = parseNumber(getParam("maxSize"));
  const minTemp = parseNumber(getParam("minTemp"));
  const maxTemp = parseNumber(getParam("maxTemp"));

  const hasMinPrice = minPrice !== undefined;
  const hasMaxPrice = maxPrice !== undefined;
  const hasMinSize = minSize !== undefined;
  const hasMaxSize = maxSize !== undefined;
  const hasMinTemp = minTemp !== undefined;
  const hasMaxTemp = maxTemp !== undefined;

  const where = {
    ...(brand ? { brand } : {}),
    ...(type ? { type: type as "OIL" | "GREASE" } : {}),
    ...(viscosity ? { viscosity } : {}),
    ...(application ? { application } : {}),
    ...(certification ? { certification } : {}),
    ...(baseOil ? { baseOil: baseOil as "MINERAL" | "SEMI_SYNTHETIC" | "SYNTHETIC" } : {}),
    ...(unit ? { unit: unit as "LITERS" | "KILOGRAMS" } : {}),
    ...(availability === "in" ? { quantity: { gt: 0 } } : {}),
    ...(hasMinPrice || hasMaxPrice
      ? { price: { gte: minPrice ?? undefined, lte: maxPrice ?? undefined } }
      : {}),
    ...(hasMinSize || hasMaxSize
      ? {
          packageSize: {
            gte: minSize ?? undefined,
            lte: maxSize ?? undefined,
          },
        }
      : {}),
    ...(hasMinTemp
      ? {
          operatingTempMin: {
            lte: Math.trunc(minTemp),
          },
        }
      : {}),
    ...(hasMaxTemp
      ? {
          operatingTempMax: {
            gte: Math.trunc(maxTemp),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case "price-asc":
        return { price: "asc" };
      case "price-desc":
        return { price: "desc" };
      case "name-asc":
        return { name: "asc" };
      case "name-desc":
        return { name: "desc" };
      default:
        return { createdAt: "desc" };
    }
  })();

  const [
    products,
    brands,
    viscosities,
    applications,
    certifications,
    baseOils,
    units,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
    }),
    prisma.product.findMany({
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["viscosity"],
      select: { viscosity: true },
      orderBy: { viscosity: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["application"],
      select: { application: true },
      orderBy: { application: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["certification"],
      select: { certification: true },
      orderBy: { certification: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["baseOil"],
      select: { baseOil: true },
      orderBy: { baseOil: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["unit"],
      select: { unit: true },
      orderBy: { unit: "asc" },
    }),
  ]);

  const filterOptions = {
    brands: brands.map((item) => item.brand),
    types: ["OIL", "GREASE"],
    viscosities: viscosities.map((item) => item.viscosity),
    applications: applications
      .map((item) => item.application)
      .filter((item): item is string => Boolean(item)),
    certifications: certifications
      .map((item) => item.certification)
      .filter((item): item is string => Boolean(item)),
    baseOils: baseOils
      .map((item) => item.baseOil)
      .filter((item): item is BaseOil => item !== null)
      .map((value) => ({
        value,
        label: t.product.baseOil[value],
      })),
    units: units.map((item) => ({
      value: item.unit,
      label: t.product.unit[item.unit as keyof typeof t.product.unit],
    })),
  };

  const hasFilters = [
    brand,
    type,
    viscosity,
    application,
    certification,
    baseOil,
    unit,
    availability,
    hasMinPrice,
    hasMaxPrice,
    hasMinSize,
    hasMaxSize,
    hasMinTemp,
    hasMaxTemp,
  ].some((value) => Boolean(value));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-12">
      <section className="fade-up grid gap-10 rounded-[32px] border border-border/60 bg-card/80 p-10 shadow-sm lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {t.home.heroTag}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t.home.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="#shop">{t.home.ctaBrowse}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/about">{t.home.ctaWhy}</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-lg">
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
                {t.home.highlightTag}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {t.home.highlightTitle}
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {t.home.highlightBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="shop" className="fade-up fade-up-delay-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{t.home.shopTitle}</h2>
          <p className="text-muted-foreground">
            {t.home.shopSubtitle}
          </p>
        </div>
        <ProductFilters options={filterOptions} />
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-10 text-center text-muted-foreground">
            {hasFilters
              ? t.home.emptyFiltered
              : t.home.emptyAll}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={Number(product.price)}
                shortDescription={product.shortDescription}
                image={product.images[0]}
                type={product.type}
                quantity={product.quantity}
                unit={product.unit}
                packageSize={Number(product.packageSize)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
