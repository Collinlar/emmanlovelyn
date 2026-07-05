import { createFileRoute } from "@tanstack/react-router";
import Invitation from "@/components/Invitation";
import en from "@/i18n/locales/en.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: en.meta.title },
      { name: "description", content: en.meta.description },
      { property: "og:title", content: en.meta.ogTitle },
      { property: "og:description", content: en.meta.ogDescription },
    ],
  }),
  component: Invitation,
});
