import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  FileDown, 
  AlertTriangle,
  Package,
  Package2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import MedicationService, { Medication } from "@/api/services/MedicationService";
import { useQuery } from "@tanstack/react-query";
import { MedicationsList } from "@/components/inventory/MedicationsList";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      dosage: "",
      stock: 0,
      supplier: "",
      price: 0,
    }
  });

  const { data: medicationsData, refetch } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationService.getAllMedications()
  });

  const medications = medicationsData?.items || [];
  
  const filteredMedications = medications.filter(medication => {
    const matchesSearch = 
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (medication.id && medication.id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      medication.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (currentFilter) {
      case "low-stock":
        return medication.stock < 10;
      case "out-of-stock":
        return medication.stock === 0;
      case "active":
        return medication.status === "Actif";
      case "inactive":
        return medication.status === "Inactif";
      case "all":
      default:
        return true;
    }
  });

  const handleCreateMedication = async (data: any) => {
    setIsLoading(true);
    try {
      const newMedication: Omit<Medication, '@id' | 'id'> = {
        ...data,
        status: "Actif"
      };
      
      await MedicationService.createMedication(newMedication);
      
      toast({
        title: "Succès",
        description: "Le médicament a été ajouté avec succès.",
        variant: "default",
      });
      
      form.reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating medication:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du médicament.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    toast({
      title: "Détails du médicament",
      description: `Affichage des détails de ${medication.name}`,
    });
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    form.reset({
      name: medication.name,
      category: medication.category,
      description: medication.description || "",
      dosage: medication.dosage,
      stock: medication.stock,
      supplier: medication.supplier,
      price: medication.price,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteMedication = async (medication: Medication) => {
    if (!medication.id) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      try {
        await MedicationService.deleteMedication(medication.id);
        
        toast({
          title: "Succès",
          description: "Le médicament a été supprimé avec succès.",
          variant: "default",
        });
        
        refetch();
      } catch (error) {
        console.error("Error deleting medication:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du médicament.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportMedications = () => {
    try {
      const headers = ["ID", "Nom", "Catégorie", "Dosage", "Stock", "Fournisseur", "Prix", "Statut"];
      const csvRows = [headers];
      
      filteredMedications.forEach(medication => {
        const row = [
          medication.id?.toString() || '',
          medication.name,
          medication.category,
          medication.dosage,
          medication.stock.toString(),
          medication.supplier,
          medication.price.toString(),
          medication.status
        ];
        csvRows.push(row);
      });
      
      const csvContent = csvRows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `medications_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: `${filteredMedications.length} médicaments exportés avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting medications:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur s'est produite lors de l'exportation des médicaments.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    
    const filterLabels: {[key: string]: string} = {
      "all": "Tous les Médicaments",
      "low-stock": "Stock Faible",
      "out-of-stock": "Rupture de Stock",
      "active": "Médicaments Actifs",
      "inactive": "Médicaments Inactifs"
    };
    
    toast({
      title: "Filtre Appliqué",
      description: `Affichage : ${filterLabels[filter]}.`,
      variant: "default",
    });
  };

  const lowStockCount = medications.filter(m => m.stock < 10).length;
  const outOfStockCount = medications.filter(m => m.stock === 0).length;
  const activeCount = medications.filter(m => m.status === "Actif").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestion de l'Inventaire</h1>
                  <p className="text-green-100 text-lg mt-1">Gérez votre stock de médicaments</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-green-100 text-sm">Total Médicaments</div>
              <div className="text-3xl font-bold">{medications.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-green-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package2 className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{medications.length}</div>
            <p className="text-emerald-100">Médicaments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Actifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{activeCount}</div>
            <p className="text-blue-100">En stock actif</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Stock Bas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{lowStockCount}</div>
            <p className="text-orange-100">Stock faible</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingDown className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Rupture</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{outOfStockCount}</div>
            <p className="text-red-100">Rupture de stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Section */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Alertes de Stock</p>
                <p className="text-sm">
                  {outOfStockCount > 0 && `${outOfStockCount} médicament(s) en rupture de stock`}
                  {outOfStockCount > 0 && lowStockCount > 0 && " • "}
                  {lowStockCount > 0 && `${lowStockCount} médicament(s) avec stock faible`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Inventaire des Médicaments</CardTitle>
              <CardDescription className="text-gray-600">
                Gérez votre stock de médicaments, surveillez les niveaux et gérez les fournisseurs
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Ajouter Médicament
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedMedication ? "Modifier le Médicament" : "Ajouter un Nouveau Médicament"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedMedication ? "Modifiez les informations du médicament." : "Ajoutez un nouveau médicament à l'inventaire."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreateMedication)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nom du médicament"
                        className="col-span-3"
                        {...form.register("name", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Catégorie
                      </Label>
                      <Input
                        id="category"
                        placeholder="Analgésique, Antibiotique..."
                        className="col-span-3"
                        {...form.register("category", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dosage" className="text-right">
                        Dosage
                      </Label>
                      <Input
                        id="dosage"
                        placeholder="500mg, 10ml..."
                        className="col-span-3"
                        {...form.register("dosage", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">
                        Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="Quantité en stock"
                        className="col-span-3"
                        {...form.register("stock", { required: true, valueAsNumber: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier" className="text-right">
                        Fournisseur
                      </Label>
                      <Input
                        id="supplier"
                        placeholder="Nom du fournisseur"
                        className="col-span-3"
                        {...form.register("supplier", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Prix (€)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="Prix unitaire"
                        className="col-span-3"
                        {...form.register("price", { required: true, valueAsNumber: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        placeholder="Description (optionnel)"
                        className="col-span-3"
                        {...form.register("description")}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : selectedMedication ? "Modifier" : "Ajouter"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un médicament..."
                className="pl-8 w-full bg-white/70 border-gray-200 focus:border-green-500 focus:ring-green-500/20 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex bg-white/70 border-gray-200 hover:bg-white hover:border-green-500">
                    Filtrer
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                    Tous les Médicaments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("low-stock")}>
                    Stock Faible
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("out-of-stock")}>
                    Rupture de Stock
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                    Médicaments Actifs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                    Médicaments Inactifs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleExportMedications} className="bg-white/70 border-gray-200 hover:bg-white hover:border-green-500">
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <MedicationsList
              medications={filteredMedications}
              onEdit={handleEditMedication}
              onDelete={handleDeleteMedication}
              onView={handleViewMedication}
            />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Affichage de {filteredMedications.length} {filteredMedications.length === 1 ? 'médicament' : 'médicaments'}
            {currentFilter !== "all" && (
              <>
                {' '}• Filtre: {
                  currentFilter === "low-stock" ? "Stock Faible" :
                  currentFilter === "out-of-stock" ? "Rupture de Stock" :
                  currentFilter === "active" ? "Actifs" : "Inactifs"
                }
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
