"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <main className="bg-[var(--paper)] px-4 py-16 text-[#2c1b10]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#b13b2a]">
            {t("title")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{t("intro")}</h1>
        </div>
        <p className="text-lg leading-8">{t("body")}</p>
        <div className="rounded-2xl border border-[#e7d6c5] bg-white/85 p-6 text-center text-lg font-semibold shadow">
          <p>{t("emailLabel")}</p>
          <a
            href="mailto:support@funopi.com"
            className="mt-2 block text-[#b13b2a] hover:underline"
          >
            support@funopi.com
          </a>
        </div>
        <p className="text-sm text-[#5f4634]">{t("response")}</p>
        <div className="pt-6">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-[#b13b2a] hover:underline"
          >
            ← Back to Funopi
          </Link>
        </div>
      </div>
    </main>
  );
}
