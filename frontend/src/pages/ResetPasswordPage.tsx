import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Box, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (pw !== confirm) throw new Error("Passwords do not match");
      const response = await api.post('/auth/password-reset/verify/', { 
        email, 
        otp, 
        new_password: pw 
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully!");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error.message || error.response?.data?.error || "Failed to reset password.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || pw.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    resetMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Stockora</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your new password</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          </div>
          <button 
            type="submit" 
            disabled={resetMutation.isPending}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {resetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
