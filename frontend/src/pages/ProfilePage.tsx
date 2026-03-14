import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: user ? `${user.first_name} ${user.last_name}`.trim() : "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put("auth/me/", data),
    onSuccess: (response) => {
      login(response.data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to update profile";
      toast.error(msg);
      console.error("Profile update error:", error.response?.data);
    },
  });

  const handleUpdate = () => {
    const parts = form.full_name.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";
    updateMutation.mutate({
      first_name,
      last_name,
    });
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {getInitials()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user?.first_name} {user?.last_name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <input 
              type="text" 
              value={form.full_name} 
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
            <input 
              type="email" 
              value={form.email} 
              disabled
              className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
            <input 
              type="text" 
              value={user?.role?.replace('_', ' ') || ""} 
              disabled
              className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground capitalize cursor-not-allowed" 
            />
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Update Profile
        </button>
      </div>
    </div>
  );
}
