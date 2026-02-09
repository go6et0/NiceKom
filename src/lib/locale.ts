import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

const COOKIE_NAME = "nicekom-locale";

export async function getLocale(): Promise<Locale> {
  const stored = (await cookies()).get(COOKIE_NAME)?.value;
  if (isLocale(stored)) return stored;
  return defaultLocale;
}

export const localeCookieName = COOKIE_NAME;
