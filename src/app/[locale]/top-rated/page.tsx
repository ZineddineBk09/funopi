import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildSiteRatingSummaries } from "@/lib/adminRatings";

export const metadata: Metadata = {
  title: "Top Rated Funopi Experiences",
  description:
    "See which Funopi web toys are earning the highest ratings this week, ranked by community stars.",
};

type TopRatedPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TopRatedPage({ params }: TopRatedPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "topRatedPage" });
  const summaries = (await buildSiteRatingSummaries()).slice(0, 20);

  return (
    <main className="bg-[var(--paper)] px-4 py-16 text-[#2c1b10]">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
            {t("tagline")}
          </p>
          <h1 className="text-4xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-[#7a5b45]">{t("description")}</p>
          <Link
            href="/"
            locale={locale}
            className="inline-block text-xs uppercase tracking-[0.3em] text-[#b13b2a] hover:underline"
          >
            ← {t("backHome")}
          </Link>
        </header>

        {summaries.length === 0 ? (
          <p className="text-center text-sm text-[#7a5b45]">{t("empty")}</p>
        ) : (
          <ol className="space-y-4">
            {summaries.map((entry, index) => (
              <li
                key={entry.title}
                className="flex items-center justify-between rounded-2xl border border-[#ead8c3] bg-white/90 px-6 py-4 shadow"
              >
                <Link
                  href={{
                    pathname: "/play",
                    query: { game: entry.title },
                  }}
                  locale={locale}
                  className="flex items-center gap-4"
                >
                  <span className="text-3xl font-semibold text-[#b13b2a]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{entry.title}</p>
                    <p className="text-xs text-[#7a5b45]">
                      {entry.lastRatingAt
                        ? t("lastRated", {
                            date: new Date(entry.lastRatingAt).toLocaleString(),
                          })
                        : t("noRatings")}
                    </p>
                  </div>
                </Link>
                <div className="text-right text-sm">
                  <p className="font-semibold text-[#b13b2a]">
                    {entry.average
                      ? t("average", { value: entry.average.toFixed(2) })
                      : t("noAverage")}
                  </p>
                  <p className="text-xs text-[#7a5b45]">
                    {t("ratingsCount", { count: entry.count })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

