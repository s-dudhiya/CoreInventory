import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/password-reset/request/', { email });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent if account exists!");
      // Pass the email forward so the user doesn't have to re-type it
      navigate("/otp-verify", { state: { email } });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to send reset instruction.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    resetMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">CoreInventory</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email to receive a verification code</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          </div>
          <button 
            type="submit" 
            disabled={resetMutation.isPending || !email}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {resetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
