import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SaveTheDateCard, SAVE_THE_DATE_SHARE_TEXT } from "@/components/SaveTheDateCard";

function getShareUrl() {
  return typeof window !== "undefined" ? window.location.href : "https://lovelyne.netlify.app";
}

function getWhatsAppMessage() {
  return `${SAVE_THE_DATE_SHARE_TEXT}\n\n${getShareUrl()}`;
}

async function captureSaveTheDateImage(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#f6f0e4",
    cacheBust: true,
  });

  const response = await fetch(dataUrl);
  return response.blob();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export default function SaveTheDateShare() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function showStatus(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 3500);
  }

  async function getImageBlob() {
    if (!cardRef.current) throw new Error("Save the date card is not ready");
    return captureSaveTheDateImage(cardRef.current);
  }

  async function handleSaveImage() {
    try {
      setBusy(true);
      const blob = await getImageBlob();
      downloadBlob(blob, "emmanuel-lovelyne-save-the-date.png");
      showStatus("Save the date image saved to your device");
    } catch {
      showStatus("We could not save the image just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function handleWhatsAppLink() {
    openWhatsApp(getWhatsAppMessage());
  }

  async function handleWhatsAppWithImage() {
    try {
      setBusy(true);
      const blob = await getImageBlob();
      const file = new File([blob], "emmanuel-lovelyne-save-the-date.png", { type: "image/png" });
      const message = getWhatsAppMessage();

      if (navigator.share && navigator.canShare?.({ files: [file], text: message, url: getShareUrl() })) {
        await navigator.share({
          title: "Emmanuel & Lovelyne · Save the Date",
          text: message,
          url: getShareUrl(),
          files: [file],
        });
        return;
      }

      downloadBlob(blob, "emmanuel-lovelyne-save-the-date.png");
      openWhatsApp(message);
      showStatus("Image saved. WhatsApp opened. Attach the image from your gallery.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showStatus("We could not prepare the share just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(getWhatsAppMessage());
      showStatus("Message and link copied");
    } catch {
      showStatus("Copy did not go through. Try the WhatsApp button instead.");
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-sans text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">
        Save the date
      </p>
      <h2 className="mt-4 font-script text-5xl text-primary sm:text-6xl">Share the celebration</h2>
      <p className="mt-6 max-w-xl font-display text-lg leading-relaxed text-muted-foreground sm:text-xl">
        Know someone who should be there? Send them the save the date card with the invitation link.
      </p>

      <div ref={cardRef} className="mt-10 w-full max-w-[300px]">
        <SaveTheDateCard className="aspect-[3/4] w-full shadow-[var(--shadow-elegant)]" />
      </div>

      <div className="mt-10 flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={handleWhatsAppWithImage}
          className="min-h-[48px] rounded-sm bg-[#25D366] px-4 py-3 font-sans text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[#1fb855] disabled:opacity-60"
        >
          Share on WhatsApp with image
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleWhatsAppLink}
          className="min-h-[48px] rounded-sm border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 font-sans text-xs uppercase tracking-[0.3em] text-[#128C7E] transition hover:bg-[#25D366]/15 disabled:opacity-60"
        >
          Share link on WhatsApp
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleSaveImage}
          className="min-h-[48px] rounded-sm border border-border bg-card px-4 py-3 font-sans text-xs uppercase tracking-[0.3em] text-primary transition hover:bg-accent/10 disabled:opacity-60"
        >
          Save the date image
        </button>
        <button
          type="button"
          onClick={handleCopyAll}
          className="min-h-[44px] px-4 py-2 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground transition hover:text-primary"
        >
          Copy message and link
        </button>
      </div>

      {status && (
        <p className="mt-6 max-w-sm font-sans text-sm text-muted-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
