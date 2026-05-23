import { createFileRoute } from "@tanstack/react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleTheme } from "@/store/uiSlice";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FaGoogleDrive, FaDownload, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { persistor } from "@/store";
import { getDriveStatus } from "@/services/drive.functions";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BillVault" },
      { name: "description", content: "Manage Google Drive backup, theme and data export." },
    ],
  }),
  loader: async () => {
    const status = await getDriveStatus();
    return { driveConfigured: status.configured };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const bills = useAppSelector((s) => s.bills.items);
  const { driveConfigured } = Route.useLoaderData();

  function exportJson() {
    const blob = new Blob([JSON.stringify(bills, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billvault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported bills as JSON");
  }

  async function clearAll() {
    if (!confirm("Clear all locally stored bills? Files on Drive are not removed.")) return;
    await persistor.purge();
    location.reload();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your vault and preferences.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FaGoogleDrive />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">Google Drive backup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Attachments upload to a <code>BillVault/</code> folder in the connected Google Drive,
              with one subfolder per category.
            </p>
            {driveConfigured ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                Connected
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                  Not configured — attachments saved locally only
                </p>
                <p className="text-xs text-muted-foreground">
                  Set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, and{" "}
                  <code>GOOGLE_REFRESH_TOKEN</code> in your <code>.env</code> file to enable Drive
                  backups.{" "}
                  <a
                    href="https://developers.google.com/oauthplayground"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
                  >
                    Get a refresh token <FaExternalLinkAlt className="text-[10px]" />
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Dark mode</Label>
            <p className="text-sm text-muted-foreground">Switch between light and dark theme.</p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={() => dispatch(toggleTheme())}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Export your bill metadata or wipe local data.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            <FaDownload /> Export JSON
          </Button>
          <Button variant="destructive" onClick={clearAll}>
            <FaTrash /> Clear local data
          </Button>
        </div>
      </section>
    </div>
  );
}
