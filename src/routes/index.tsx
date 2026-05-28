import { createFileRoute } from "@tanstack/react-router";
import Invitation from "@/components/Invitation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emmanuel & Lovelyne · Traditional Engagement · 29 August 2026" },
      {
        name: "description",
        content:
          "You're invited to the traditional engagement ceremony of Emmanuel & Lovelyne on 29 August 2026, 10 am to 4 pm, at VIU lounge, Schorndorf, Germany.",
      },
      { property: "og:title", content: "Emmanuel & Lovelyne · Traditional Engagement Ceremony" },
      {
        property: "og:description",
        content: "29 August 2026 · 10 am - 4 pm · VIU lounge, Karlsplatz 1, Schorndorf, Germany",
      },
    ],
  }),
  component: Invitation,
});
