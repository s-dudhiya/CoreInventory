import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: "Stockora", active: paths.length === 0 }];
    
    paths.forEach((p, i) => {
      crumbs.push({
        label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
        active: i === paths.length - 1
      });
    });
    return crumbs;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div 
        className="flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "64px" : "240px" }}
      >
        <AppHeader breadcrumbs={getBreadcrumbs()} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
