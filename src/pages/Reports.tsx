
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesTable } from "@/components/reports/SalesTable";

const sampleSalesData = [
  { date: "2025-04-22", product: "Paracétamol 500mg", quantity: 50, amount: 175.00 },
  { date: "2025-04-22", product: "Amoxicilline 250mg", quantity: 30, amount: 216.00 },
  { date: "2025-04-21", product: "Ibuprofène 400mg", quantity: 25, amount: 87.50 },
  { date: "2025-04-21", product: "Oméprazole 20mg", quantity: 15, amount: 105.00 },
  { date: "2025-04-20", product: "Ventoline 100μg", quantity: 10, amount: 140.00 },
];

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Rapports & Analyses</h1>
                  <p className="text-emerald-100 text-lg mt-1">Consultez vos données et statistiques</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-emerald-100 text-sm">Rapports Disponibles</div>
              <div className="text-3xl font-bold">5</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">CA</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">€12,450</div>
            <p className="text-blue-100">Chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <PieChart className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Ventes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">342</div>
            <p className="text-emerald-100">Articles vendus</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Ordonnances</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">89</div>
            <p className="text-purple-100">Traitées ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Période</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">30</div>
            <p className="text-orange-100">Jours analysés</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-800">Rapport des Ventes</CardTitle>
                <CardDescription className="text-gray-600">Période mensuelle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="current">
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Sélectionner la période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mois en cours</SelectItem>
                <SelectItem value="last">Mois dernier</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            <div className="bg-gray-50 rounded-lg p-3">
              <SalesTable data={sampleSalesData} />
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-800">Rapport d'Inventaire</CardTitle>
                <CardDescription className="text-gray-600">Stock et mouvements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Dernière mise à jour</div>
              <div className="font-semibold text-gray-800">Aujourd'hui, 14:30</div>
            </div>
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-800">Rapport des Prescriptions</CardTitle>
                <CardDescription className="text-gray-600">Analyse des ordonnances</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="all">
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complétées</SelectItem>
              </SelectContent>
            </Select>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-gray-600">Complétées</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">12</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
