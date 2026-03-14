import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Box, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const loginMutation = useMutation({
    mutationFn: async () => {
      // NOTE: We pass username instead of email because Django expects 'username' by default.
      // Since our RegisterSerializer takes a username, we will use the email as the username for simplicity in login here
      const response = await api.post('/auth/login/', { username: email, password });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user);
      toast.success(data.message || "Logged in successfully!");
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to log in. Check your credentials.");
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary/5 relative overflow-hidden">
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Box className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory Integrity, Synchronized.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Manage stock, transfers, and deliveries across all your warehouses with real-time precision.
          </p>
        </div>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(239 84% 59%) 1px, transparent 1px), linear-gradient(90deg, hsl(239 84% 59%) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      {/* Right - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">CoreInventory</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 pr-10 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-border" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
