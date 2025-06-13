
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import SupplierOrdersTab from "@/components/orders/SupplierOrdersTab";
import CustomerOrdersTab from "@/components/orders/CustomerOrdersTab";

export default function Orders() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestion des Commandes</h1>
                  <p className="text-purple-100 text-lg mt-1">Gérez vos commandes fournisseurs et clients</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-purple-100 text-sm">Commandes Actives</div>
              <div className="text-3xl font-bold">24</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Fournisseurs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">12</div>
            <p className="text-emerald-100">Commandes en cours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Clients</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">12</div>
            <p className="text-blue-100">Commandes clients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">En attente</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">5</div>
            <p className="text-orange-100">En traitement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">€2,450</div>
            <p className="text-purple-100">Valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-800">Gestion des Commandes</CardTitle>
          <CardDescription className="text-gray-600">
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
