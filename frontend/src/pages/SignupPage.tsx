import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">CoreInventory</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Get started with CoreInventory</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
            { label: "Email", key: "email", type: "email", placeholder: "name@company.com" },
            { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
            { label: "Confirm Password", key: "confirm", type: "password", placeholder: "••••••••" },
          ].map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          ))}
          <button type="submit" className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]">
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
