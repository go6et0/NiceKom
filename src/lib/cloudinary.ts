const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/upload/";

type RemoveBgMode = "background_removal" | "make_transparent";

function isCloudinaryUrl(url: string) {
  return url.includes(CLOUDINARY_HOST) && url.includes(UPLOAD_SEGMENT);
}

function hasTransformations(pathAfterUpload: string) {
  const firstSegment = pathAfterUpload.split("/")[0] ?? "";
  return (
    firstSegment.includes("e_") ||
    firstSegment.includes("c_") ||
    firstSegment.includes("f_") ||
    firstSegment.includes("q_") ||
    firstSegment.includes("w_") ||
    firstSegment.includes("h_")
  );
}

function getConfiguredRemoveBgMode(): RemoveBgMode {
  const mode = process.env.NEXT_PUBLIC_CLOUDINARY_REMOVE_BG_MODE?.toLowerCase();
  return mode === "background_removal" ? "background_removal" : "make_transparent";
}

function buildCloudinaryUrl(url: string, mode: RemoveBgMode) {
  if (!url || !isCloudinaryUrl(url)) return url;

  const [prefix, suffix] = url.split(UPLOAD_SEGMENT);
  if (!prefix || !suffix || hasTransformations(suffix)) return url;

  const removeBackground =
    process.env.NEXT_PUBLIC_CLOUDINARY_REMOVE_BG?.toLowerCase() === "true";
  const transforms = ["f_auto", "q_auto"];

  if (removeBackground) {
    if (mode === "background_removal") {
      transforms.unshift("e_background_removal");
    } else {
      transforms.unshift("e_make_transparent:10");
    }
  }

  return `${prefix}${UPLOAD_SEGMENT}${transforms.join(",")}/${suffix}`;
}

export function getProductImageSrc(url: string) {
  return buildCloudinaryUrl(url, getConfiguredRemoveBgMode());
}

export function getProductImageWithFallback(url: string) {
  const mode = getConfiguredRemoveBgMode();
  const primary = buildCloudinaryUrl(url, mode);
  const fallback =
    mode === "background_removal" ? buildCloudinaryUrl(url, "make_transparent") : primary;

  return { primary, fallback };
}
