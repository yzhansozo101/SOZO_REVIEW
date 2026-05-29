"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ja } from "@/lib/i18n/ja";
import { ProgressView } from "./ProgressView";

type ErrorKey = keyof typeof ja.form.errors;

const SAMPLE_URL = "https://www.airbnb.jp/rooms/1236886450867131927";

const fieldBase = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: "var(--s-3)",
  padding: "18px 20px",
  background: "var(--card)",
  borderRadius: "var(--r-md)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--t-sm)",
  color: "var(--ink-900)",
  transition:
    "border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out)",
} as const;

export function DiagnosticForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    let shouldResetSubmitting = true;

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const key: ErrorKey =
          typeof body.error === "string" && body.error in ja.form.errors ? body.error : "scrape_failed";
        setError(key);
        return;
      }

      const body = (await res.json()) as { redirect: string };
      shouldResetSubmitting = false;
      router.push(body.redirect as never);
    } catch {
      setError("scrape_failed");
    } finally {
      if (shouldResetSubmitting) setSubmitting(false);
    }
  }

  if (submitting) return <ProgressView />;

  return (
    <section
      style={{
        width: "min(880px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-3) 0 var(--s-7)",
      }}
    >
      <form onSubmit={onSubmit} className="hero-card diagnostic-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--s-3)",
            gap: "var(--s-3)",
          }}
        >
          <label
            htmlFor="airbnb-url"
            className="t-small"
            style={{
              margin: 0,
              color: "var(--ink-700)",
              fontWeight: "var(--w-semibold)",
              fontSize: 14,
              letterSpacing: 0.1,
            }}
          >
            Airbnb 物件 URL
          </label>
          <span
            className="t-caption"
            style={{ color: "var(--ink-400)", letterSpacing: 0.4 }}
          >
            無料 · ログイン不要
          </span>
        </div>

        <div className="diagnostic-row">
          <label
            style={{
              ...fieldBase,
              border: `1px solid ${error ? "var(--grade-d)" : "var(--ink-200)"}`,
              boxShadow: error ? "var(--shadow-focus-error)" : undefined,
            }}
          >
            <span aria-hidden="true" style={{ color: "var(--ink-400)", display: "inline-flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" focusable="false">
                <path
                  d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.22 1.22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07l1.22-1.22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              id="airbnb-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder={ja.form.placeholder}
              required
              aria-invalid={!!error}
              aria-describedby={error ? "diagnostic-form-error" : undefined}
              style={{
                flex: 1,
                minWidth: 0,
                border: 0,
                outline: 0,
                background: "transparent",
                color: "inherit",
                font: "inherit",
              }}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !url}
            className="btn-primary"
          >
            {submitting ? ja.form.submitting : ja.form.submit}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ marginLeft: 2 }}
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {error && (
          <p
            id="diagnostic-form-error"
            className="t-small"
            style={{
              color: "var(--grade-d-ink)",
              margin: "var(--s-3) 0 0",
              paddingLeft: "var(--s-1)",
            }}
          >
            {ja.form.errors[error]}
          </p>
        )}

        <div style={{ marginTop: "var(--s-3)" }}>
          <button
            type="button"
            onClick={() => {
              setUrl(SAMPLE_URL);
              if (error) setError(null);
            }}
            style={{
              color: "var(--sozonext-navy)",
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            サンプル URL で試す →
          </button>
        </div>
      </form>

      <div className="trust-strip" aria-hidden="false">
        <span>25 秒で結果</span>
        <span>5 維度評価</span>
        <span>AI 改善レポート</span>
        <span>PDF ダウンロード</span>
      </div>

      <style jsx>{`
        .diagnostic-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--s-3);
          align-items: stretch;
        }
        @media (min-width: 640px) {
          .diagnostic-row {
            grid-template-columns: 1fr auto;
          }
        }
      `}</style>
    </section>
  );
}
