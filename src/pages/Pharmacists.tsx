
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
  ChevronDown, 
  Plus, 
  Search, 
  FileDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PharmacistService, { Pharmacist } from "@/api/services/PharmacistService";
import { useQuery } from "@tanstack/react-query";
import { PharmacistForm } from "@/components/pharmacists/PharmacistForm";
import { PharmacistsList } from "@/components/pharmacists/PharmacistsList";

export default function Pharmacists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  
  const { toast } = useToast();

  const { data: pharmacistsData, refetch } = useQuery({
    queryKey: ['pharmacists'],
    queryFn: () => PharmacistService.getAllPharmacists()
  });

  const pharmacists = pharmacistsData?.items || [];
  
  const filteredPharmacists = pharmacists.filter(pharmacist => {
    const matchesSearch = 
      pharmacist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pharmacist.id && pharmacist.id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      pharmacist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacist.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacist.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (currentFilter) {
      case "active":
        return pharmacist.status === true;
      case "inactive":
        return pharmacist.status === false;
      case "license":
        return pharmacist.licenseNumber !== undefined && pharmacist.licenseNumber !== "";
      case "all":
      default:
        return true;
    }
  });

  const handleCreatePharmacist = async (data: Omit<Pharmacist, '@id' | 'id'>) => {
    try {
      await PharmacistService.createPharmacist(data);
      
      toast({
        title: "Succès",
        description: "Le pharmacien a été ajouté avec succès.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating pharmacist:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du pharmacien.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePharmacist = async (data: Omit<Pharmacist, '@id' | 'id'>) => {
    if (!selectedPharmacist?.id) return;
    
    try {
      await PharmacistService.updatePharmacist(selectedPharmacist.id, data);
      
      toast({
        title: "Succès",
        description: "Le pharmacien a été modifié avec succès.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
      setSelectedPharmacist(null);
      refetch();
    } catch (error) {
      console.error("Error updating pharmacist:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du pharmacien.",
        variant: "destructive",
      });
    }
  };

  const handleViewPharmacist = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist);
    toast({
      title: "Détails du pharmacien",
      description: `Affichage des détails de ${pharmacist.name}`,
    });
  };

  const handleEditPharmacist = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setIsDialogOpen(true);
  };

  const handleDeletePharmacist = async (pharmacist: Pharmacist) => {
    if (!pharmacist.id) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pharmacien ?")) {
      try {
        await PharmacistService.deletePharmacist(pharmacist.id);
        
        toast({
          title: "Succès",
          description: "Le pharmacien a été supprimé avec succès.",
          variant: "default",
        });
        
        refetch();
      } catch (error) {
        console.error("Error deleting pharmacist:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du pharmacien.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportPharmacists = () => {
    try {
      const headers = ["ID", "Nom", "Email", "Téléphone", "N° Licence", "Statut"];
      const csvRows = [headers];
      
      filteredPharmacists.forEach(pharmacist => {
        const row = [
          pharmacist.id?.toString() || '',
          pharmacist.name,
          pharmacist.email,
          pharmacist.phone,
          pharmacist.licenseNumber,
          pharmacist.status ? 'Actif' : 'Inactif'
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
      link.setAttribute('download', `pharmacists_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: `${filteredPharmacists.length} pharmaciens exportés avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting pharmacists:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur s'est produite lors de l'exportation des pharmaciens.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    
    const filterLabels: {[key: string]: string} = {
      "all": "Tous les Pharmaciens",
      "active": "Pharmaciens Actifs",
      "inactive": "Pharmaciens Inactifs",
      "license": "Pharmaciens avec Licence"
    };
    
    toast({
      title: "Filtre Appliqué",
      description: `Affichage : ${filterLabels[filter]}.`,
      variant: "default",
    });
  };

  const handleOpenDialog = () => {
    setSelectedPharmacist(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPharmacist(null);
  };

  const handleFormSubmit = selectedPharmacist ? handleUpdatePharmacist : handleCreatePharmacist;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Pharmaciens</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations des pharmaciens, leurs licences et leur statut.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un pharmacien..."
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
                  Tous les Pharmaciens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                  Pharmaciens Actifs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                  Pharmaciens Inactifs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("license")}>
                  Par Licence
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExportPharmacists}>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter Pharmacien
            </Button>
          </div>
        </div>

        <PharmacistsList
          pharmacists={filteredPharmacists}
          onEdit={handleEditPharmacist}
          onDelete={handleDeletePharmacist}
          onView={handleViewPharmacist}
        />
        
        <div className="mt-4 text-sm text-muted-foreground">
          Affichage de {filteredPharmacists.length} {filteredPharmacists.length === 1 ? 'pharmacien' : 'pharmaciens'}
          {currentFilter !== "all" && (
            <>
              {' '}• Filtre: {currentFilter === "active" ? "Actifs" : currentFilter === "inactive" ? "Inactifs" : "Avec Licence"}
            </>
          )}
        </div>
      </Card>

      <PharmacistForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        initialData={selectedPharmacist || undefined}
      />
    </div>
  );
}
