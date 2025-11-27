"use client";

import { useTranslations } from "next-intl";
import BoredButton from "@/components/BoredButton";
import { Link, useRouter } from "@/i18n/navigation";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");

  const description = t.rich("description", {
    bold: (chunks) => <span className="font-semibold">{chunks}</span>,
  });

  return (
    <main className="bg-[var(--paper)] text-center">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-16 sm:py-24">
        <BoredButton
          size="large"
          onClick={() => router.push("/play")}
          className="mb-10"
          label={t("tagline")}
        />
        <p className="text-sm uppercase tracking-[0.4em] text-[#a02a2a]">
          {t("tagline")}
        </p>
        <h1 className="mb-4 text-5xl font-semibold sm:text-6xl">
          {t("headline")}
        </h1>
        <p className="mb-2 text-lg italic text-[#5e4430]">{t("subhead")}</p>
        <p className="max-w-2xl text-lg leading-[1.8] text-[#2c1b10]">
          {description}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-[#a02a2a]">
          {/* <Link href="#submit" className="hover:underline">
            {t("submit")}
          </Link> */}
          {/* <span>•</span> */}
          <Link href="/about" className="hover:underline">
            {t("terms")}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">
            {t("privacy")}
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:underline">
            {t("contact")}
          </Link>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#7d5b42]">
          {t("footer", { year: new Date().getFullYear() })}
        </p>
      </div>
    </main>
  );
}

