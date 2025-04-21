
import { Outlet } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
