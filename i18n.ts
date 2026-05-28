import { getRequestConfig } from "next-intl/server";
import { ja } from "@/lib/i18n/ja";

export default getRequestConfig(async () => ({
  locale: "ja",
  messages: ja,
}));
