import { FAQ_ITEMS } from "@/lib/marketing/faq";

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      style={{
        width: "min(880px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-6) 0 var(--s-6)",
      }}
    >
      <header
        style={{
          textAlign: "center",
          marginBottom: "var(--s-5)",
          display: "grid",
          justifyItems: "center",
          gap: "var(--s-3)",
        }}
      >
        <span className="eyebrow-chip">FAQ</span>
        <h2
          id="faq-heading"
          className="t-h2"
          style={{
            margin: 0,
            fontSize: "clamp(28px, 3.2vw, 38px)",
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
          }}
        >
          よくある質問
        </h2>
      </header>
      <dl
        style={{
          display: "grid",
          gap: "var(--s-3)",
          margin: 0,
        }}
      >
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.question}
            style={{
              padding: "var(--s-4) var(--s-5)",
              background: "var(--card)",
              border: "1px solid var(--ink-100)",
              borderRadius: "var(--r-lg)",
              boxShadow: "0 1px 0 rgba(14, 17, 22, 0.02)",
            }}
          >
            <dt
              style={{
                marginBottom: "var(--s-2)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--ink-900)",
                lineHeight: 1.45,
              }}
            >
              {item.question}
            </dt>
            <dd
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--ink-700)",
              }}
            >
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
