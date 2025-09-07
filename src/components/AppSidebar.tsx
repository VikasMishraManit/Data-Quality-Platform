import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Shield,
  PlayCircle,
  Database,
  AlertTriangle,
  GitBranch,
  Zap,
  DollarSign,
  Settings,
  Activity,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: BarChart3 },
    ],
  },
  {
    title: "Data Quality",
    items: [
      { title: "Rule Management", url: "/rules", icon: Shield },
      { title: "Rule Executions", url: "/executions", icon: PlayCircle },
      { title: "Data Profiling", url: "/profiling", icon: Activity },
    ],
  },
  {
    title: "Observability",
    items: [
      { title: "Asset Catalog", url: "/catalog", icon: Database },
      { title: "Incidents", url: "/incidents", icon: AlertTriangle },
      { title: "Data Lineage", url: "/lineage", icon: GitBranch },
      { title: "Anomaly Detection", url: "/anomalies", icon: Zap },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Cost Observability", url: "/costs", icon: DollarSign },
      { title: "Governance", url: "/governance", icon: Users },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            {state !== "collapsed" && (
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium uppercase tracking-wider">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive: navIsActive }) => 
                          `nav-item ${isActive(item.url) || navIsActive ? 'nav-item-active' : 'nav-item-inactive'}`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}