import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";

import appCss from "../styles.css?url";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/Layout/AppShell";
import { InstallPrompt } from "@/components/PWA/InstallPrompt";
import { AboutModal } from "@/components/Common/AboutModal";
import { useAppDispatch } from "@/store";
import { setBills } from "@/store/billSlice";
import { loadBills } from "@/services/drive.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },

      // Primary
      { title: "BillVault — Bill & Receipt Manager by Hari Krishna Anem" },
      { name: "description", content: "BillVault is a mobile-first PWA to capture, categorize and back up every bill and receipt directly to your Google Drive. Built by Hari Krishna Anem." },
      { name: "keywords", content: "bill manager, receipt storage, expense tracker, google drive, pwa, bills, receipts, Hari Krishna Anem" },
      { name: "author", content: "Hari Krishna Anem" },
      { name: "creator", content: "Hari Krishna Anem" },
      { name: "robots", content: "index, follow" },

      // PWA / browser chrome
      { name: "theme-color", content: "#4f46e5" },
      { name: "color-scheme", content: "light dark" },
      { name: "application-name", content: "BillVault" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "BillVault" },
      { name: "msapplication-TileColor", content: "#4f46e5" },
      { name: "msapplication-TileImage", content: "/icon-192.png" },
      { name: "format-detection", content: "telephone=no" },

      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BillVault" },
      { property: "og:title", content: "BillVault — Bill & Receipt Manager" },
      { property: "og:description", content: "Capture, categorize and back up every bill & receipt to Google Drive. A personal finance tool by Hari Krishna Anem." },
      { property: "og:image", content: "/icon-512.png" },
      { property: "og:image:width", content: "512" },
      { property: "og:image:height", content: "512" },
      { property: "og:image:alt", content: "BillVault app icon" },
      { property: "og:locale", content: "en_IN" },

      // Twitter / X card
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "BillVault — Bill & Receipt Manager" },
      { name: "twitter:description", content: "Capture, categorize and back up every bill & receipt to Google Drive." },
      { name: "twitter:image", content: "/icon-512.png" },
      { name: "twitter:creator", content: "@HariKrishna9885699666" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icon-192.png", sizes: "192x192" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <BillsLoader />
        <AppShell />
        <AboutModal />
        <Toaster richColors position="top-right" />
        <InstallPrompt />
      </StoreProvider>
    </QueryClientProvider>
  );
}

function BillsLoader() {
  const dispatch = useAppDispatch();
  const load = useServerFn(loadBills);

  useEffect(() => {
    load().then((bills) => dispatch(setBills(bills))).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
