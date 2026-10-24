import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
  resetDevice,
} from "../lib/api";
import { formatDate, daysUntil } from "../lib/utils";
import Layout from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Input, Select, Field } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";

const PAGE_SIZE = 10;
const PACKAGES = ["Free", "Basic", "Premium"];
const STATUSES = ["active", "banned", "disabled"];

const BOOL_FLAGS = [
  "AimbotExternal", "AimbotExternalCustom", "AimbotInternal", "AimbotBody",
  "SniperCrosshair", "SniperFastSwitch", "SniperScope", "SniperScopeCustom",
  "ScopeTracking", "ScopeTrackingCustom", "NoRecoil", "GlitchShot",
  "Chams", "Esp", "PcBypass", "CameraHack", "SniperDelayFix", "NoReload",
  "NetDelay", "SpeedHackExternal", "LandingHackExternal", "WallHackExternal",
];
const NUM_FLAGS = ["SniperScopeInterval", "readPointerX"];

function humanize(key) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function statusVariant(status, expiry) {
  if (status === "banned") return "banned";
  if (status === "disabled") return "disabled";
  if (expiry && daysUntil(expiry) < 0) return "expired";
  return "active";
}

function pkgVariant(pkg) {
  if (pkg === "Premium") return "primary";
  if (pkg === "Basic") return "active";
  return "neutral";
}

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', user }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: PAGE_SIZE, search });
      setRows(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleReset = async (username) => {
    try {
      await resetDevice(username);
      toast.success(`Device reset for ${username}`);
    } catch {
      toast.error("Failed to reset device");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.username}`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <Layout
      title="Users"
      subtitle={`${total} registered account${total === 1 ? "" : "s"}`}
      actions={
        <Button size="sm" onClick={() => setModal({ mode: "create" })} data-testid="create-user-button">
          <Plus className="h-4 w-4" /> New User
        </Button>
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search username..."
            data-testid="user-search-input"
            className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="card-tech overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading users" />
        ) : rows.length === 0 ? (
          <EmptyState icon={Cpu} title="No users found" description="Adjust your search or create a new account." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="users-table">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-5 py-3 label-tech font-bold">User</th>
                  <th className="px-5 py-3 label-tech font-bold">Status</th>
                  <th className="px-5 py-3 label-tech font-bold">Package</th>
                  <th className="px-5 py-3 label-tech font-bold">Expiry</th>
                  <th className="px-5 py-3 label-tech font-bold">Last Login</th>
                  <th className="px-5 py-3 label-tech font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u, i) => {
                  const days = daysUntil(u.expiry_date);
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                      data-testid={`user-row-${u.username}`}
                    >
                      <td className="px-5 py-3.5 font-mono font-medium text-foreground">{u.username}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant(u.status, u.expiry_date)} dot>
                          {statusVariant(u.status, u.expiry_date) === "expired" ? "expired" : u.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={pkgVariant(u.package)}>{u.package || "—"}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs text-foreground">{formatDate(u.expiry_date, false)}</div>
                        {days !== null && (
                          <div className={`text-xs ${days < 0 ? "text-danger" : days < 7 ? "text-warning" : "text-muted-foreground"}`}>
                            {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatDate(u.last_login_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleReset(u.username)}
                            title="Reset device (HWID)"
                            data-testid={`reset-device-${u.username}`}
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-warning/10 hover:text-warning"
                          >
                            <Smartphone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const full = await getUserDetails(u.id);
                              setModal({ mode: "edit", user: full.data });
                            }}
                            title="Edit"
                            data-testid={`edit-user-${u.username}`}
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="Delete"
                            data-testid={`delete-user-${u.username}`}
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && rows.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Page {page} of {pages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} data-testid="prev-page-button">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} data-testid="next-page-button">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        subtitle="This action is permanent and cannot be undone."
        size="sm"
        testId="delete-user-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} data-testid="confirm-delete-button">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-lg border border-danger/25 bg-danger/5 p-4">
          <ShieldOff className="h-5 w-5 text-danger" />
          <p className="text-sm text-foreground">
            Delete <span className="font-mono font-semibold">{deleteTarget?.username}</span> permanently?
          </p>
        </div>
      </Modal>
    </Layout>
  );
}

function UserFormModal({ mode, user, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("account");
  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
    packageType: user?.package || "Basic",
    expiryDays: 30,
    status: user?.status || "active",
  });
  const [flags, setFlags] = useState(() => {
    const f = {};
    const source = user?.flags || {};
    BOOL_FLAGS.forEach((k) => (f[k] = !!source[k]));
    NUM_FLAGS.forEach((k) => (f[k] = source[k] ?? 0));
    return f;
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setFlag = (k, v) => setFlags((p) => ({ ...p, [k]: v }));

  const applyPackageDefaults = (pkg) => {
    // reflect that changing package will reset features server-side on create
    set("packageType", pkg);
  };

  const save = async () => {
    if (!form.username.trim()) return toast.error("Username is required");
    if (!isEdit && !form.password.trim()) return toast.error("Password is required");
    setSaving(true);
    try {
      if (isEdit) {
        const body = {
          username: form.username,
          status: form.status,
          packageType: form.packageType,
          flags,
        };
        if (form.password.trim()) body.password = form.password;
        if (form.expiryDays !== "" && form.expiryDays !== null) body.expiryDays = Number(form.expiryDays);
        await updateUser(user.id, body);
        toast.success("User updated");
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          packageType: form.packageType,
          expiryDays: Number(form.expiryDays),
        });
        toast.success("User created");
      }
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = BOOL_FLAGS.filter((k) => flags[k]).length;

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit ${user.username}` : "Create User"}
      subtitle={isEdit ? "Update account, subscription & feature access" : "Provision a new licensed account"}
      size="xl"
      testId="user-form-modal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} data-testid="save-user-button">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <button
          onClick={() => setTab("account")}
          data-testid="tab-account"
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "account" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Account & Subscription
        </button>
        {isEdit && (
          <button
            onClick={() => setTab("flags")}
            data-testid="tab-flags"
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "flags" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Feature Flags · {enabledCount}/{BOOL_FLAGS.length}
          </button>
        )}
      </div>

      {tab === "account" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Username">
            <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. shadow_ops" testId="input-username" />
          </Field>
          <Field label={isEdit ? "New Password (optional)" : "Password"}>
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={isEdit ? "Leave blank to keep" : "Set a password"} testId="input-password" />
          </Field>
          <Field label="Package" hint={!isEdit ? "Feature flags are auto-assigned from the package." : "Changes the tier label."}>
            <Select value={form.packageType} onChange={(e) => applyPackageDefaults(e.target.value)} testId="select-package">
              {PACKAGES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label={isEdit ? "Renew for (days from now)" : "Expiry (days)"} hint={isEdit ? "Leave to keep current expiry." : undefined}>
            <Input type="number" value={form.expiryDays} onChange={(e) => set("expiryDays", e.target.value)} placeholder="30" testId="input-expiry" />
          </Field>
          {isEdit && (
            <Field label="Account Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} testId="select-status">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      )}

      {tab === "flags" && isEdit && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BOOL_FLAGS.map((k) => (
              <label
                key={k}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-muted/20 p-3 transition-colors hover:border-primary/50"
              >
                <span className="font-mono text-xs text-foreground">{humanize(k)}</span>
                <Switch checked={!!flags[k]} onCheckedChange={(v) => setFlag(k, v)} testId={`toggle-${k}`} />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
            {NUM_FLAGS.map((k) => (
              <Field key={k} label={humanize(k)}>
                <Input
                  type="number"
                  value={flags[k]}
                  onChange={(e) => setFlag(k, Number(e.target.value))}
                  className="font-mono"
                  testId={`num-${k}`}
                />
              </Field>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
