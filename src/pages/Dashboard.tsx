
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { Pill, Users, ClipboardList, ShoppingBag, AreaChart, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-3 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight mb-0.5">
                Bonjour, Dr. PharmaSys
              </h1>
              <p className="text-emerald-100 text-xs">
                Vous avez <span className="font-semibold text-white">5 rendez-vous</span> aujourd'hui
              </p>
            </div>
            <div className="text-right">
              <div className="text-emerald-100 text-xs">Aujourd'hui</div>
              <div className="text-sm font-bold">{currentTime}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Total Medications"
            value="1,234"
            icon={Pill}
            iconColor="text-blue-600"
            iconBgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Active Patients"
            value="856"
            icon={Users}
            iconColor="text-emerald-600"
            iconBgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Pending Prescriptions"
            value="23"
            icon={ClipboardList}
            iconColor="text-amber-600" 
            iconBgColor="bg-gradient-to-br from-amber-50 to-amber-100"
            trend={{ value: 8, isPositive: false }}
          />
        </div>
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Orders This Month"
            value="42" 
            icon={ShoppingBag}
            iconColor="text-purple-600"
            iconBgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            trend={{ value: 20, isPositive: true }}
          />
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-md border-0 bg-gradient-to-r from-white to-gray-50">
        <CardHeader className="pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-sm">Quoi de neuf aujourd'hui?</CardTitle>
              <CardDescription className="text-xs">Votre planning du jour</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-emerald-600">07:30 - 07:40</div>
              <div className="text-xs text-gray-600 mt-0.5">Motif: Hello on se voit en ligne...</div>
              <div className="text-xs text-emerald-500 mt-0.5">En ligne - KOFFI Yao</div>
            </div>
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-amber-600">15:30 - 15:40</div>
              <div className="text-xs text-gray-600 mt-0.5">Motif: bj lagon...</div>
              <div className="text-xs text-amber-500 mt-0.5">À domicile - KOFFI Yao</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-2">
        <TabsList className="bg-white shadow-md border-0 p-0.5 rounded-lg">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">Ventes</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">Inventaire</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-2">
          <div className="grid gap-2 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivityCard activities={recentActivities} />
            </div>
            
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-emerald-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alertes Stock</CardTitle>
                    <CardDescription>Stocks faibles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Amoxicillin 500mg</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">15 units</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Lisinopril 10mg</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">28 units</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Atorvastatin 20mg</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">32 units</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sales">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <AreaChart className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Évolution des ventes</CardTitle>
                  <CardDescription>Analyse de performance des ventes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/50">
                <div className="flex flex-col items-center text-emerald-600">
                  <AreaChart className="h-16 w-16 mb-4 opacity-60" />
                  <p className="text-lg font-medium">Graphique des ventes à venir</p>
                  <p className="text-sm text-emerald-500">Données en cours de chargement...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Pill className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>État de l'inventaire</CardTitle>
                  <CardDescription>Surveillance des niveaux de stock</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/50">
                <div className="flex flex-col items-center text-emerald-600">
                  <Pill className="h-16 w-16 mb-4 opacity-60" />
                  <p className="text-lg font-medium">Vue d'ensemble de l'inventaire</p>
                  <p className="text-sm text-emerald-500">Données en cours de chargement...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
