import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Data Quality Platform</h1>
              <p className="text-sm text-muted-foreground">Monitor, validate, and optimize your data</p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;