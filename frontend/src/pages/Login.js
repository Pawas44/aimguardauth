import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { verifyPassword, setToken } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const submit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    try {
      await verifyPassword(password.trim());
      setToken(password.trim());
      toast.success("Access granted");
      navigate("/");
    } catch (err) {
      toast.error("Invalid admin password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary)/0.12), transparent), radial-gradient(ellipse 60% 50% at 90% 100%, hsl(var(--primary)/0.06), transparent)",
        }}
      />

      <button
        onClick={toggle}
        className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        data-testid="theme-toggle-button"
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-border ring-offset-2 ring-offset-background dark:ring-0 dark:glow-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">FINDEXAUTH</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Auth Control Panel
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/80 p-8 backdrop-blur-xl dark:shadow-[0_0_0_1px_hsl(var(--border)),0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label className="label-tech block">Admin Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  autoFocus
                  data-testid="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? "Authenticating..." : "Enter Dashboard"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground/60">
            Secured endpoint · Bearer token authentication
          </p>
        </div>
      </motion.div>
    </div>
  );
}
