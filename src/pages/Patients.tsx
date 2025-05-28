
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
import PatientService, { Patient } from "@/api/services/PatientService";
import { useQuery } from "@tanstack/react-query";
import { PatientsList } from "@/components/patients/PatientsList";
import PatientDetails from "@/components/patients/PatientDetails";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsMode, setDetailsMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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

  const handleCreatePatient = async (data: Omit<Patient, '@id' | 'id'>) => {
    try {
      await PatientService.createPatient(data);
      
      toast({
        title: "Succès",
        description: "Le patient a été ajouté avec succès.",
        variant: "default",
      });
      
      setIsDetailsOpen(false);
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
      
      setIsDetailsOpen(false);
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

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsMode("edit");
    setIsDetailsOpen(true);
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

  const handleOpenDialog = () => {
    setSelectedPatient(null);
    setDetailsMode("edit");
    setIsDetailsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailsOpen(false);
    setSelectedPatient(null);
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Patients</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations des patients, leurs ordonnances et leur historique médical.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un patient..."
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
            <Button variant="outline" onClick={handleExportPatients}>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter Patient
            </Button>
          </div>
        </div>

        <PatientsList
          patients={filteredPatients}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onView={handleViewPatient}
        />
        
        <div className="mt-4 text-sm text-muted-foreground">
          Affichage de {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
          {currentFilter !== "all" && (
            <>
              {' '}• Filtre: {currentFilter === "active" ? "Actifs" : currentFilter === "inactive" ? "Inactifs" : "Avec Assurance"}
            </>
          )}
        </div>
      </Card>

      <PatientDetails 
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={handleCloseDialog}
        onUpdate={handlePatientUpdate}
        mode={detailsMode}
      />
    </div>
  );
}
