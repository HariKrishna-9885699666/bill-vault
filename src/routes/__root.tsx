import { QueryClient } from "@tanstack/react-query";
import {
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/Layout/AppShell";
import { InstallPrompt } from "@/components/PWA/InstallPrompt";
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

function RootComponent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unauthenticatedPath = routerState.location.pathname !== '/password';
    if (!isAuthenticated && unauthenticatedPath) {
      navigate({ to: '/password', replace: true });
    }
    if (isAuthenticated && !unauthenticatedPath) {
      navigate({ to: '/', replace: true });
    }
  }, [isAuthenticated, navigate, routerState.location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBills()
        .then((bills) => {
          dispatch(setBills(bills));
        })
        .catch((err) => {
          console.error("Failed to load bills:", err);
        });
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated && routerState.location.pathname !== '/password') {
    return null;
  }

  if (isAuthenticated && routerState.location.pathname === '/password') {
    return null;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <HeadContent />
      <StoreProvider>
        <RootComponent />
        <Toaster />
        <InstallPrompt />
      </StoreProvider>
    </>
  ),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
