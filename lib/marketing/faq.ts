export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

export const FAQ_ITEMS = [
  {
    question: "SOZONEXT Review とは何ですか？",
    answer:
      "SOZONEXT Review は、SOZONEXT が提供する Airbnb 物件の健康診断ツールです。公開されている Airbnb 物件 URL をもとに、リスティングの状態を確認し、改善レポートを日本語で提示します。",
  },
  {
    question: "どのような項目を診断しますか？",
    answer:
      "写真、タイトル、紹介文、設備、レビューの 5 維度を診断します。結果は総合スコア、各項目の評価、AI 改善レポート、PDF レポートとして確認できます。",
  },
  {
    question: "Airbnb の公式評価と同じですか？",
    answer:
      "いいえ。SOZONEXT Review の Quality Status やスコアは、Airbnb の内部判定や公式評価ではありません。公開情報をもとにした、運営改善のための参考値です。",
  },
  {
    question: "Airbnb アカウントへのログインは必要ですか？",
    answer:
      "ログインは不要です。デモでは公開されている Airbnb 物件 URL を入力するだけで診断できます。ホストアカウントの権限やパスワードは必要ありません。",
  },
  {
    question: "検索順位やスーパーホスト維持に役立ちますか？",
    answer:
      "写真、タイトル、紹介文、設備、レビュー品質の改善ポイントを見つけることで、Airbnb 検索順位の改善やスーパーホスト維持に向けた運営改善の参考になります。ただし、検索順位やバッジ獲得を保証するものではありません。",
  },
  {
    question: "料金はかかりますか？",
    answer:
      "現在のデモは無料で利用できます。SOZONEXT Review は、Vercel、Neon、Resend などの無料枠を活用し、月額コスト 0 円の構成を前提にしています。",
  },
] as const satisfies readonly FaqItem[];
