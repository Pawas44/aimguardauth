import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Package, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getVersions, addVersion, updateVersion, deleteVersion } from "../lib/api";
import { formatDate } from "../lib/utils";
import Layout from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Input, Field } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";

export default function Versions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode, version }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getVersions();
      setRows(res.data);
    } catch {
      toast.error("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (v) => {
    try {
      await updateVersion(v.id, { version: v.version, hash: v.hash, active: !v.active });
      toast.success(`${v.version} ${!v.active ? "activated" : "deactivated"}`);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVersion(deleteTarget.id);
      toast.success(`Removed ${deleteTarget.version}`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <Layout
      title="Client Versions"
      subtitle={`${rows.length} approved build${rows.length === 1 ? "" : "s"}`}
      actions={
        <Button size="sm" onClick={() => setModal({ mode: "create" })} data-testid="add-version-button">
          <Plus className="h-4 w-4" /> Add Version
        </Button>
      }
    >
      <div className="card-tech overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading versions" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No versions registered"
            description="Add an approved client build & its signature hash."
            action={
              <Button size="sm" className="mt-2" onClick={() => setModal({ mode: "create" })}>
                <Plus className="h-4 w-4" /> Add Version
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="versions-table">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-5 py-3 label-tech font-bold">Version</th>
                  <th className="px-5 py-3 label-tech font-bold">Signature Hash</th>
                  <th className="px-5 py-3 label-tech font-bold">Status</th>
                  <th className="px-5 py-3 label-tech font-bold">Added</th>
                  <th className="px-5 py-3 label-tech font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                    data-testid={`version-row-${v.version}`}
                  >
                    <td className="px-5 py-3.5">
                      <Badge variant="primary">{v.version}</Badge>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate font-mono text-xs text-muted-foreground">{v.hash || "—"}</td>
                    <td className="px-5 py-3.5">
                      {v.active ? (
                        <span className="inline-flex items-center gap-1.5 text-success"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-semibold">Active</span></span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><XCircle className="h-4 w-4" /><span className="text-xs font-semibold">Inactive</span></span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{formatDate(v.created_at, false)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <Switch checked={v.active} onCheckedChange={() => toggleActive(v)} testId={`toggle-version-${v.version}`} />
                        <button onClick={() => setModal({ mode: "edit", version: v })} data-testid={`edit-version-${v.version}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(v)} data-testid={`delete-version-${v.version}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <VersionModal
          mode={modal.mode}
          version={modal.version}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Version"
        size="sm"
        testId="delete-version-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} data-testid="confirm-delete-version-button">
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          Remove approved version <span className="font-mono font-semibold">{deleteTarget?.version}</span>?
        </p>
      </Modal>
    </Layout>
  );
}

function VersionModal({ mode, version, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    version: version?.version || "",
    hash: version?.hash || "",
    active: version?.active ?? true,
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.version.trim()) return toast.error("Version is required");
    setSaving(true);
    try {
      if (isEdit) {
        await updateVersion(version.id, form);
        toast.success("Version updated");
      } else {
        await addVersion(form);
        toast.success("Version added");
      }
      onSaved();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit ${version.version}` : "Add Client Version"}
      subtitle="Approved build & signature hash"
      size="md"
      testId="version-form-modal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} data-testid="save-version-button">
            {saving ? "Saving..." : isEdit ? "Save" : "Add"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Version">
          <Input className="font-mono" value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="2.0.1" testId="input-version" />
        </Field>
        <Field label="Signature Hash" hint="SHA hash of the approved client executable.">
          <Input className="font-mono" value={form.hash} onChange={(e) => set("hash", e.target.value)} placeholder="a3f1c8e9d4b2..." testId="input-hash" />
        </Field>
        <label className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3.5">
          <div>
            <div className="text-sm font-medium text-foreground">Active</div>
            <div className="text-xs text-muted-foreground">Allow this build to authenticate</div>
          </div>
          <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} testId="toggle-version-active" />
        </label>
      </div>
    </Modal>
  );
}
