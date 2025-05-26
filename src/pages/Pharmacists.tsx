
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { PharmacistsList } from "@/components/pharmacists/PharmacistsList";
import { PharmacistForm } from "@/components/pharmacists/PharmacistForm";
import PharmacistService, { Pharmacist } from "@/api/services/PharmacistService";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Pharmacists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: pharmacistsData, refetch } = useQuery({
    queryKey: ['pharmacists'],
    queryFn: () => PharmacistService.getAllPharmacists()
  });

  const pharmacists = pharmacistsData?.items || [];

  // Filter pharmacists based on search query
  const filteredPharmacists = pharmacists.filter(
    (pharmacist) =>
      pharmacist.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacist.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacist.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPharmacist = async (pharmacist: Omit<Pharmacist, '@id' | 'id'>) => {
    try {
      await PharmacistService.createPharmacist(pharmacist);
      toast({
        title: "Succès",
        description: "Pharmacien ajouté avec succès",
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du pharmacien",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPharmacist?.id) return;
    
    try {
      await PharmacistService.deletePharmacist(selectedPharmacist.id);
      toast({
        title: "Succès",
        description: "Pharmacien supprimé avec succès",
      });
      setIsConfirmDeleteOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du pharmacien",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (pharmacistData: Omit<Pharmacist, '@id' | 'id'>) => {
    if (!selectedPharmacist?.id) return;
    
    try {
      await PharmacistService.updatePharmacist(selectedPharmacist.id, pharmacistData);
      toast({
        title: "Succès",
        description: "Pharmacien modifié avec succès",
      });
      setIsDialogOpen(false);
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du pharmacien",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setSelectedPharmacist(null);
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
          Gérez les pharmaciens de votre établissement.
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
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Pharmacien
          </Button>
        </div>

        <PharmacistsList 
          pharmacists={filteredPharmacists}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <PharmacistForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={isEditing ? handleEditSubmit : handleAddPharmacist}
        initialData={isEditing ? selectedPharmacist || undefined : undefined}
      />

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce pharmacien ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
