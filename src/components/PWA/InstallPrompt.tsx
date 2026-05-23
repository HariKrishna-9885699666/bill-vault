/**
 * PWA "Add to Home Screen" install prompt.
 *
 * Listens for the browser's `beforeinstallprompt` event and surfaces a
 * dismissible banner so users can install BillVault as a standalone app.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaDownload, FaTimes } from "react-icons/fa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Install BillVault</p>
        <p className="text-xs text-muted-foreground">Add to your home screen for quick access.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={handleInstall}>
          <FaDownload /> Install
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
        >
          <FaTimes />
        </Button>
      </div>
    </div>
  );
}
