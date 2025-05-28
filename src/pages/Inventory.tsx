
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
  Package
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
      stockQuantity: 0,
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
        return medication.stockQuantity < 10;
      case "out-of-stock":
        return medication.stockQuantity === 0;
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
      stockQuantity: medication.stockQuantity,
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
          medication.stockQuantity.toString(),
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

  const lowStockCount = medications.filter(m => m.stockQuantity < 10).length;
  const outOfStockCount = medications.filter(m => m.stockQuantity === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion de l'Inventaire</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre stock de médicaments, surveillez les niveaux et gérez les fournisseurs.
        </p>
      </div>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="p-4 border-orange-200 bg-orange-50">
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
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un médicament..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex">
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
            <Button variant="outline" onClick={handleExportMedications}>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
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
                      <Label htmlFor="stockQuantity" className="text-right">
                        Stock
                      </Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        placeholder="Quantité en stock"
                        className="col-span-3"
                        {...form.register("stockQuantity", { required: true, valueAsNumber: true })}
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
        </div>

        <MedicationsList
          medications={filteredMedications}
          onEdit={handleEditMedication}
          onDelete={handleDeleteMedication}
          onView={handleViewMedication}
        />
        
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
      </Card>
    </div>
  );
}
