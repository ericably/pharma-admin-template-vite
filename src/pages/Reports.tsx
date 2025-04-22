import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
        <p className="text-muted-foreground mt-2">
          Générez et consultez les rapports de la pharmacie
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Rapport des Ventes</h3>
              <p className="text-sm text-muted-foreground">Période mensuelle</p>
            </div>
          </div>
          <div className="space-y-2">
            <Select defaultValue="current">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mois en cours</SelectItem>
                <SelectItem value="last">Mois dernier</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            <SalesTable data={sampleSalesData} />
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Rapport d'Inventaire</h3>
              <p className="text-sm text-muted-foreground">Stock et mouvements</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Rapport des Prescriptions</h3>
              <p className="text-sm text-muted-foreground">Analyse des ordonnances</p>
            </div>
          </div>
          <div className="space-y-2">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complétées</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
