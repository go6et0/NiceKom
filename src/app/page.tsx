import Link from "next/link";
import { BaseOil, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { getProductText } from "@/lib/product-text";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<
    string,
    string | string[] | undefined
  >;
};

const PAGE_SIZE = 9;

export default async function Home({ searchParams }: HomeProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const isBg = locale === "bg";
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
  const query = getParam("q")?.trim();
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
  const pageParam = Number(getParam("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const skip = (page - 1) * PAGE_SIZE;

  const hasMinPrice = minPrice !== undefined;
  const hasMaxPrice = maxPrice !== undefined;
  const hasMinSize = minSize !== undefined;
  const hasMaxSize = maxSize !== undefined;
  const hasMinTemp = minTemp !== undefined;
  const hasMaxTemp = maxTemp !== undefined;

  const applicationFilter =
    application && isBg
      ? { applicationBg: application }
      : application
      ? { application }
      : {};
  const certificationFilter = certification ? { certification } : {};

  let searchFilter: Prisma.ProductWhereInput = {};
  if (query && query.length > 0) {
    const containsFilter = (value: string) => ({
      contains: value,
      mode: Prisma.QueryMode.insensitive,
    });

    const orFilters: Prisma.ProductWhereInput[] = [
      { name: containsFilter(query) },
      { brand: containsFilter(query) },
      { viscosity: containsFilter(query) },
      { shortDescription: containsFilter(query) },
      { description: containsFilter(query) },
    ];

    if (isBg) {
      orFilters.push(
        { shortDescriptionBg: containsFilter(query) },
        { descriptionBg: containsFilter(query) }
      );
    }

    searchFilter = { OR: orFilters };
  }

  const where: Prisma.ProductWhereInput = {
    ...searchFilter,
    ...(brand ? { brand } : {}),
    ...(type ? { type: type as "OIL" | "GREASE" } : {}),
    ...(viscosity ? { viscosity } : {}),
    ...applicationFilter,
    ...certificationFilter,
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

  const applicationPromise = isBg
    ? prisma.product.findMany({
        distinct: ["applicationBg"],
        select: { applicationBg: true },
        orderBy: { applicationBg: "asc" },
      })
    : prisma.product.findMany({
        distinct: ["application"],
        select: { application: true },
        orderBy: { application: "asc" },
      });
  const certificationPromise = prisma.product.findMany({
    distinct: ["certification"],
    select: { certification: true },
    orderBy: { certification: "asc" },
  });

  const [
    products,
    productsCount,
    brands,
    viscosities,
    applicationItems,
    certificationItems,
    baseOils,
    units,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({
      where,
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
    applicationPromise,
    certificationPromise,
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

  const applications = isBg
    ? (applicationItems as Array<{ applicationBg: string | null }>)
        .map((item) => item.applicationBg)
        .filter((item): item is string => Boolean(item))
    : (applicationItems as Array<{ application: string | null }>)
        .map((item) => item.application)
        .filter((item): item is string => Boolean(item));
  const certifications = (certificationItems as Array<{
    certification: string | null;
  }>)
    .map((item) => item.certification)
    .filter((item): item is string => Boolean(item));

  const filterOptions = {
    brands: brands.map((item) => item.brand),
    types: ["OIL", "GREASE"],
    viscosities: viscosities.map((item) => item.viscosity),
    applications,
    certifications,
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
    query,
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

  const totalPages = Math.max(1, Math.ceil(productsCount / PAGE_SIZE));
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (key === "page") return;
      if (Array.isArray(value)) {
        if (value[0]) params.set(key, value[0]);
        return;
      }
      if (value) params.set(key, value);
    });

    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

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
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const text = getProductText(product, locale);
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={text.name}
                    brand={product.brand}
                    price={Number(product.price)}
                    shortDescription={text.shortDescription}
                    image={product.images[0]}
                    type={product.type}
                    quantity={product.quantity}
                    unit={product.unit}
                    packageSize={Number(product.packageSize)}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              {previousPage ? (
                <Link
                  href={buildPageHref(previousPage)}
                  className="rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-background/70"
                >
                  {t.home.previousPage}
                </Link>
              ) : (
                <span />
              )}
              <p className="text-sm text-muted-foreground">
                {t.home.pageLabel} {page} / {totalPages}
              </p>
              {nextPage ? (
                <Link
                  href={buildPageHref(nextPage)}
                  className="rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-background/70"
                >
                  {t.home.nextPage}
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
