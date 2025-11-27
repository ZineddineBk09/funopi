"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations("privacy");
  const sections = t.raw("sections") as Array<{
    heading: string;
    points: string[];
  }>;

  return (
    <main className="bg-[var(--paper)] px-4 py-16 text-[#2c1b10]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#b13b2a]">
            {t("title")}
          </p>
          <p className="mt-3 text-lg leading-8">{t("intro")}</p>
        </div>
        <div className="space-y-5">
          {sections.map((section, index) => (
            <section
              key={index}
              className="rounded-2xl border border-[#e7d6c5] bg-white/85 p-6 shadow"
            >
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-[#5f4634]">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="text-sm text-[#5f4634]">{t("questions")}</p>
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
