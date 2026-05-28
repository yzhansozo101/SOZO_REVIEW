"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ja } from "@/lib/i18n/ja";
import { ProgressView } from "./ProgressView";

type ErrorKey = keyof typeof ja.form.errors;

const fieldBase = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: "var(--s-3)",
  padding: "16px 18px",
  background: "var(--card)",
  borderRadius: "var(--r-md)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--t-sm)",
  color: "var(--ink-900)",
  transition: "border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out)",
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
    <form
      onSubmit={onSubmit}
      style={{
        width: "min(760px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-8) 0 var(--s-7)",
      }}
    >
      <p className="t-eyebrow" style={{ margin: "0 0 18px" }}>
        {ja.form.eyebrow}
      </p>
      <h1
        className="t-h1"
        style={{
          maxWidth: 680,
          margin: "0 0 var(--s-6)",
          fontSize: "clamp(32px, 6vw, 48px)",
          lineHeight: 1.1,
        }}
      >
        {ja.form.headline}
      </h1>

      <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "stretch" }}>
        <label
          style={{
            ...fieldBase,
            border: `1px solid ${error ? "var(--grade-d)" : "var(--ink-200)"}`,
            boxShadow: error ? "0 0 0 3px rgba(199, 56, 43, 0.14)" : undefined,
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
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={ja.form.placeholder}
            required
            aria-label={ja.form.headline}
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
          style={{
            padding: "14px 24px",
            background: submitting || !url ? "var(--ink-300)" : "var(--sozonext-navy)",
            color: "#fff",
            border: 0,
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: "var(--w-medium)",
            cursor: submitting ? "wait" : url ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
          }}
        >
          {submitting ? ja.form.submitting : ja.form.submit}
        </button>
      </div>

      {error && (
        <p
          id="diagnostic-form-error"
          className="t-small"
          style={{ color: "var(--grade-d-ink)", margin: "var(--s-2) 0 0", paddingLeft: "var(--s-1)" }}
        >
          {ja.form.errors[error]}
        </p>
      )}
    </form>
  );
}
