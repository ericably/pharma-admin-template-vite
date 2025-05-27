
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: doctorsData, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => DoctorService.getAllDoctors()
  });

  const doctors = doctorsData?.items || [];

  // Filter doctors based on search query and filters
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && doctor.status) ||
      (statusFilter === "inactive" && !doctor.status);

    const matchesSpeciality = specialityFilter === "all" || 
      doctor.speciality.toLowerCase() === specialityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSpeciality;
  });

  // Get unique specialities for filter
  const uniqueSpecialities = [...new Set(doctors.map(doctor => doctor.speciality))];

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

  const handleExportPDF = () => {
    // Generate PDF content
    const pdfContent = `
      LISTE DES MÉDECINS
      
      Date d'export: ${new Date().toLocaleDateString('fr-FR')}
      Nombre total: ${filteredDoctors.length}
      
      ${filteredDoctors.map(doctor => `
        ID: ${doctor.id}
        Nom: ${doctor.name}
        Email: ${doctor.email}
        Téléphone: ${doctor.phone}
        Spécialité: ${doctor.speciality}
        N° Licence: ${doctor.licenseNumber}
        Statut: ${doctor.status ? 'Actif' : 'Inactif'}
        ----------------------------------------
      `).join('')}
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medecins_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export réussi",
      description: "La liste des médecins a été exportée avec succès",
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSpecialityFilter("all");
    setSearchQuery("");
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Barre de recherche */}
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

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {uniqueSpecialities.map((speciality) => (
                    <SelectItem key={speciality} value={speciality.toLowerCase()}>
                      {speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || specialityFilter !== "all" || searchQuery) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter en PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Médecin
            </Button>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredDoctors.length} médecin(s) trouvé(s)
            {(statusFilter !== "all" || specialityFilter !== "all" || searchQuery) && 
              ` (${doctors.length} au total)`
            }
          </p>
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
