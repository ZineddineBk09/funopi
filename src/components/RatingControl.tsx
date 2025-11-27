"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type RatingStats = {
  average: number | null;
  count: number;
};

type RatingResponse = RatingStats & {
  userHasRated?: boolean;
};

type Props = {
  site: string;
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const LOCAL_STORAGE_KEY = "bored_user_id";

const generateVisitorId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function RatingControl({ site }: Props) {
  const t = useTranslations("ratings");
  const [stats, setStats] = useState<RatingStats>({ average: null, count: 0 });
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userHasRated, setUserHasRated] = useState(false);

  const displayedValue = useMemo(() => {
    if (hoverValue !== null) return hoverValue;
    if (stats.average !== null) return stats.average;
    return 0;
  }, [hoverValue, stats.average]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      stored = generateVisitorId();
      window.localStorage.setItem(LOCAL_STORAGE_KEY, stored);
    }
    setUserId(stored);
  }, []);

  const fetchStats = useCallback(
    async (visitorId?: string | null) => {
      setError(null);
      setMessage(null);
      try {
        const params = new URLSearchParams({ site });
        if (visitorId) {
          params.set("userId", visitorId);
        }
        const response = await fetch(`/api/ratings?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(t("loadError"));
        }
        const data = (await response.json()) as RatingResponse;
        setStats({
          average: data.average ?? null,
          count: data.count ?? 0,
        });
        setUserHasRated(Boolean(data.userHasRated));
      } catch (err) {
        console.error(err);
        setError(t("loadError"));
        setStats({ average: null, count: 0 });
        setUserHasRated(false);
      }
    },
    [site, t],
  );

  useEffect(() => {
    fetchStats(userId);
  }, [fetchStats, userId]);

  const ensureUserId = () => {
    if (userId) return userId;
    if (typeof window === "undefined") return null;
    const generated = generateVisitorId();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, generated);
    setUserId(generated);
    return generated;
  };

  const handleSubmit = async (value: number) => {
    if (userHasRated) {
      setMessage(t("alreadyShort"));
      return;
    }

    const visitorId = ensureUserId();
    if (!visitorId) {
      setError(t("visitorError"));
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, rating: value, userId: visitorId }),
      });
      if (!response.ok) {
        const payload = await response.json();
        if (response.status === 409) {
          setUserHasRated(true);
          setMessage(payload.error ?? t("alreadyShort"));
          return;
        }
        throw new Error(payload.error ?? t("submitError"));
      }
      const data = (await response.json()) as RatingResponse;
      setStats({
        average: data.average ?? null,
        count: data.count ?? 0,
      });
      setUserHasRated(Boolean(data.userHasRated ?? true));
      setMessage(t("thanks"));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
          {t("title")}
        </p>
        {stats.count > 0 && (
          <span className="text-xs text-[#5f4634]">
            {t("averageCount", {
              average: (stats.average ?? 0).toFixed(1),
              count: stats.count,
            })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {STAR_VALUES.map((value) => {
          const isFilled = value <= displayedValue;
          return (
            <button
              key={value}
              type="button"
              className="group rounded-full p-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f2c4a2]"
              aria-label={`Rate ${value} out of 5`}
              onMouseEnter={() => setHoverValue(value)}
              onMouseLeave={() => setHoverValue(null)}
              onFocus={() => setHoverValue(value)}
              onBlur={() => setHoverValue(null)}
              onClick={() => handleSubmit(value)}
              disabled={pending || userHasRated}
            >
              <StarIcon filled={isFilled} dimmed={stats.count === 0} />
            </button>
          );
        })}
        {pending && (
          <span className="text-xs text-[#8a6c52]">{t("saving")}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && message && <p className="text-xs text-[#5f4634]">{message}</p>}
      {!error && !message && stats.count === 0 && (
        <p className="text-xs italic text-[#8a6c52]">{t("empty")}</p>
      )}
      {!error && userHasRated && (
        <p className="text-xs text-[#8a6c52]">{t("already")}</p>
      )}
    </div>
  );
}

type StarProps = {
  filled: boolean;
  dimmed?: boolean;
};

function StarIcon({ filled, dimmed }: StarProps) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      className="transition-colors duration-150"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5l2.65 5.37 5.92.86-4.28 4.17 1.01 5.9L12 17.95l-5.3 2.85 1.01-5.9-4.28-4.17 5.92-.86L12 3.5z"
        fill={
          filled
            ? "#f4b544"
            : dimmed
              ? "rgba(210, 200, 186, 0.7)"
              : "rgba(117, 92, 70, 0.4)"
        }
        stroke="#ac7a3a"
        strokeWidth="0.8"
      />
    </svg>
  );
}
