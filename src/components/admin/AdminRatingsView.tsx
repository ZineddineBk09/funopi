"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SiteRatingSummary } from "@/lib/adminRatings";

type Props = {
  summaries: SiteRatingSummary[];
};

type RatingDetail = {
  rating: number;
  timestamp: string | null;
  userId: string;
  userAgent: string;
};

export default function AdminRatingsView({ summaries }: Props) {
  const t = useTranslations("admin.ratings");
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [details, setDetails] = useState<
    Record<
      string,
      { loading: boolean; error: string | null; rows: RatingDetail[] }
    >
  >({});

  const maxCount = Math.max(...summaries.map((item) => item.count), 1);
  const maxAvg = Math.max(...summaries.map((item) => item.average ?? 0), 5);

  const handleToggle = async (title: string) => {
    if (expandedSite === title) {
      setExpandedSite(null);
      return;
    }
    setExpandedSite(title);
    if (details[title]?.rows?.length) {
      return;
    }
    setDetails((prev) => ({
      ...prev,
      [title]: { loading: true, error: null, rows: [] },
    }));
    try {
      const response = await fetch(
        `/api/admin/ratings/details?site=${encodeURIComponent(title)}`,
        { cache: "no-store" },
      );
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? t("detailError"));
      }
      const payload = await response.json();
      setDetails((prev) => ({
        ...prev,
        [title]: {
          loading: false,
          error: null,
          rows: payload.ratings ?? [],
        },
      }));
    } catch {
      setDetails((prev) => ({
        ...prev,
        [title]: {
          loading: false,
          error: t("detailError"),
          rows: [],
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-[#2b1d11]">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="rounded-2xl border border-[#d5c7b5] bg-white/85 px-6 py-5 shadow">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
            {t("tagline")}
          </p>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-[#7a5b45]">{t("description")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/admin"
              className="text-xs uppercase tracking-[0.3em] text-[#b13b2a]"
            >
              {t("back")}
            </Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/admin/ratings/export"
              className="rounded-full border border-[#b13b2a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#b13b2a]"
            >
              {t("export")}
            </a>
          </div>
        </header>

        {summaries.length === 0 ? (
          <div className="rounded-2xl border border-[#d5c7b5] bg-white/90 px-6 py-10 text-center shadow">
            <p className="text-sm text-[#7a5b45]">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-[#d5c7b5] bg-white/95 p-6 shadow">
            {summaries.map((summary) => {
              const widthPercent = (summary.count / maxCount) * 100;
              const avgPercent =
                ((summary.average ?? 0) / Math.max(maxAvg, 5)) * 100;
              const isExpanded = expandedSite === summary.title;
              const detailState = details[summary.title];

              return (
                <article
                  key={summary.title}
                  className="rounded-xl border border-[#ede0d4] bg-[#fdf9f4]"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(summary.title)}
                    className="w-full rounded-t-xl px-4 py-4 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {summary.title}
                        </h2>
                        <p className="text-xs text-[#7a5b45]">
                          {summary.lastRatingAt
                            ? t("lastRating", {
                                timestamp: new Date(
                                  summary.lastRatingAt,
                                ).toLocaleString(),
                              })
                            : t("lastRatingNone")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#b13b2a]">
                          {t("ratingValue", {
                            value: (summary.average ?? 0).toFixed(2),
                          })}
                        </p>
                        <p className="text-xs text-[#7a5b45]">
                          {t("countLabel", { count: summary.count })}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#bda488]">
                          {isExpanded ? t("hideDetails") : t("showDetails")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <BarRow
                        label={t("bars.average")}
                        percent={avgPercent}
                        accent
                      />
                      <BarRow label={t("bars.volume")} percent={widthPercent} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[#ede0d4] px-4 py-4">
                      {!detailState || detailState.loading ? (
                        <p className="text-sm text-[#7a5b45]">{t("loading")}</p>
                      ) : detailState.error ? (
                        <p className="text-sm text-red-600">
                          {detailState.error}
                        </p>
                      ) : detailState.rows.length === 0 ? (
                        <p className="text-sm text-[#7a5b45]">
                          {t("noHistory")}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-[0.3em] text-[#7a5b45]">
                                <th className="py-2 pr-4">
                                  {t("table.rating")}
                                </th>
                                <th className="py-2 pr-4">
                                  {t("table.visitor")}
                                </th>
                                <th className="py-2 pr-4">
                                  {t("table.userAgent")}
                                </th>
                                <th className="py-2 pr-4">
                                  {t("table.timestamp")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailState.rows.map((row, index) => (
                                <tr
                                  key={`${row.timestamp ?? "row"}-${index}`}
                                  className="border-t border-[#f0e2d3]"
                                >
                                  <td className="py-2 pr-4 font-semibold text-[#b13b2a]">
                                    {row.rating}
                                  </td>
                                  <td className="py-2 pr-4 text-[#5f4634]">
                                    {row.userId}
                                  </td>
                                  <td className="py-2 pr-4 text-[#5f4634]">
                                    {row.userAgent}
                                  </td>
                                  <td className="py-2 pr-4 text-[#5f4634]">
                                    {row.timestamp
                                      ? new Date(row.timestamp).toLocaleString()
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BarRow({
  label,
  percent,
  accent = false,
}: {
  label: string;
  percent: number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#7a5b45]">
        <span>{label}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="mt-1 h-3 rounded-full bg-[#f0e2d3]">
        <div
          className={`h-full rounded-full ${
            accent
              ? "bg-gradient-to-r from-[#ffb347] to-[#ff5f6d]"
              : "bg-[#c25634]"
          } transition-all`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}
