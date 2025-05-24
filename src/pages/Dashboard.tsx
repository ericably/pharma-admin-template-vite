
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { Pill, Users, ClipboardList, ShoppingBag, AreaChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const recentActivities = [
  {
    id: 1,
    title: "New prescription filled",
    description: "Prescription #12345 for John Doe has been filled and is ready for pickup.",
    timestamp: "2 minutes ago",
    type: "prescription" as const,
  },
  {
    id: 2,
    title: "Inventory alert",
    description: "Amoxicillin 500mg is running low. Current stock: 15 units.",
    timestamp: "10 minutes ago",
    type: "inventory" as const,
  },
  {
    id: 3,
    title: "New patient registered",
    description: "Sarah Johnson has been registered with ID #P9876.",
    timestamp: "1 hour ago",
    type: "patient" as const,
  },
  {
    id: 4,
    title: "Order received",
    description: "Order #OR-2023-456 from Pharma Wholesale Inc. has been received.",
    timestamp: "3 hours ago",
    type: "order" as const,
  },
  {
    id: 5,
    title: "Medication dispensed",
    description: "Lisinopril 10mg - 30 tablets dispensed to Michael Brown.",
    timestamp: "5 hours ago",
    type: "prescription" as const,
  },
  {
    id: 6,
    title: "New order placed",
    description: "Order #PO-2023-789 placed with HealthMed Suppliers.",
    timestamp: "1 day ago",
    type: "order" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to PharmaSys Admin. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total "
          value="1,234"
          icon={Pill}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Patients"
          value="856"
          icon={Users}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Pending Prescriptions"
          value="23"
          icon={ClipboardList}
          iconColor="text-amber-600" 
          iconBgColor="bg-amber-100"
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Orders This Month"
          value="42" 
          icon={ShoppingBag}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: 20, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
            <RecentActivityCard activities={recentActivities} />
            
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
                <CardDescription>Low inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amoxicillin 500mg</span>
                      <span className="text-sm font-bold text-red-500">15 units</span>
                    </div>
                    <div className="bg-red-100 h-2 rounded-full">
                      <div className="bg-red-500 h-2 w-1/5 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Lisinopril 10mg</span>
                      <span className="text-sm font-bold text-amber-500">28 units</span>
                    </div>
                    <div className="bg-amber-100 h-2 rounded-full">
                      <div className="bg-amber-500 h-2 w-2/5 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Atorvastatin 20mg</span>
                      <span className="text-sm font-bold text-amber-500">32 units</span>
                    </div>
                    <div className="bg-amber-100 h-2 rounded-full">
                      <div className="bg-amber-500 h-2 w-1/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>View your pharmacy's sales data</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <AreaChart className="h-10 w-10 mb-2" />
                  <p>Sales chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Monitor your stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Pill className="h-10 w-10 mb-2" />
                  <p>Inventory overview will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
