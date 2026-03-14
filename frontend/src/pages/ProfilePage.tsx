import { useState } from "react";
import { Save, User } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@stockora.com");
  const role = "Warehouse Manager";

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
              JD
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
            <input type="text" value={role} disabled
              className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label>
            <input type="password" placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
            <input type="password" placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
          <Save className="h-4 w-4" /> Update Profile
        </button>
      </div>
    </div>
  );
}
