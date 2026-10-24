import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, SlidersHorizontal, Smartphone, FileCheck2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "../lib/api";
import Layout from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Input, Select, Field } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { LoadingBlock } from "../components/ui/Feedback";

const DEVICE_POLICIES = ["ONE_DEVICE", "UNLIMITED"];
const SIGNATURE_POLICIES = ["DISABLED", "REQUIRED"];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((r) =>
        setSettings({
          minimum_version: r.data.minimum_version || "",
          latest_version: r.data.latest_version || "",
          force_update: r.data.force_update === "true",
          device_policy: r.data.device_policy || "ONE_DEVICE",
          signature_policy: r.data.signature_policy || "DISABLED",
        })
      )
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setSettings((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        ...settings,
        force_update: settings.force_update ? "true" : "false",
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      title="Settings"
      subtitle="Global authentication & version enforcement policies"
      actions={
        <Button size="sm" onClick={save} disabled={saving || loading} data-testid="save-settings-button">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      }
    >
      {loading || !settings ? (
        <LoadingBlock label="Loading settings" />
      ) : (
        <div className="grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-tech p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Version Control</h3>
                <p className="text-xs text-muted-foreground">Client build enforcement</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Minimum Version">
                <Input className="font-mono" value={settings.minimum_version} onChange={(e) => set("minimum_version", e.target.value)} placeholder="2.0.0" testId="input-minimum-version" />
              </Field>
              <Field label="Latest Version">
                <Input className="font-mono" value={settings.latest_version} onChange={(e) => set("latest_version", e.target.value)} placeholder="2.0.0" testId="input-latest-version" />
              </Field>
              <label className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3.5">
                <div>
                  <div className="text-sm font-medium text-foreground">Force Update</div>
                  <div className="text-xs text-muted-foreground">Reject logins from outdated clients</div>
                </div>
                <Switch checked={settings.force_update} onCheckedChange={(v) => set("force_update", v)} testId="toggle-force-update" />
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card-tech p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Security Policies</h3>
                <p className="text-xs text-muted-foreground">Device & signature enforcement</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Device Policy" hint="ONE_DEVICE binds each account to a single HWID.">
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select className="pl-9" value={settings.device_policy} onChange={(e) => set("device_policy", e.target.value)} testId="select-device-policy">
                    {DEVICE_POLICIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </div>
              </Field>
              <Field label="Signature Policy" hint="REQUIRED validates the client executable hash on login.">
                <div className="relative">
                  <FileCheck2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select className="pl-9" value={settings.signature_policy} onChange={(e) => set("signature_policy", e.target.value)} testId="select-signature-policy">
                    {SIGNATURE_POLICIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </div>
              </Field>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
