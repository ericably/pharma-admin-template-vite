
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import SupplierOrdersTab from "@/components/orders/SupplierOrdersTab";
import CustomerOrdersTab from "@/components/orders/CustomerOrdersTab";

export default function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage supplier orders and customer prescriptions.
        </p>
      </div>

      <Card className="p-4">
        <Tabs defaultValue="supplier" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supplier">Commandes Fournisseurs</TabsTrigger>
            <TabsTrigger value="customer">Commandes Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="supplier" className="mt-6">
            <SupplierOrdersTab />
          </TabsContent>
          
          <TabsContent value="customer" className="mt-6">
            <CustomerOrdersTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
