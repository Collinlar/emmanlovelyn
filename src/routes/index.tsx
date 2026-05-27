import { createFileRoute } from "@tanstack/react-router";
import Invitation from "@/components/Invitation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emmanuel & Lovelyne · 29 August 2026" },
      { name: "description", content: "You're invited to the wedding of Emmanuel & Lovelyne on 29 August 2026 in Schorndorf, Germany." },
      { property: "og:title", content: "Emmanuel & Lovelyne · Wedding Invitation" },
      { property: "og:description", content: "29 August 2026 · Karlsplatz 1, Schorndorf, Germany" },
    ],
  }),
  component: Invitation,
});
