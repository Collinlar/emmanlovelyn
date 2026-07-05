import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";

function setMetaContent(
  selector: string,
  content: string,
  createAttrs: Record<string, string>,
) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    for (const [key, value] of Object.entries(createAttrs)) {
      el.setAttribute(key, value);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function DocumentMeta() {
  const { locale, t } = useTranslation();

  useEffect(() => {
    document.title = t("meta.title");
    document.documentElement.lang = locale;

    setMetaContent('meta[name="description"]', t("meta.description"), {
      name: "description",
    });
    setMetaContent('meta[property="og:title"]', t("meta.ogTitle"), {
      property: "og:title",
    });
    setMetaContent('meta[property="og:description"]', t("meta.ogDescription"), {
      property: "og:description",
    });
  }, [locale, t]);

  return null;
}
