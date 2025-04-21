
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Pill, 
  Users, 
  ClipboardList, 
  ShoppingBag, 
  BarChart4, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Pill },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Prescriptions", href: "/prescriptions", icon: ClipboardList },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Reports", href: "/reports", icon: BarChart4 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[70px]" : "w-64"
    )}>
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="font-semibold text-lg text-pharmacy-600">PharmaSys</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-pharmacy-500 text-white"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn("flex-shrink-0 h-5 w-5", 
                    isActive ? "text-white" : "text-sidebar-foreground"
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
