import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { buildSiteRatingSummaries } from "@/lib/adminRatings";

type TopPageProps = {
  params: { locale: string };
};

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Funopi Leaderboard",
  description:
    "Browse the top 20 Funopi experiences ranked by real player ratings and discover what to launch next.",
};

export default async function TopRatedPage({ params }: TopPageProps) {
  const { locale } = params;
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "top" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const summaries = await buildSiteRatingSummaries().catch(() => []);
  const topEntries = summaries.slice(0, 20);
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="bg-[var(--paper)] px-4 py-16 text-[#2c1b10]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-2xl border border-[#d5c7b5] bg-white/90 px-6 py-6 text-center shadow">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
            {t("tagline")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-3 text-sm text-[#6f5240]">{t("description")}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#a07c64]">
            {t("updated", { date: formatter.format(new Date()) })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.3em]">
            <Link
              href="/play"
              className="rounded-full border border-[#b13b2a] px-4 py-2 text-[#b13b2a] transition hover:bg-[#b13b2a] hover:text-white"
            >
              {t("ctaPlay")}
            </Link>
            <Link href="/" className="text-[#5a3b26] hover:underline">
              {t("ctaHome")}
            </Link>
          </div>
        </header>

        {topEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d5c7b5] bg-white/70 px-6 py-10 text-center text-sm text-[#6f5240]">
            {t("empty")}
          </div>
        ) : (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6f5240]">
              {t("listLabel", { count: topEntries.length })}
            </p>
            <ol className="space-y-3">
              {topEntries.map((entry, index) => {
                const averageLabel =
                  entry.average !== null
                    ? tCommon("ratingDisplay", {
                        average: entry.average.toFixed(2),
                        count: entry.count,
                      })
                    : t("card.noScore");
                const lastRated = entry.lastRatingAt
                  ? t("card.lastRated", {
                      date: formatter.format(new Date(entry.lastRatingAt)),
                    })
                  : t("card.lastRatedUnknown");

                return (
                  <li
                    key={`${entry.title}-${index}`}
                    className="flex items-center gap-4 rounded-2xl border border-[#e7d6c5] bg-white/95 p-4 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b13b2a] text-lg font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-lg font-semibold">{entry.title}</p>
                        <span className="text-xs uppercase tracking-[0.3em] text-[#a07c64]">
                          {t("card.rank", { rank: index + 1 })}
                        </span>
                      </div>
                      <p className="text-sm text-[#b13b2a]">{averageLabel}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5f4634]">
                        <span>{t("card.ratings", { count: entry.count })}</span>
                        <span>•</span>
                        <span>{lastRated}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
