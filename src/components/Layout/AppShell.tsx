import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  FaHome,
  FaList,
  FaPlus,
  FaCog,
  FaMoon,
  FaSun,
  FaReceipt,
  FaInfoCircle,
  FaFileMedical,
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleTheme } from "@/store/uiSlice";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AboutModal } from "@/components/Common/AboutModal";

interface NavItem {
  to: string;
  label: string;
  icon: typeof FaHome;
}

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/bills", label: "Bills", icon: FaList },
  { to: "/reports", label: "Reports", icon: FaFileMedical },
  { to: "/bills/add", label: "Add", icon: FaPlus },
  { to: "/settings", label: "Settings", icon: FaCog },
];

export function AppShell() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const router = useRouterState();
  const pathname = router.location.pathname;
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FaReceipt />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">BillVault</p>
            <p className="text-xs text-muted-foreground">Receipts &amp; bills</p>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon /> {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FaInfoCircle /> About
          </button>
        </nav>
        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </aside>

      {/* Top bar (mobile only) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FaReceipt size={14} />
          </div>
          <span className="text-base font-semibold text-foreground">BillVault</span>
        </Link>
        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      {/* Bottom nav (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <ul className="flex items-center justify-around px-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-primary/15 text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon size={17} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          {/* About button — after Settings */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="flex w-full flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground">
                <FaInfoCircle size={17} />
              </span>
              <span>About</span>
            </button>
          </li>
        </ul>
      </nav>

      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
