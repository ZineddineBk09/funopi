"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type Props = {
  variant?: "floating" | "inline";
  className?: string;
  hideOnAdmin?: boolean;
};

const LANG_OPTIONS = [
  { locale: "en", label: "EN", flag: "GB" },
  { locale: "ar", label: "AR", flag: "SA" },
] as const;

export default function LanguageSwitcher({
  variant = "floating",
  className = "",
  hideOnAdmin = false,
}: Props) {
  const activeLocale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();

  if (hideOnAdmin && pathname?.includes("/admin")) {
    return null;
  }

  const content = (
    <div
      className={`flex items-center gap-2 text-xs uppercase tracking-[0.3em] ${className}`}
    >
      {/* <span className="text-[#b13b2a]">{t("language")}</span> */}
      <div className="flex gap-1">
        {LANG_OPTIONS.map((option) => {
          const isActive = option.locale === activeLocale;
          return (
            <Link
              key={option.locale}
              href="/"
              locale={option.locale}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                isActive
                  ? "bg-[#b13b2a] !text-white shadow"
                  : "text-[#5a3b26] hover:text-[#b13b2a]"
              }`}
            >
              <Image
                src={`https://flagsapi.com/${option.flag}/flat/24.png`}
                alt={`${option.label} flag`}
                width={16}
                height={16}
                className="rounded-full"
                priority
              />
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <div className="pointer-events-auto fixed right-4 top-4 z-50 rounded-full border border-[#d5c7b5] bg-white/85 px-4 py-2 shadow">
      {content}
    </div>
  );
}
