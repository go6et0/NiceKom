"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/site/theme-provider";
import { useLocale } from "@/components/site/locale-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLocale();
  const label =
    theme === "dark" ? t.nav.switchToLight : t.nav.switchToDark;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
