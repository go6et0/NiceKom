"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/site/locale-provider";

type ProductFormValues = {
  name: string;
  brand: string;
  shortDescription: string;
  shortDescriptionBg?: string;
  description: string;
  descriptionBg?: string;
  advantages: string[];
  advantagesBg?: string[];
  type: "OIL" | "GREASE";
  viscosity: string;
  unit: "LITERS" | "KILOGRAMS";
  packageSize: number;
  application?: string | null;
  applicationBg?: string | null;
  certification?: string | null;
  baseOil?: "MINERAL" | "SEMI_SYNTHETIC" | "SYNTHETIC" | null;
  operatingTempMin?: number | null;
  operatingTempMax?: number | null;
  price: number;
  quantity: number;
  images: string[];
};

type ProductFormProps = {
  defaultValues?: ProductFormValues;
  action: (
    prevState: { status: "idle" | "success" | "error"; message?: string },
    formData: FormData
  ) => Promise<{ status: "idle" | "success" | "error"; message?: string }>;
  submitLabel: string;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
};

export default function ProductForm({
  defaultValues,
  action,
  submitLabel,
  successMessage,
  errorMessage,
  resetOnSuccess = false,
}: ProductFormProps) {
  const { t } = useLocale();
  const formLabels = t.admin.productForm;
  const labelSuffixEn = formLabels.languageEnSuffix ?? "";
  const labelSuffixBg = formLabels.languageBgSuffix ?? "";
  const [images, setImages] = useState<string[]>(
    defaultValues?.images ?? []
  );
  const [type, setType] = useState<ProductFormValues["type"]>(
    defaultValues?.type ?? "OIL"
  );
  const [unit, setUnit] = useState<ProductFormValues["unit"]>(
    defaultValues?.unit ?? "LITERS"
  );
  const [baseOil, setBaseOil] = useState<
    ProductFormValues["baseOil"] | "NONE"
  >(defaultValues?.baseOil ?? "NONE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction] = useFormState(action, { status: "idle" });

  const advantagesText = useMemo(
    () => defaultValues?.advantages?.join("\n") ?? "",
    [defaultValues?.advantages]
  );
  const advantagesBgText = useMemo(
    () => defaultValues?.advantagesBg?.join("\n") ?? "",
    [defaultValues?.advantagesBg]
  );

  useEffect(() => {
    if (formState.status !== "success" || !resetOnSuccess) return;
    formRef.current?.reset();
    setImages([]);
    setType("OIL");
    setUnit("LITERS");
    setBaseOil("NONE");
  }, [formState.status, resetOnSuccess]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
        );
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) throw new Error(formLabels.missingCloudinary);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: form,
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || formLabels.uploadFailed);
        }
        uploaded.push(data.secure_url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const missingImages = images.length === 0;
  const canSubmit = !uploading && !missingImages;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-6 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">
          {formLabels.productName}
          {labelSuffixEn}
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="brand">{formLabels.brand}</Label>
        <Input
          id="brand"
          name="brand"
          defaultValue={defaultValues?.brand}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="shortDescription">
          {formLabels.shortDescription}
          {labelSuffixEn}
        </Label>
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={defaultValues?.shortDescription}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">
          {formLabels.fullDescription}
          {labelSuffixEn}
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={defaultValues?.description}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="advantages">
          {formLabels.advantages}
          {labelSuffixEn}
        </Label>
        <Textarea
          id="advantages"
          name="advantages"
          rows={4}
          defaultValue={advantagesText}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="shortDescriptionBg">
          {formLabels.shortDescription}
          {labelSuffixBg}
        </Label>
        <Input
          id="shortDescriptionBg"
          name="shortDescriptionBg"
          defaultValue={defaultValues?.shortDescriptionBg}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="descriptionBg">
          {formLabels.fullDescription}
          {labelSuffixBg}
        </Label>
        <Textarea
          id="descriptionBg"
          name="descriptionBg"
          rows={5}
          defaultValue={defaultValues?.descriptionBg}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="advantagesBg">
          {formLabels.advantages}
          {labelSuffixBg}
        </Label>
        <Textarea
          id="advantagesBg"
          name="advantagesBg"
          rows={4}
          defaultValue={advantagesBgText}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="type">{formLabels.productType}</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as "OIL" | "GREASE")}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder={formLabels.selectType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OIL">{t.product.type.OIL}</SelectItem>
              <SelectItem value="GREASE">{t.product.type.GREASE}</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit">{formLabels.unit}</Label>
          <Select
            value={unit}
            onValueChange={(value) => setUnit(value as "LITERS" | "KILOGRAMS")}
          >
            <SelectTrigger id="unit">
              <SelectValue placeholder={formLabels.selectUnit} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LITERS">{t.product.unit.LITERS}</SelectItem>
              <SelectItem value="KILOGRAMS">
                {t.product.unit.KILOGRAMS}
              </SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="unit" value={unit} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="viscosity">{formLabels.viscosity}</Label>
          <Input
            id="viscosity"
            name="viscosity"
            defaultValue={defaultValues?.viscosity}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="packageSize">{formLabels.packageSize}</Label>
          <Input
            id="packageSize"
            name="packageSize"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaultValues?.packageSize}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="application">
            {formLabels.application}
            {labelSuffixEn}
          </Label>
          <Input
            id="application"
            name="application"
            defaultValue={defaultValues?.application ?? ""}
            placeholder={formLabels.applicationPlaceholder}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="certification">
            {formLabels.certification}
            {labelSuffixEn}
          </Label>
          <Input
            id="certification"
            name="certification"
            defaultValue={defaultValues?.certification ?? ""}
            placeholder={formLabels.certificationPlaceholder}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="applicationBg">
          {formLabels.application}
          {labelSuffixBg}
        </Label>
        <Input
          id="applicationBg"
          name="applicationBg"
          defaultValue={defaultValues?.applicationBg ?? ""}
          placeholder={formLabels.applicationPlaceholder}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="baseOil">{formLabels.baseOil}</Label>
          <Select
            value={baseOil ?? "NONE"}
            onValueChange={(value) =>
              setBaseOil(value as ProductFormValues["baseOil"] | "NONE")
            }
          >
            <SelectTrigger id="baseOil">
              <SelectValue placeholder={formLabels.selectBaseOil} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">{formLabels.notSpecified}</SelectItem>
              <SelectItem value="MINERAL">{t.product.baseOil.MINERAL}</SelectItem>
              <SelectItem value="SEMI_SYNTHETIC">
                {t.product.baseOil.SEMI_SYNTHETIC}
              </SelectItem>
              <SelectItem value="SYNTHETIC">{t.product.baseOil.SYNTHETIC}</SelectItem>
            </SelectContent>
          </Select>
          {baseOil !== "NONE" && (
            <input type="hidden" name="baseOil" value={baseOil ?? ""} />
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="operatingTempMin">{formLabels.minTemp}</Label>
            <Input
              id="operatingTempMin"
              name="operatingTempMin"
              type="number"
              defaultValue={defaultValues?.operatingTempMin ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="operatingTempMax">{formLabels.maxTemp}</Label>
            <Input
              id="operatingTempMax"
              name="operatingTempMax"
              type="number"
              defaultValue={defaultValues?.operatingTempMax ?? ""}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">{formLabels.price}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaultValues?.price}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">{formLabels.availableQuantity}</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={defaultValues?.quantity}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="images">{formLabels.images}</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {missingImages && (
            <p className="text-sm text-muted-foreground">
              {formLabels.uploadMissing}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          {images.map((src) => (
            <div
              key={src}
              className="relative h-24 w-28 overflow-hidden rounded-xl border border-border/60"
            >
              <Image
                src={src}
                alt="Product"
                fill
                sizes="112px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((img) => img !== src))
                }
                className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-1 text-xs"
              >
                {formLabels.remove}
              </button>
            </div>
          ))}
        </div>
        {images.map((src) => (
          <input key={src} type="hidden" name="images" value={src} />
        ))}
      </div>
      {formState.status === "success" && successMessage ? (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {formState.status === "error" ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {formState.message ?? errorMessage ?? t.admin.productSaveError}
        </div>
      ) : null}
      <Button type="submit" disabled={!canSubmit}>
        {uploading ? formLabels.uploading : submitLabel}
      </Button>
    </form>
  );
}
