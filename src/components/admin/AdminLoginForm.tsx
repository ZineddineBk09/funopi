"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const t = useTranslations("admin.login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? t("error"));
      }
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-[#d9c7b6] bg-white/90 p-8 shadow-xl">
      <h1 className="text-center text-2xl font-semibold text-[#2b1d11]">
        {t("title")}
      </h1>
      <p className="mt-2 text-center text-sm text-[#6f5240]">
        {t("subtitle")}
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#4b2f1e]">
          {t("username")}
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
            autoComplete="username"
            required
          />
        </label>
        <label className="text-sm font-semibold text-[#4b2f1e]">
          {t("password")}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#d9c7b6] bg-white px-3 py-2 text-[#2b1d11] focus:border-[#b13b2a] focus:outline-none"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#b13b2a] px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#8c2d1f] disabled:opacity-60"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}

