import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, ScrollText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getLogs } from "../lib/api";
import { formatDate } from "../lib/utils";
import Layout from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";

const PAGE_SIZE = 15;

export default function Logs() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLogs({ page, limit: PAGE_SIZE });
      setRows(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Layout
      title="Login Logs"
      subtitle={`${total} authentication event${total === 1 ? "" : "s"} recorded`}
      actions={
        <Button variant="outline" size="sm" onClick={load} data-testid="refresh-logs-button">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      }
    >
      <div className="card-tech overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading logs" />
        ) : rows.length === 0 ? (
          <EmptyState icon={ScrollText} title="No login events" description="Authentication attempts will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="logs-table">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-5 py-3 label-tech font-bold">Result</th>
                  <th className="px-5 py-3 label-tech font-bold">User</th>
                  <th className="px-5 py-3 label-tech font-bold">Detail</th>
                  <th className="px-5 py-3 label-tech font-bold">Version</th>
                  <th className="px-5 py-3 label-tech font-bold">IP Address</th>
                  <th className="px-5 py-3 label-tech font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                    data-testid={`log-row-${l.id}`}
                  >
                    <td className="px-5 py-3">
                      {l.success ? (
                        <span className="inline-flex items-center gap-1.5 text-success">
                          <CheckCircle2 className="h-4 w-4" /> <span className="text-xs font-semibold">OK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-danger">
                          <XCircle className="h-4 w-4" /> <span className="text-xs font-semibold">FAIL</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-foreground">{l.username || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-muted-foreground">{l.failure_reason || "—"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="neutral">{l.version || "—"}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip_address || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{formatDate(l.created_at)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">Page {page} of {pages} · {total} total</p>
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
    </Layout>
  );
}
