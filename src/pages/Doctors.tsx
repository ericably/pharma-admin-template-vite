
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";
import { DoctorsList } from "@/components/doctors/DoctorsList";
import { DoctorForm } from "@/components/doctors/DoctorForm";
import DoctorService, { Doctor } from "@/api/services/DoctorService";
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

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: doctorsData, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => DoctorService.getAllDoctors()
  });

  const doctors = doctorsData?.items || [];

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDoctor = async (doctor: Omit<Doctor, '@id' | 'id'>) => {
    try {
      await DoctorService.createDoctor(doctor);
      toast({
        title: "Succès",
        description: "Médecin ajouté avec succès",
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du médecin",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctor?.id) return;
    
    try {
      await DoctorService.deleteDoctor(selectedDoctor.id);
      toast({
        title: "Succès",
        description: "Médecin supprimé avec succès",
      });
      setIsConfirmDeleteOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du médecin",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (doctorData: Omit<Doctor, '@id' | 'id'>) => {
    if (!selectedDoctor?.id) return;
    
    try {
      await DoctorService.updateDoctor(selectedDoctor.id, doctorData);
      toast({
        title: "Succès",
        description: "Médecin modifié avec succès",
      });
      setIsDialogOpen(false);
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du médecin",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setSelectedDoctor(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Médecins</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les médecins partenaires.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un médecin..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Médecin
          </Button>
        </div>

        <DoctorsList 
          doctors={filteredDoctors}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <DoctorForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={isEditing ? handleEditSubmit : handleAddDoctor}
        initialData={isEditing ? selectedDoctor || undefined : undefined}
      />

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible.
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
