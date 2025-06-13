
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
  Menu,
  UserRound,  // Added for Doctors
  Hospital,   // Added for Pharmacists
  Truck,      // Added for Suppliers
  Cross       // Pharmacy symbol
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Inventaire", href: "/inventory", icon: Pill },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Ordonnances", href: "/prescriptions", icon: ClipboardList },
  { name: "Commandes", href: "/orders", icon: ShoppingBag },
  { name: "Pharmaciens", href: "/pharmacists", icon: Hospital },
  { name: "Docteurs", href: "/doctors", icon: UserRound },
  { name: "Fournisseurs", href: "/suppliers", icon: Truck },
  { name: "Rapports", href: "/reports", icon: BarChart4 },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 pharmacy-gradient",
      collapsed ? "w-[70px]" : "w-64"
    )}>
      <div className="flex items-center h-16 px-4 border-b border-white/20">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Cross className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-xl text-white tracking-tight">
              PharmaSys
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Cross className="h-6 w-6 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "ml-auto text-white hover:bg-white/20 hover:text-white", 
            collapsed && "mx-auto mt-2"
          )}
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
                  "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30"
                    : "text-white/80 hover:bg-white/15 hover:text-white hover:shadow-md"
                )}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110", 
                    isActive ? "text-white" : "text-white/80"
                  )}
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 rounded-xl",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

