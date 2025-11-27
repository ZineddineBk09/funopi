"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { AdminStats } from "@/lib/adminStats";
import type { SheetGameRecord } from "@/lib/games";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Props = {
  initialStats: AdminStats;
  initialGames: SheetGameRecord[];
};

type GameFormState = {
  title: string;
  url: string;
  description: string;
};

const emptyForm: GameFormState = {
  title: "",
  url: "",
  description: "",
};

export default function AdminDashboard({ initialStats, initialGames }: Props) {
  const router = useRouter();
  const t = useTranslations("admin.dashboard");
  const [stats, setStats] = useState(initialStats);
  const [games, setGames] = useState(initialGames);
  const [form, setForm] = useState<GameFormState>(emptyForm);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTarget, setPreviewTarget] = useState<SheetGameRecord | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<{
    loading: boolean;
    error: string | null;
    stats?: { average: number | null; count: number; description?: string };
    embed?: {
      ok: boolean;
      status?: string | null;
      xFrameOptions?: string | null;
      contentSecurityPolicy?: string | null;
      error?: string | null;
    };
  }>({ loading: false, error: null });

  const handleUnauthorized = () => {
    router.refresh();
  };

  const refreshStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", { cache: "no-store" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) throw new Error(t("messages.refreshStatsError"));
      setStats(await response.json());
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : t("messages.refreshStatsError"),
      );
    }
  };

  const refreshGames = async () => {
    try {
      const response = await fetch("/api/admin/games", { cache: "no-store" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) throw new Error(t("messages.refreshGamesError"));
      const payload = await response.json();
      setGames(payload.games);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : t("messages.refreshGamesError"),
      );
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim(),
      };
      if (!payload.title || !payload.url) {
        throw new Error(t("messages.formRequired"));
      }
      const endpoint =
        editingRow !== null
          ? `/api/admin/games/${editingRow}`
          : "/api/admin/games";
      const method = editingRow !== null ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? t("messages.saveError"));
      }
      const data = await response.json();
      setGames(data.games);
      setForm(emptyForm);
      setEditingRow(null);
      setMessage(t("messages.saveSuccess"));
      refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messages.saveError"));
    } finally {
      setPending(false);
    }
  };

  const handleEdit = (record: SheetGameRecord) => {
    setForm({
      title: record.title,
      url: record.url,
      description: record.description,
    });
    setEditingRow(record.rowNumber);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (rowNumber: number) => {
    const confirmDelete = window.confirm(t("messages.deleteConfirm"));
    if (!confirmDelete) return;
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/games/${rowNumber}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? t("messages.deleteError"));
      }
      const data = await response.json();
      setGames(data.games);
      if (editingRow === rowNumber) {
        setEditingRow(null);
        setForm(emptyForm);
      }
      setMessage(t("messages.deleteSuccess"));
      refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messages.deleteError"));
    } finally {
      setPending(false);
    }
  };

  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games;
    const term = searchTerm.toLowerCase();
    return games.filter((game) => game.title.toLowerCase().includes(term));
  }, [games, searchTerm]);

  const openPreview = async (game: SheetGameRecord) => {
    setPreviewTarget(game);
    setPreviewData({ loading: true, error: null });
    try {
      const response = await fetch("/api/admin/games/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: game.title, url: game.url }),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? t("messages.previewError"));
      }
      const data = await response.json();
      setPreviewData({
        loading: false,
        error: null,
        stats: data.stats,
        embed: data.embed,
      });
    } catch (err) {
      setPreviewData({
        loading: false,
        error: err instanceof Error ? err.message : t("messages.previewError"),
      });
    }
  };

  const closePreview = () => {
    setPreviewTarget(null);
    setPreviewData({ loading: false, error: null });
  };

  return (
    <div className="min-h-screen bg-[#f7f4eb] px-4 py-10 text-[#2b1d11]">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d5c7b5] bg-white/80 px-6 py-4 shadow">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
              {t("tagline")}
            </p>
            <h1 className="text-2xl font-semibold">{t("welcome")}</h1>
            <p className="text-xs text-[#7a5b45]">
              {t("lastRefreshed", {
                timestamp: new Date(stats.lastUpdated).toLocaleString(),
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <LanguageSwitcher variant="inline" />
            <Link
              href="/admin/ratings"
              className="text-[#5a3b26] hover:underline"
            >
              {t("ratingsView")}
            </Link>
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-[#b13b2a] px-4 py-2 text-sm font-semibold text-[#b13b2a] transition hover:bg-[#b13b2a] hover:text-white"
            >
              {t("logout")}
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("stats.active")} value={stats.totalGames} />
          <StatCard label={t("stats.sheet")} value={stats.sheetGamesCount} />
          <StatCard label={t("stats.ratings")} value={stats.ratingsCount} />
          <StatCard label={t("stats.visitors")} value={stats.uniqueVisitors} />
        </section>

        <section className="rounded-2xl border border-[#d5c7b5] bg-white/85 p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("topRatedTitle")}</h2>
            <button
              onClick={refreshStats}
              className="cursor-pointer text-xs uppercase tracking-[0.3em] text-[#b13b2a]"
            >
              {t("refreshStatsButton")}
            </button>
          </div>
          {stats.topRated.length === 0 ? (
            <p className="mt-4 text-sm text-[#7a5b45]">{t("topRatedEmpty")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.topRated.map((entry) => (
                <li
                  key={entry.title}
                  className="flex items-center justify-between rounded-xl bg-[#f8f1e7] px-4 py-3 text-sm"
                >
                  <span className="font-semibold">{entry.title}</span>
                  <span className="text-[#b13b2a]">
                    {t("topRatedScore", {
                      average: entry.average.toFixed(2),
                      count: entry.count,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#d5c7b5] bg-white/90 p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t("manageTitle")}</h2>
              <p className="text-sm text-[#7a5b45]">{t("manageSubtitle")}</p>
            </div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
              <button
                onClick={refreshGames}
                className="cursor-pointer text-[#5a3b26]"
              >
                {t("reload")}
              </button>
              <button
                onClick={() => {
                  setEditingRow(null);
                  setForm(emptyForm);
                }}
                className="cursor-pointer text-[#b13b2a]"
              >
                {t("addNew")}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#4b2f1e]">
              {t("searchLabel")}
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
              />
            </label>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="pb-2 text-xs uppercase tracking-[0.3em] text-[#b13b2a]"
              >
                {t("clear")}
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredGames.length === 0 ? (
                <p className="text-sm text-[#7a5b45]">
                  {games.length === 0 ? t("emptyList") : t("noMatch")}
                </p>
              ) : null}
              {filteredGames.map((game) => (
                <article
                  key={game.rowNumber}
                  className="rounded-xl border border-[#e7d6c5] bg-[#fdf9f4] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">{game.title}</h3>
                    <div className="flex gap-2 text-xs uppercase tracking-[0.3em]">
                      <button
                        type="button"
                        onClick={() => openPreview(game)}
                        className="cursor-pointer text-[#5a3b26]"
                        aria-label={t("preview.buttonAria", {
                          title: game.title,
                        })}
                      >
                        👁
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(game)}
                        className="text-[#1d5c41] cursor-pointer"
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(game.rowNumber)}
                        className="cursor-pointer text-[#b13b2a]"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-[#5a3b26]">
                    {game.description}
                  </p>
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-[#b13b2a] hover:underline"
                  >
                    {game.url}
                  </a>
                  <p className="mt-2 text-[10px] uppercase text-[#bda488]">
                    {t("sheetRow", { row: game.rowNumber })}
                  </p>
                </article>
              ))}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b13b2a]">
                {editingRow
                  ? t("formEditing", { row: editingRow })
                  : t("formAddHeading")}
              </h3>
              <label className="text-xs font-semibold uppercase text-[#4b2f1e]">
                {t("formTitle")}
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
                  required
                />
              </label>
              <label className="text-xs font-semibold uppercase text-[#4b2f1e]">
                {t("formUrl")}
                <input
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, url: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
                  required
                />
              </label>
              <label className="text-xs font-semibold uppercase text-[#4b2f1e]">
                {t("formDescription")}
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-[#1d5c41]">{message}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 cursor-pointer rounded-full bg-[#b13b2a] px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#8c2d1f] disabled:opacity-60"
                >
                  {pending
                    ? t("formSaving")
                    : editingRow
                      ? t("formSubmitUpdate")
                      : t("formSubmitAdd")}
                </button>
                {editingRow && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRow(null);
                      setForm(emptyForm);
                    }}
                    className="cursor-pointer rounded-full border border-[#b13b2a] px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#b13b2a]"
                  >
                    {t("formCancel")}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
      {previewTarget && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={closePreview}
          />
          <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e7d6c5] px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
                  {t("preview.title")}
                </p>
                <h2 className="text-2xl font-semibold">
                  {previewTarget.title}
                </h2>
                <p className="text-sm text-[#7a5b45]">
                  {previewTarget.description || t("preview.noDescription")}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="rounded-full border border-[#b13b2a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#b13b2a]"
              >
                {t("preview.close")}
              </button>
            </div>

            <div className="px-6 py-4">
              {previewData.loading ? (
                <p className="text-sm text-[#7a5b45]">{t("preview.loading")}</p>
              ) : previewData.error ? (
                <p className="text-sm text-red-600">{previewData.error}</p>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoTile
                      label={t("preview.average")}
                      value={
                        previewData.stats?.average !== null &&
                        previewData.stats?.average !== undefined
                          ? `${previewData.stats.average.toFixed(2)}`
                          : "—"
                      }
                    />
                    <InfoTile
                      label={t("preview.total")}
                      value={previewData.stats?.count ?? 0}
                    />
                    <InfoTile
                      label={t("preview.removeFrameLabel")}
                      value={
                        <a
                          href={previewTarget.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#b13b2a] hover:underline"
                        >
                          {t("preview.removeFrameLink")}
                        </a>
                      }
                    />
                  </div>

                  <div className="mt-6 rounded-xl border border-[#e7d6c5] bg-[#fdf9f4] p-4 text-sm text-[#5a3b26]">
                    <p className="font-semibold uppercase tracking-[0.3em] text-[#7a5b45]">
                      {t("preview.embedTitle")}
                    </p>
                    <dl className="mt-3 space-y-2">
                      <InfoRow
                        term={t("preview.status")}
                        detail={
                          previewData.embed?.status ??
                          (previewData.embed?.ok
                            ? t("preview.statusOk")
                            : t("preview.statusUnknown"))
                        }
                      />
                      <InfoRow
                        term={t("preview.xFrame")}
                        detail={
                          previewData.embed?.xFrameOptions ?? t("preview.none")
                        }
                      />
                      <InfoRow
                        term={t("preview.csp")}
                        detail={
                          previewData.embed?.contentSecurityPolicy ??
                          t("preview.none")
                        }
                      />
                      {previewData.embed?.error && (
                        <InfoRow
                          term={t("preview.error")}
                          detail={
                            <span className="text-red-600">
                              {previewData.embed.error}
                            </span>
                          }
                        />
                      )}
                    </dl>
                  </div>

                  <div className="mt-6 h-[70vh] rounded-2xl border border-[#d5c7b5] bg-black/5">
                    <iframe
                      src={previewTarget.url}
                      title={`Preview of ${previewTarget.title}`}
                      className="h-full w-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-[#d5c7b5] bg-white/85 px-4 py-6 shadow">
      <p className="text-xs uppercase tracking-[0.35em] text-[#b13b2a]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="rounded-xl border border-[#e7d6c5] bg-[#fdf9f4] px-4 py-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b13b2a]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </article>
  );
}

function InfoRow({ term, detail }: { term: string; detail: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="w-40 text-xs uppercase tracking-[0.3em] text-[#7a5b45]">
        {term}
      </span>
      <span className="flex-1">{detail}</span>
    </div>
  );
}
