
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  FileDown, 
  MoreVertical,
  Edit,
  Trash2,
  FilePlus,
  FileText,
  Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import PharmacistService, { Pharmacist } from "@/api/services/PharmacistService";
import { useQuery } from "@tanstack/react-query";

export default function Pharmacists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();

  const { data: pharmacistsData, refetch } = useQuery({
    queryKey: ['pharmacists'],
    queryFn: () => PharmacistService.getAllPharmacists()
  });

  const pharmacists = pharmacistsData?.items || [];
  
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      status: "Actif" as "Actif" | "Inactif"
    }
  });

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
        return pharmacist.status === "Actif";
      case "inactive":
        return pharmacist.status === "Inactif";
      case "license":
        return pharmacist.licenseNumber !== undefined && pharmacist.licenseNumber !== "";
      case "all":
      default:
        return true;
    }
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Actif":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge>;
      case "Inactif":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreatePharmacist = async (data: any) => {
    setIsLoading(true);
    try {
      const newPharmacist: Omit<Pharmacist, '@id' | 'id'> = {
        ...data,
        status: data.status || "Actif"
      };
      
      await PharmacistService.createPharmacist(newPharmacist);
      
      toast({
        title: "Succès",
        description: "Le pharmacien a été ajouté avec succès.",
        variant: "default",
      });
      
      form.reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating pharmacist:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du pharmacien.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    setIsEditing(true);
    form.reset({
      name: pharmacist.name,
      email: pharmacist.email,
      phone: pharmacist.phone,
      licenseNumber: pharmacist.licenseNumber,
      status: pharmacist.status
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePharmacist = async (data: any) => {
    if (!selectedPharmacist?.id) return;
    
    setIsLoading(true);
    try {
      await PharmacistService.updatePharmacist(selectedPharmacist.id, data);
      
      toast({
        title: "Succès",
        description: "Le pharmacien a été modifié avec succès.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
      setIsEditing(false);
      setSelectedPharmacist(null);
      refetch();
    } catch (error) {
      console.error("Error updating pharmacist:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du pharmacien.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePharmacist = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pharmacien ?")) {
      try {
        await PharmacistService.deletePharmacist(id);
        
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
          pharmacist.status
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
    setIsEditing(false);
    setSelectedPharmacist(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      status: "Actif"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedPharmacist(null);
  };

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
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter Pharmacien
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un Pharmacien</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Modifiez les informations du pharmacien." : "Ajoutez les informations du nouveau pharmacien."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(isEditing ? handleUpdatePharmacist : handleCreatePharmacist)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom Complet
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nom du pharmacien"
                        className="col-span-3"
                        {...form.register("name", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="pharmacien@example.com"
                        className="col-span-3"
                        {...form.register("email", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        placeholder="01 23 45 67 89"
                        className="col-span-3"
                        {...form.register("phone", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="licenseNumber" className="text-right">
                        N° Licence
                      </Label>
                      <Input
                        id="licenseNumber"
                        placeholder="PH123456"
                        className="col-span-3"
                        {...form.register("licenseNumber", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Statut
                      </Label>
                      <Select 
                        value={form.watch("status")} 
                        onValueChange={(value: "Actif" | "Inactif") => form.setValue("status", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Actif">Actif</SelectItem>
                          <SelectItem value="Inactif">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : (isEditing ? "Enregistrer" : "Ajouter Pharmacien")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>N° Licence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPharmacists.length > 0 ? (
                filteredPharmacists.map((pharmacist) => (
                  <TableRow key={pharmacist.id}>
                    <TableCell className="font-medium">{pharmacist.id}</TableCell>
                    <TableCell>{pharmacist.name}</TableCell>
                    <TableCell>{pharmacist.email}</TableCell>
                    <TableCell>{pharmacist.phone}</TableCell>
                    <TableCell>{pharmacist.licenseNumber}</TableCell>
                    <TableCell>{getStatusBadge(pharmacist.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPharmacist(pharmacist)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPharmacist(pharmacist)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FilePlus className="mr-2 h-4 w-4" />
                            Nouvelle Ordonnance
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Voir Historique
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDeletePharmacist(pharmacist.id || 0)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Aucun pharmacien trouvé correspondant à vos critères
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Affichage de {filteredPharmacists.length} {filteredPharmacists.length === 1 ? 'pharmacien' : 'pharmaciens'}
          {currentFilter !== "all" && (
            <>
              {' '}• Filtre: {currentFilter === "active" ? "Actifs" : currentFilter === "inactive" ? "Inactifs" : "Avec Licence"}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
