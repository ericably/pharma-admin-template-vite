
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import SupplierOrdersTab from "@/components/orders/SupplierOrdersTab";
import CustomerOrdersTab from "@/components/orders/CustomerOrdersTab";

export default function Orders() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-4 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h1>
                  <p className="text-purple-100 text-sm">Gérez vos commandes fournisseurs et clients</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-purple-100 text-xs">Commandes Actives</div>
              <div className="text-2xl font-bold">24</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Fournisseurs</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">12</div>
            <p className="text-emerald-100 text-sm">Commandes en cours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Package className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">12</div>
            <p className="text-blue-100 text-sm">Commandes clients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">En attente</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">5</div>
            <p className="text-orange-100 text-sm">En traitement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">€2,450</div>
            <p className="text-purple-100 text-sm">Valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800">Gestion des Commandes</CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Gérez vos commandes fournisseurs et les prescriptions clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="supplier" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="supplier" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200"
              >
                Commandes Fournisseurs
              </TabsTrigger>
              <TabsTrigger 
                value="customer"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200"
              >
                Commandes Clients
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="supplier" className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SupplierOrdersTab />
              </div>
            </TabsContent>
            
            <TabsContent value="customer" className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <CustomerOrdersTab />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
