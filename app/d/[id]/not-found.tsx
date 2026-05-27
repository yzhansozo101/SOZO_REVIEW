export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--s-7) var(--s-5)" }}>
      <h1 className="t-h1">診断が見つかりません</h1>
      <p className="t-body">URL をご確認の上、最初からやり直してください。</p>
      <a href="/" className="t-small">トップに戻る</a>
    </main>
  );
}
