"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/site/locale-provider";

type FilterOptions = {
  brands: string[];
  types: string[];
  viscosities: string[];
  applications: string[];
  certifications: string[];
  baseOils: { value: string; label: string }[];
  units: { value: string; label: string }[];
};

export default function ProductFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const hasActiveFilters = Array.from(params.entries()).some(([key, value]) => {
    if (!value) return false;
    if (key === "sort") return value !== "newest";
    return true;
  });
  const [isOpen, setIsOpen] = useState(hasActiveFilters);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const raw = value.toString().trim();
      if (!raw || raw === "all" || (key === "sort" && raw === "newest")) {
        continue;
      }
      next.set(key, raw);
    }

    const query = next.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 text-sm shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? t.filters.toggleHide : t.filters.toggleShow}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Label
            htmlFor="sort"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t.filters.sortLabel}
          </Label>
          <select
            id="sort"
            name="sort"
            defaultValue={params.get("sort") ?? "newest"}
            className="h-10 rounded-md border border-border/60 bg-background px-3"
          >
            <option value="newest">{t.filters.sortNewest}</option>
            <option value="price-asc">{t.filters.sortPriceAsc}</option>
            <option value="price-desc">{t.filters.sortPriceDesc}</option>
            <option value="name-asc">{t.filters.sortNameAsc}</option>
            <option value="name-desc">{t.filters.sortNameDesc}</option>
          </select>
        </div>
        <Button type="submit">{t.filters.apply}</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/")}
        >
          {t.filters.clear}
        </Button>
      </div>

      {isOpen ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="brand">{t.filters.brand}</Label>
              <select
                id="brand"
                name="brand"
                defaultValue={params.get("brand") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">{t.filters.type}</Label>
              <select
                id="type"
                name="type"
                defaultValue={params.get("type") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.types.map((type) => (
                  <option key={type} value={type}>
                    {type === "OIL" ? t.product.type.OIL : t.product.type.GREASE}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseOil">{t.filters.baseOil}</Label>
              <select
                id="baseOil"
                name="baseOil"
                defaultValue={params.get("baseOil") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.baseOils.map((baseOil) => (
                  <option key={baseOil.value} value={baseOil.value}>
                    {baseOil.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="viscosity">{t.filters.viscosity}</Label>
              <select
                id="viscosity"
                name="viscosity"
                defaultValue={params.get("viscosity") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.viscosities.map((viscosity) => (
                  <option key={viscosity} value={viscosity}>
                    {viscosity}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="application">{t.filters.application}</Label>
              <select
                id="application"
                name="application"
                defaultValue={params.get("application") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.applications.map((application) => (
                  <option key={application} value={application}>
                    {application}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certification">{t.filters.certification}</Label>
              <select
                id="certification"
                name="certification"
                defaultValue={params.get("certification") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.certifications.map((certification) => (
                  <option key={certification} value={certification}>
                    {certification}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">{t.filters.unit}</Label>
              <select
                id="unit"
                name="unit"
                defaultValue={params.get("unit") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                {options.units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability">{t.filters.availability}</Label>
              <select
                id="availability"
                name="availability"
                defaultValue={params.get("availability") ?? "all"}
                className="h-10 rounded-md border border-border/60 bg-background px-3"
              >
                <option value="all">{t.filters.all}</option>
                <option value="in">{t.filters.availabilityIn}</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="minPrice">{t.filters.minPrice}</Label>
              <Input
                id="minPrice"
                name="minPrice"
                type="number"
                step="0.01"
                defaultValue={params.get("minPrice") ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPrice">{t.filters.maxPrice}</Label>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                step="0.01"
                defaultValue={params.get("maxPrice") ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minSize">{t.filters.minSize}</Label>
              <Input
                id="minSize"
                name="minSize"
                type="number"
                step="0.01"
                defaultValue={params.get("minSize") ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxSize">{t.filters.maxSize}</Label>
              <Input
                id="maxSize"
                name="maxSize"
                type="number"
                step="0.01"
                defaultValue={params.get("maxSize") ?? ""}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="minTemp">{t.filters.minTemp}</Label>
              <Input
                id="minTemp"
                name="minTemp"
                type="number"
                defaultValue={params.get("minTemp") ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxTemp">{t.filters.maxTemp}</Label>
              <Input
                id="maxTemp"
                name="maxTemp"
                type="number"
                defaultValue={params.get("maxTemp") ?? ""}
              />
            </div>
          </div>
        </>
      ) : null}
    </form>
  );
}
