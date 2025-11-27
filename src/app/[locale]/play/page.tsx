"use client";

import { useTranslations } from "next-intl";
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
  const [availableSites, setAvailableSites] =
    useState<BoredSite[]>(fallbackSites);
  const [gamesSource, setGamesSource] = useState<"sheet" | "fallback">(
    fallbackSites.length ? "fallback" : "sheet",
  );
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(() =>
    fallbackSites.length ? getRandomIndex(fallbackSites.length) : 0,
  );

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
          setCurrentIndex(getRandomIndex(data.sites.length));
          setGamesSource(data.source ?? "sheet");
          setGamesError(null);
        }
      } catch {
        if (!cancelled) {
          setGamesError(t("loadError"));
          setAvailableSites(fallbackSites);
          setGamesSource("fallback");
        }
      }
    }

    loadGames();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const currentSite = useMemo(
    () => availableSites[currentIndex],
    [availableSites, currentIndex],
  );

  const cycleSite = useCallback(() => {
    setCurrentIndex((prev) => getRandomIndex(availableSites.length, prev));
  }, [availableSites.length]);

  if (!availableSites.length || !currentSite) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-4 text-center text-[#2c1b10]">
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
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4eb] text-[#2b1d11]">
      <header className="sticky top-0 z-10 border-b border-[#d5c7b5] bg-white/90 px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-4">
          <div className="flex min-w-[250px] flex-1 flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
              {t("heading")}
            </p>
            <p className="text-lg font-semibold">{currentSite.title}</p>
            <p className="text-sm text-[#6f5240]">{currentSite.description}</p>
            <RatingControl site={currentSite.title} />
            {/* <p className="text-xs text-[#a07c64]">
              {gamesSource === "sheet"
                ? t("sourceSheet")
                : t("sourceFallback")}
            </p> */}
            {gamesError && <p className="text-xs text-red-600">{gamesError}</p>}
          </div>
          <nav className="flex items-center gap-3 text-sm text-[#a02a2a]">
            <Link href="/" className="hover:underline">
              {t("navHome")}
            </Link>
            <span>•</span>
            <a
              href={currentSite.url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {t("navRemoveFrame")}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <BoredButton
              size="small"
              label={t("button")}
              onClick={cycleSite}
              disabled={availableSites.length < 2}
            />
            <p className="max-w-[10rem] text-xs uppercase tracking-[0.3em] text-[#5b3925]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <iframe
          key={currentSite.url}
          src={currentSite.url}
          title={currentSite.title}
          loading="lazy"
          className="h-[calc(100vh-96px)] w-full flex-1 border-0 bg-black"
        />
      </div>
    </div>
  );
}
