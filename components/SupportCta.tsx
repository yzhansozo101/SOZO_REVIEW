/**
 * SupportCta — marketing card shown at the bottom of the result page.
 *
 * Replaces the prior "05 通知" (F1/F7 notification UI). Routes the user to
 * SOZONEXT's 民泊運営代行 service via email / phone / website.
 *
 * Pure server component. No props. Frozen copy.
 *
 * Design: docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md
 */

const EMAIL = "minpaku_info@sozonext.com";
const PHONE_DISPLAY = "03-3842-1552";
const PHONE_TEL = "tel:+81338421552";
const WEBSITE = "https://sozonext.com";
const WEBSITE_DISPLAY = "sozonext.com";

const MAILTO_SUBJECT = encodeURIComponent("リスティング改善のご相談");
const MAILTO_BODY = encodeURIComponent(
  "SOZONEXT Review で診断後、より良い結果のためご相談したく連絡いたしました。\n\n物件 URL:\n\nご質問・ご要望:\n",
);
const MAILTO_HREF = `mailto:${EMAIL}?subject=${MAILTO_SUBJECT}&body=${MAILTO_BODY}`;

const BULLETS: Array<{ title: string; caption: string }> = [
  {
    title: "リスティング最適化代行",
    caption: "写真・タイトル・紹介文を SOZONEXT が制作",
  },
  {
    title: "24h 運営代行",
    caption: "ゲスト対応・清掃・チェックイン代行",
  },
  {
    title: "収益改善コンサル",
    caption: "価格戦略・RevPAR 改善・複数物件運用",
  },
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SupportCta() {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-6)",
        boxShadow: "var(--shadow-card)",
        display: "grid",
        gap: "var(--s-4)",
      }}
    >
      <header style={{ display: "flex", alignItems: "flex-start", gap: "var(--s-3)" }}>
        <span
          aria-hidden="true"
          style={{
            flex: "0 0 28px",
            width: 28,
            height: 28,
            borderRadius: "var(--r-pill)",
            background: "var(--sozonext-navy)",
            color: "var(--card)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HomeIcon />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: "var(--ink-900)",
              letterSpacing: "-0.005em",
              lineHeight: 1.3,
            }}
          >
            もっと結果を出しませんか？
          </h3>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14.5,
              color: "var(--ink-600)",
              lineHeight: 1.6,
            }}
          >
            SOZONEXT は民泊運営代行の専門会社。リスティング改善から運営代行・収益コンサルまで一括サポートします。
          </p>
        </div>
      </header>

      <hr
        style={{
          margin: 0,
          border: 0,
          borderTop: "1px solid var(--ink-100)",
        }}
      />

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "var(--s-3)",
        }}
      >
        {BULLETS.map((b) => (
          <li
            key={b.title}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "start",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "var(--grade-a)",
                color: "var(--card)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <CheckIcon />
            </span>
            <div>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "var(--ink-800)",
                  lineHeight: 1.4,
                }}
              >
                {b.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-500)",
                  marginTop: 2,
                  lineHeight: 1.55,
                }}
              >
                {b.caption}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <hr
        style={{
          margin: 0,
          border: 0,
          borderTop: "1px solid var(--ink-100)",
        }}
      />

      <div
        className="support-cta-contact"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
        }}
      >
        <a
          href={MAILTO_HREF}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            background: "var(--sozonext-navy)",
            border: "1px solid var(--sozonext-navy)",
            borderRadius: "var(--r-md)",
            color: "var(--text-on-navy)",
            textDecoration: "none",
            fontSize: 14.5,
            fontWeight: "var(--w-semibold)",
            letterSpacing: 0.1,
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px rgba(2, 66, 128, 0.5)",
            transition:
              "background var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out)",
          }}
        >
          {EMAIL} にメール相談する
          <ArrowIcon />
        </a>

        <div
          style={{
            display: "grid",
            gap: 6,
            fontSize: 13.5,
            color: "var(--ink-700)",
          }}
        >
          <a
            href={PHONE_TEL}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-700)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--sozonext-navy)" }}>
              <PhoneIcon />
            </span>
            {PHONE_DISPLAY}
          </a>
          <a
            href={WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-700)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--sozonext-navy)" }}>
              <GlobeIcon />
            </span>
            {WEBSITE_DISPLAY}
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
