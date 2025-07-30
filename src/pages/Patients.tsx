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
  FileDown,
  Users,
  UserCheck,
  UserX,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PatientService, { Patient } from "@/api/services/PatientService";
import { useQuery } from "@tanstack/react-query";
import { PatientsList } from "@/components/patients/PatientsList";
import { PatientForm } from "@/components/patients/PatientForm";
import { PrescriptionCreateForm } from "@/components/prescriptions/PrescriptionCreateForm";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState<Patient | null>(null);
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: patientsData, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.getAllPatients()
  });

  const patients = patientsData?.items || [];
  
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.id && patient.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (currentFilter) {
      case "active":
        return patient.status === "Actif";
      case "inactive":
        return patient.status === "Inactif";
      case "insurance":
        return patient.insurance !== undefined && patient.insurance !== "";
      case "all":
      default:
        return true;
    }
  });

  const activePatients = patients.filter(p => p.status === "Actif").length;
  const inactivePatients = patients.filter(p => p.status === "Inactif").length;
  const insuredPatients = patients.filter(p => p.insurance !== undefined && p.insurance !== "").length;

  const handleCreatePatient = async (data: Omit<Patient, '@id' | 'id'>) => {
    try {
      await PatientService.createPatient(data);
      
      toast({
        title: "Succès",
        description: "Le patient a été ajouté avec succès.",
        variant: "default",
      });
      
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating patient:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du patient.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePatient = async (data: Omit<Patient, '@id' | 'id'>) => {
    if (!selectedPatient?.id) return;
    
    try {
      await PatientService.updatePatient(selectedPatient.id, data);
      
      toast({
        title: "Succès",
        description: "Le patient a été modifié avec succès.",
        variant: "default",
      });
      
      setIsFormOpen(false);
      setSelectedPatient(null);
      refetch();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du patient.",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!patient.id) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      try {
        await PatientService.deletePatient(patient.id);
        
        toast({
          title: "Succès",
          description: "Le patient a été supprimé avec succès.",
          variant: "default",
        });
        
        refetch();
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du patient.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportPatients = () => {
    try {
      const headers = ["ID", "Nom", "Email", "Téléphone", "Date de Naissance", "Adresse", "Assurance", "Statut"];
      const csvRows = [headers];
      
      filteredPatients.forEach(patient => {
        const row = [
          patient.id?.toString() || '',
          patient.name,
          patient.email,
          patient.phone,
          patient.dob,
          patient.address || '',
          patient.insurance || '',
          patient.status
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
      link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: `${filteredPatients.length} patients exportés avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting patients:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur s'est produite lors de l'exportation des patients.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    
    const filterLabels: {[key: string]: string} = {
      "all": "Tous les Patients",
      "active": "Patients Actifs",
      "inactive": "Patients Inactifs",
      "insurance": "Patients avec Assurance"
    };
    
    toast({
      title: "Filtre Appliqué",
      description: `Affichage : ${filterLabels[filter]}.`,
      variant: "default",
    });
  };

  const handleCreatePrescription = (patient: Patient) => {
    setSelectedPatientForPrescription(patient);
    setIsPrescriptionFormOpen(true);
  };

  const handlePrescriptionSuccess = () => {
    toast({
      title: "Succès",
      description: "L'ordonnance a été créée et associée au patient.",
      variant: "default",
    });
  };

  const handleOpenForm = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPatient(null);
  };

  const handleFormSubmit = selectedPatient ? handleUpdatePatient : handleCreatePatient;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-800 p-4 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gestion des Patients</h1>
                  <p className="text-teal-100 text-sm mt-1">Gérez les informations et l'historique médical</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-teal-100 text-xs">Total Patients</div>
              <div className="text-xl font-bold">{patients.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mb-1">{patients.length}</div>
            <p className="text-emerald-100 text-xs">Patients enregistrés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserCheck className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Actifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{activePatients}</div>
            <p className="text-blue-100">Patients actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserX className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Inactifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{inactivePatients}</div>
            <p className="text-orange-100">Patients inactifs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Assurance</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{insuredPatients}</div>
            <p className="text-purple-100">Avec assurance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Liste des Patients</CardTitle>
              <CardDescription className="text-gray-600">Recherchez et gérez vos patients</CardDescription>
            </div>
            <Button 
              onClick={handleOpenForm}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Ajouter Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Rechercher un patient..."
                className="pl-10 bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex bg-white/70 border-gray-200 hover:bg-white hover:border-teal-500">
                    Filtrer
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                    Tous les Patients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                    Patients Actifs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                    Patients Inactifs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("insurance")}>
                    Par Assurance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleExportPatients} className="bg-white/70 border-gray-200 hover:bg-white hover:border-teal-500">
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <PatientsList
              patients={filteredPatients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onView={() => {}} // Simplified for now
              onCreatePrescription={handleCreatePrescription}
              onUpdate={async (patient, updates) => {
                try {
                  await PatientService.updatePatient(patient.id, updates);
                  await refetch();
                  toast({
                    title: "Succès",
                    description: "Patient mis à jour avec succès",
                  });
                } catch (error) {
                  toast({
                    title: "Erreur",
                    description: "Erreur lors de la mise à jour du patient",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Affichage de {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
            {currentFilter !== "all" && (
              <>
                {' '}• Filtre: {currentFilter === "active" ? "Actifs" : currentFilter === "inactive" ? "Inactifs" : "Avec Assurance"}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <PatientForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={selectedPatient || undefined}
      />

      {selectedPatientForPrescription && (
        <PrescriptionCreateForm
          isOpen={isPrescriptionFormOpen}
          onClose={() => {
            setIsPrescriptionFormOpen(false);
            setSelectedPatientForPrescription(null);
          }}
          patient={selectedPatientForPrescription}
          onSuccess={handlePrescriptionSuccess}
        />
      )}
    </div>
  );
}
