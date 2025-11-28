"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import BoredButton from "@/components/BoredButton";
import RatingControl from "@/components/RatingControl";
import type { BoredSite } from "@/data/sites";
import { sites as fallbackSites } from "@/data/sites";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const getRandomIndex = (length: number, exclude?: number) => {
  if (!length) return -1;
  if (length === 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (exclude === undefined) return next;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
};

export default function PlayPage() {
  const t = useTranslations("play");
  const searchParams = useSearchParams();
  const [availableSites, setAvailableSites] = useState<BoredSite[]>([]);
  const [gamesSource, setGamesSource] = useState<"sheet" | "fallback">(
    fallbackSites.length ? "fallback" : "sheet"
  );
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingTarget, setLoadingTarget] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const response = await fetch("/api/games", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("failed");
        }
        const data: { sites: BoredSite[]; source?: "sheet" | "fallback" } =
          await response.json();

        if (!cancelled && Array.isArray(data.sites) && data.sites.length) {
          setAvailableSites(data.sites);
          setGamesSource(data.source ?? "sheet");
          setGamesError(null);
          const paramName = searchParams?.get("game");
          let targetIdx = -1;
          if (paramName) {
            const normalizedParam = decodeURIComponent(paramName).toLowerCase();
            targetIdx = data.sites.findIndex(
              (site) => site.title.toLowerCase() === normalizedParam
            );
          }
          setCurrentIndex(
            targetIdx >= 0 ? targetIdx : getRandomIndex(data.sites.length)
          );
          setLoadingTarget(false);
        }
      } catch {
        if (!cancelled) {
          setGamesError(t("loadError"));
          setAvailableSites(fallbackSites);
          setGamesSource("fallback");
          setCurrentIndex(
            fallbackSites.length ? getRandomIndex(fallbackSites.length) : 0
          );
          setLoadingTarget(false);
        }
      }
    }

    loadGames();
    return () => {
      cancelled = true;
    };
  }, [t, searchParams]);

  const currentSite = useMemo(
    () => (loadingTarget ? null : availableSites[currentIndex]),
    [availableSites, currentIndex, loadingTarget]
  );

  const cycleSite = useCallback(() => {
    setCurrentIndex((prev) => getRandomIndex(availableSites.length, prev));
  }, [availableSites.length]);

  if (!availableSites.length || !currentSite || loadingTarget) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-[#2c1b10]">
        {loadingTarget ? (
          <>
            <p className="text-lg font-medium">{t("loadingSelection")}</p>
            <p className="mt-2 text-sm text-[#6d5441]">{t("loadingHint")}</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">{t("fallbackTitle")}</p>
            <p className="mt-2 max-w-md text-sm text-[#6d5441]">
              {t("fallbackBody")}
            </p>
            <Link
              href="/"
              className="mt-6 text-sm uppercase tracking-[0.3em] text-[#a02a2a]"
            >
              {t("fallbackCta")}
            </Link>
          </>
        )}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4eb] text-[#2b1d11]">
      <header className="sticky top-0 z-10 border-b border-[#d5c7b5] bg-white/90 px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-1 md:gap-4">
          <div className="flex md:min-w-[250px] flex-1 flex-col gap-1">
            {/* <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
              {t("heading")}
            </p> */}
            <p className="text-lg font-semibold truncate">
              {currentSite.title}
            </p>
            <p className="text-xs text-[#6f5240] overflow-hidden text-ellipsis whitespace-nowrap sm:whitespace-normal sm:overflow-visible hidden md:block">
              {currentSite.description}
            </p>
            <div className="mt-1 scale-[0.9] origin-left sm:mt-2 sm:scale-100">
              <RatingControl site={currentSite.title} />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-end gap-2 sm:flex-none sm:items-end">
          <LanguageSwitcher hideOnAdmin={false} />
            <nav className="flex items-center gap-2 text-xs text-[#a02a2a] sm:justify-end sm:text-sm">
              <Link href="/" className="hover:underline">
                {t("navHome")}
              </Link>
              <span>•</span>
              <a
                href={currentSite.url}
                // target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {t("navRemoveFrame")}
              </a>
            </nav>
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:justify-end">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#5b3925] sm:text-xs w-[150px]">
                {t("subtitle")}
              </p>
              <BoredButton
                size="small"
                label={t("button")}
                onClick={cycleSite}
                disabled={availableSites.length < 2}
              />
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <iframe
          key={currentSite.url}
          src={currentSite.url}
          title={currentSite.title}
          loading="lazy"
          className="w-full flex-1 border-0 bg-black"
        />
      </div>
    </div>
  );
}
