import { forwardRef } from "react";

const VENUE_NAME = "VIU lounge";
const VENUE_CITY = "73614 Schorndorf";
const VENUE_COUNTRY = "Germany";

const paperTextureStyle = {
  backgroundImage: `
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.9), rgba(252, 250, 244, 0.95)),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='cardNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cardNoise)' opacity='0.025'/%3E%3C/svg%3E")
  `,
};

export const SAVE_THE_DATE_SHARE_TEXT =
  "Emmanuel & Lovelyne invite you to their Traditional Engagement Ceremony on 29 August 2026, 10 am to 4 pm at VIU lounge, Schorndorf, Germany.";

export const SaveTheDateCard = forwardRef<
  HTMLDivElement,
  { className?: string; compact?: boolean }
>(function SaveTheDateCard({ className = "", compact = false }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-sm border border-[oklch(0.85_0.022_70/0.5)] shadow-[0_15px_45px_oklch(0.35_0.05_50/0.12),inset_0_0_30px_oklch(0.72_0.06_65/0.05)] ${className}`}
      style={paperTextureStyle}
    >
      <div
        className={`flex h-full flex-col items-center justify-center text-center border-4 border-double border-accent/20 rounded-sm ${
          compact ? "m-1.5 p-3" : "m-2.5 p-6"
        }`}
      >
        <p
          className={`font-sans uppercase tracking-[0.55em] text-accent-foreground/80 mb-2 ${
            compact ? "text-[0.45rem]" : "text-[0.65rem]"
          }`}
        >
          Save The Date
        </p>
        <div className={`h-px bg-accent/20 my-2 ${compact ? "w-10" : "w-16"}`} />
        <p
          className={`font-sans uppercase tracking-[0.45em] text-muted-foreground/90 ${
            compact ? "text-[0.4rem]" : "text-[0.6rem]"
          }`}
        >
          Traditional Engagement Ceremony
        </p>
        <h2
          className={`font-script leading-tight text-primary ${
            compact ? "mt-2 text-xl" : "mt-5 text-4xl md:text-5xl"
          }`}
        >
          Emmanuel
        </h2>
        <p
          className={`font-display italic text-accent-foreground/60 ${
            compact ? "my-0.5 text-sm" : "my-1 text-lg"
          }`}
        >
          &amp;
        </p>
        <h2
          className={`font-script leading-tight text-primary ${
            compact ? "text-xl" : "text-4xl md:text-5xl"
          }`}
        >
          Lovelyne
        </h2>
        <div className={`h-px bg-accent/20 my-4 ${compact ? "w-10" : "w-16"}`} />
        <p
          className={`font-sans uppercase tracking-[0.35em] text-muted-foreground mb-1 ${
            compact ? "text-[0.4rem]" : "text-[0.65rem]"
          }`}
        >
          August 29, 2026
        </p>
        <p
          className={`font-sans uppercase tracking-[0.25em] text-muted-foreground/80 mb-1 ${
            compact ? "text-[0.35rem]" : "text-[0.55rem]"
          }`}
        >
          10 am - 4 pm
        </p>
        <p
          className={`font-sans uppercase tracking-[0.25em] text-muted-foreground/80 ${
            compact ? "text-[0.35rem]" : "text-[0.55rem]"
          }`}
        >
          {VENUE_NAME}, {VENUE_CITY}, {VENUE_COUNTRY}
        </p>
      </div>
    </div>
  );
});
