import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users as UsersIcon,
  UserCheck,
  Ban,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getStats } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { timeAgo } from "../lib/utils";
import Layout from "../components/Layout";
import { LoadingBlock } from "../components/ui/Feedback";
import { Badge } from "../components/ui/Badge";

const PKG_COLORS = { Premium: "#00F0FF", Basic: "#00E676", Free: "#EAB308", Unknown: "#FF2A55" };

function StatCard({ label, value, icon: Icon, accent, sub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="card-tech group p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="flex items-start justify-between">
        <span className="label-tech">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-4 font-mono text-4xl font-bold tracking-tighter text-foreground">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </motion.div>
  );
}

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    getStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const axisColor = theme === "dark" ? "#A0A0B0" : "#64748B";
  const gridColor = theme === "dark" ? "#1F1F2E" : "#E2E8F0";

  const tooltipStyle = {
    background: theme === "dark" ? "#0F0F16" : "#FFFFFF",
    border: `1px solid ${gridColor}`,
    borderRadius: 8,
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 12,
    color: theme === "dark" ? "#FFF" : "#0A0A0A",
  };

  return (
    <Layout title="Overview" subtitle="Real-time authentication & subscription metrics">
      {loading || !stats ? (
        <LoadingBlock label="Fetching metrics" />
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard index={0} label="Total Users" value={stats.users.total} icon={UsersIcon} accent="text-primary" sub={`${stats.users.active} active accounts`} />
            <StatCard index={1} label="Active" value={stats.users.active} icon={UserCheck} accent="text-success" sub={`${stats.users.disabled} disabled`} />
            <StatCard index={2} label="Banned" value={stats.users.banned} icon={Ban} accent="text-danger" sub="Access revoked" />
            <StatCard index={3} label="Expired Subs" value={stats.users.expired} icon={Clock} accent="text-warning" sub="Needs renewal" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="card-tech p-6 lg:col-span-2"
              data-testid="login-trend-chart"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Login Activity</h3>
                  <p className="text-sm text-muted-foreground">Last 7 days · success vs failed</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">{stats.logins.today} today</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.loginTrend} margin={{ left: -20, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E676" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF2A55" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#FF2A55" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: gridColor }} />
                  <Area type="monotone" dataKey="success" stroke="#00E676" strokeWidth={2} fill="url(#gSuccess)" name="Success" />
                  <Area type="monotone" dataKey="failed" stroke="#FF2A55" strokeWidth={2} fill="url(#gFail)" name="Failed" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="card-tech p-6"
              data-testid="package-distribution-chart"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground">Package Split</h3>
              <p className="mb-2 text-sm text-muted-foreground">Subscription tiers</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={stats.packageDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {stats.packageDistribution.map((entry) => (
                      <Cell key={entry.name} fill={PKG_COLORS[entry.name] || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    formatter={(v) => <span style={{ color: axisColor, fontSize: 12 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Login health + recent activity */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-5">
              <div className="card-tech p-6" data-testid="stat-success-logins">
                <div className="flex items-center justify-between">
                  <span className="label-tech">Successful Logins</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="mt-3 font-mono text-3xl font-bold text-foreground">{stats.logins.success}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${stats.logins.total ? (stats.logins.success / stats.logins.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="card-tech p-6" data-testid="stat-failed-logins">
                <div className="flex items-center justify-between">
                  <span className="label-tech">Failed Attempts</span>
                  <XCircle className="h-4 w-4 text-danger" />
                </div>
                <div className="mt-3 font-mono text-3xl font-bold text-foreground">{stats.logins.failed}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${stats.logins.total ? (stats.logins.failed / stats.logins.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="card-tech p-6 lg:col-span-2"
              data-testid="recent-activity-feed"
            >
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="space-y-1">
                {stats.recentActivity.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No recent activity</p>
                )}
                {stats.recentActivity.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        a.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}
                    >
                      {a.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{a.username || "unknown"}</span>
                        <Badge variant={a.success ? "active" : "banned"}>{a.success ? "success" : "failed"}</Badge>
                      </div>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {a.failure_reason} · {a.ip_address}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground/70">{timeAgo(a.created_at)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </Layout>
  );
}
