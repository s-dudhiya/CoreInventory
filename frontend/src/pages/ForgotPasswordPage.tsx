import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/otp-verify");
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
          <button type="submit" className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]">
            Send Code
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
