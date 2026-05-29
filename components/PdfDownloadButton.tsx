"use client";

type Props = { diagnosisId: string };

export function PdfDownloadButton({ diagnosisId }: Props) {
  return (
    <>
      <a
        className="pdf-download-btn"
        href={`/d/${diagnosisId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--s-2)",
          padding: "8px 14px",
          background: "var(--card)",
          border: "1px solid var(--ink-200)",
          borderRadius: "var(--r-md)",
          color: "var(--ink-800)",
          textDecoration: "none",
          fontSize: "var(--t-sm)",
          fontWeight: "var(--w-medium)",
          transition: "background var(--t-fast) var(--ease-out)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        PDF をダウンロード
      </a>
      <style jsx>{`
        .pdf-download-btn:hover {
          background: var(--ink-50) !important;
        }

        .pdf-download-btn:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
      `}</style>
    </>
  );
}
