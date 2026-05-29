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
          gap: 8,
          padding: "10px 16px",
          background: "var(--sozonext-navy)",
          border: "1px solid var(--sozonext-navy)",
          borderRadius: "var(--r-md)",
          color: "var(--text-on-navy)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: "var(--w-semibold)",
          letterSpacing: 0.1,
          boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px rgba(2, 66, 128, 0.5)",
          transition:
            "background var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out)",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
          background: var(--sozonext-navy-700) !important;
          transform: translateY(-1px);
        }

        .pdf-download-btn:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
      `}</style>
    </>
  );
}
