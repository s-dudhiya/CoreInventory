import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Warehouse,
  ClipboardList,
  History,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Box,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Products", path: "/products", icon: Package },
  { title: "Operations", path: "/operations", icon: ArrowRightLeft },
  { title: "Warehouses", path: "/warehouses", icon: Warehouse },
  { title: "Adjustments", path: "/adjustments", icon: ClipboardList },
  { title: "Move History", path: "/moves", icon: History },
  { title: "Settings", path: "/settings", icon: Settings },
  { title: "Profile", path: "/profile", icon: User },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <Box className="h-6 w-6 shrink-0 text-primary" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
              >
                <div className="flex flex-col">
                  <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-foreground">
                    Stockora
                  </span>
                  <span className="whitespace-nowrap text-[10px] leading-none mt-0.5 text-muted-foreground uppercase tracking-wider">
                    Inventory Intelligence
                  </span>
                </div>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems
          .filter(item => {
            if (user?.role === 'warehouse_staff' && (item.title === 'Settings' || item.title === 'Warehouses')) {
              return false;
            }
            return true;
          })
          .map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
      </nav>
    </motion.aside>
  );
}
