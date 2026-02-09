"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/site/locale-provider";

type BrandFilterProps = {
  brands: string[];
};

export default function BrandFilter({ brands }: BrandFilterProps) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("brand") ?? "all";
  const { t } = useLocale();

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const next = new URLSearchParams(params.toString());
        if (value === "all") {
          next.delete("brand");
        } else {
          next.set("brand", value);
        }
        router.push(`/?${next.toString()}`);
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder={t.filters.brandPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t.filters.allBrands}</SelectItem>
        {brands.map((brand) => (
          <SelectItem key={brand} value={brand}>
            {brand}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
