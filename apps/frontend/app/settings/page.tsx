"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "../../lib/api";
import { Button } from "../../components/Ui/Button";
import { Card } from "../../components/Ui/Card";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { AlertTriangle } from "lucide-react";
import { useLiveStore } from "../../store/liveStore";
import { useUserStore } from "../../store/userStore";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const resetLive = useLiveStore((s) => s.reset);
  const logout = useUserStore((s) => s.logout);

  const handleDelete = async () => {
    if (loading) return;
    
    // Final confirmation
    if (confirmText.toLowerCase() !== "delete") {
      return;
    }

    const finalConfirm = window.confirm(
      "Are you absolutely sure? This will permanently delete your account and ALL associated data. This action cannot be undone."
    );

    if (!finalConfirm) {
      return;
    }

    setLoading(true);
    try {
      const ok = await deleteAccount();
      if (ok) {
        // Clear all local state
        try {
          resetLive?.();
          await logout();
        } catch (err) {
          console.error("Error clearing local state:", err);
        }

        // Clear all storage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (err) {
          console.error("Error clearing storage:", err);
        }

        // Redirect to home
        router.replace("/");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("An error occurred while deleting your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || confirmText.toLowerCase() !== "delete";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Manage your account settings and preferences
          </p>
        </header>

        <Card className="rounded-2xl border-2 border-rose-200 bg-white p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Danger Zone</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Deleting your account will permanently remove all your data from TeamPulse. This includes:
                </p>
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-slate-600">
                  <li>All organizations you created or belong to</li>
                  <li>All repositories and their connections</li>
                  <li>All commits, pull requests, and metrics</li>
                  <li>All alerts and notifications</li>
                  <li>All team memberships</li>
                </ul>
                <p className="mt-3 text-sm font-medium text-rose-700">
                  This action cannot be undone. Please be certain before proceeding.
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <label htmlFor="confirm-delete" className="block text-sm font-medium text-slate-700">
                  Type <span className="font-mono font-semibold text-rose-700">delete</span> to confirm:
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !disabled) {
                      handleDelete();
                    }
                  }}
                />
                <Button
                  disabled={disabled}
                  onClick={handleDelete}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? "Deleting Account..." : "Delete My Account"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
