"use client";

import { useEffect, useState } from "react";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { useAuthStore } from "@/store/useAuthStore";
import {
  settingsApi,
  type GlobalSettings,
  type UserSettings,
} from "@/lib/api/settingsApi";
import { Save, Settings2 } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: "light",
    language: "en",
    notifications: true,
    dashboard_auto_refresh: true,
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    confidence_threshold: 0.7,
    realtime_poll_ms: 5000,
    allow_feedback: true,
    maintenance_mode: false,
  });

  useEffect(() => {
    settingsApi.getMySettings().then(setUserSettings).catch(() => {});
    if (isAdmin) {
      settingsApi.getGlobalSettings().then(setGlobalSettings).catch(() => {});
    }
  }, [isAdmin]);

  const saveUser = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const next = await settingsApi.updateMySettings(userSettings);
      setUserSettings(next);
      setMessage("Your settings were saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveGlobal = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setMessage(null);
    try {
      const next = await settingsApi.updateGlobalSettings(globalSettings);
      setGlobalSettings(next);
      setMessage("Global settings were saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EEF3FC] rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-[#3B6FD4]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A2744]">Settings</h1>
            <p className="text-[#64748B] text-sm mt-0.5">
              User preferences and system configuration
            </p>
          </div>
        </div>

        {message && (
          <div className="bg-[#E8F9EE] border border-[#2DC653]/30 text-[#2B6E3F] rounded-xl px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-[#1A2744]">My Settings</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm text-[#475569]">
              Theme
              <select
                className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2"
                value={userSettings.theme}
                onChange={(e) =>
                  setUserSettings((s) => ({ ...s, theme: e.target.value as "light" | "dark" }))
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="text-sm text-[#475569]">
              Language
              <select
                className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2"
                value={userSettings.language}
                onChange={(e) =>
                  setUserSettings((s) => ({ ...s, language: e.target.value as "en" | "hi" }))
                }
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#475569]">
              <input
                type="checkbox"
                checked={userSettings.notifications}
                onChange={(e) =>
                  setUserSettings((s) => ({ ...s, notifications: e.target.checked }))
                }
              />
              Notifications enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-[#475569]">
              <input
                type="checkbox"
                checked={userSettings.dashboard_auto_refresh}
                onChange={(e) =>
                  setUserSettings((s) => ({ ...s, dashboard_auto_refresh: e.target.checked }))
                }
              />
              Auto-refresh dashboard
            </label>
          </div>

          <button
            type="button"
            onClick={saveUser}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#3B6FD4] text-white px-4 py-2.5 rounded-xl disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Save My Settings
          </button>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-semibold text-[#1A2744]">Global Settings (Admin)</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm text-[#475569]">
                Confidence Threshold
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={globalSettings.confidence_threshold}
                  onChange={(e) =>
                    setGlobalSettings((s) => ({
                      ...s,
                      confidence_threshold: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2"
                />
              </label>

              <label className="text-sm text-[#475569]">
                Realtime Poll Interval (ms)
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={globalSettings.realtime_poll_ms}
                  onChange={(e) =>
                    setGlobalSettings((s) => ({
                      ...s,
                      realtime_poll_ms: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-[#475569]">
                <input
                  type="checkbox"
                  checked={globalSettings.allow_feedback}
                  onChange={(e) =>
                    setGlobalSettings((s) => ({ ...s, allow_feedback: e.target.checked }))
                  }
                />
                Allow clinician feedback submission
              </label>
              <label className="flex items-center gap-2 text-sm text-[#475569]">
                <input
                  type="checkbox"
                  checked={globalSettings.maintenance_mode}
                  onChange={(e) =>
                    setGlobalSettings((s) => ({ ...s, maintenance_mode: e.target.checked }))
                  }
                />
                Maintenance mode
              </label>
            </div>

            <button
              type="button"
              onClick={saveGlobal}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#1A2744] text-white px-4 py-2.5 rounded-xl disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              Save Global Settings
            </button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}

