import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Box } from "lucide-react";
import { motion } from "framer-motion";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function OTPVerifyPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      navigate("/reset-password", { state: { email, otp } });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Stockora</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Verify OTP</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-6">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <button type="submit" className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]">
            Verify
          </button>
        </form>
      </motion.div>
    </div>
  );
}
