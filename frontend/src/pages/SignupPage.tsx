import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirm: "",
    role: "warehouse_staff" // default role
  });

  const { login } = useAuth();
  
  const registerMutation = useMutation({
    mutationFn: async () => {
      // Split name into first and last name for Django User model
      const nameParts = form.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      if (form.password !== form.confirm) {
        throw new Error("Passwords do not match");
      }

      const response = await api.post('/auth/register/', {
        username: form.email, // using email as username to match login logic
        email: form.email,
        password: form.password,
        first_name: firstName,
        last_name: lastName,
        role: form.role
      });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user);
      toast.success(data.message || "Account created successfully!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      // Improve error message display based on DRF response structure
      let errMsg = "Failed to create account.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') errMsg = data;
        else if (data.password) errMsg = data.password.join(" ");
        else if (data.email) errMsg = "Email: " + data.email.join(" ");
        else if (data.username) errMsg = "Username: " + data.username.join(" ");
        else if (data.role) errMsg = "Role: " + data.role.join(" ");
        else if (data.error) errMsg = data.error;
      } else if (error.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Stockora</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Get started with Stockora</p>

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
          
          <div>
             <label className="mb-1.5 block text-sm font-medium text-foreground">Select Role</label>
             <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
             >
                <option value="inventory_manager">Inventory Manager</option>
                <option value="warehouse_staff">Warehouse Staff</option>
             </select>
          </div>

          <button  
            type="submit" 
            disabled={registerMutation.isPending}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
