import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Download, Stethoscope, UserCheck, UserX, Filter } from "lucide-react";
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

  const activeDoctors = doctors.filter(d => d.status).length;
  const inactiveDoctors = doctors.filter(d => !d.status).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-4 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gestion des Médecins</h1>
                  <p className="text-indigo-100 text-sm mt-1">Gérez vos médecins partenaires</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-indigo-100 text-xs">Total Médecins</div>
              <div className="text-xl font-bold">{doctors.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Stethoscope className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{doctors.length}</div>
            <p className="text-emerald-100">Médecins enregistrés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserCheck className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Actifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{activeDoctors}</div>
            <p className="text-emerald-100">Médecins actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserX className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Inactifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{inactiveDoctors}</div>
            <p className="text-emerald-100">Médecins inactifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Liste des Médecins</CardTitle>
              <CardDescription className="text-gray-600">Recherchez et gérez vos médecins partenaires</CardDescription>
            </div>
            <Button 
              onClick={handleOpenDialog}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau Médecin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <DoctorsList 
              doctors={filteredDoctors}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={async (doctor, updates) => {
                try {
                  await DoctorService.updateDoctor(doctor.id, updates);
                  await refetch();
                  toast({
                    title: "Succès",
                    description: "Médecin mis à jour avec succès",
                  });
                } catch (error) {
                  toast({
                    title: "Erreur",
                    description: "Erreur lors de la mise à jour du médecin",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        </CardContent>
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
