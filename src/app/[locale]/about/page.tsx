"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AboutPage() {
  const t = useTranslations("about");

  const items = t.raw("items") as string[];

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
        <section className="rounded-2xl border border-[#e7d6c5] bg-white/85 p-6 shadow">
          <h2 className="text-lg font-semibold">{t("listTitle")}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-[#5f4634]">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
        <p className="text-lg leading-8">{t("goal")}</p>
        <p className="text-lg font-semibold italic text-[#b13b2a]">
          {t("cta")}
        </p>
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

