
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

export default function Pharmacists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: pharmacistsData, refetch } = useQuery({
    queryKey: ['pharmacists'],
    queryFn: () => PharmacistService.getAllPharmacists()
  });

  const pharmacists = pharmacistsData?.items || [];

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
    // To be implemented
    console.log("Edit pharmacist:", pharmacist);
  };

  const handleDelete = (pharmacist: Pharmacist) => {
    // To be implemented
    console.log("Delete pharmacist:", pharmacist);
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Pharmacien
          </Button>
        </div>

        <PharmacistsList 
          pharmacists={pharmacists}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <PharmacistForm 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddPharmacist}
      />
    </div>
  );
}
