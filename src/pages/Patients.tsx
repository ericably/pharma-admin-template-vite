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
import PatientService, { Patient } from "@/api/services/PatientService";
import PatientDetails from "@/components/patients/PatientDetails";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await PatientService.getAllPatients();

        if (response.items && Array.isArray(response.items)) {
          setPatients(response.items);
        } else {
          console.error('Unexpected response format:', response);
          toast({
            title: "Error",
            description: "Data format from API is unexpected.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);


  // New state for patient details viewing/editing
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsMode, setDetailsMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      insurance: "",
    }
  });

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.id && patient.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (currentFilter) {
      case "active":
        return patient.status.toLowerCase() === "active";
      case "inactive":
        return patient.status.toLowerCase() === "inactive";
      case "insurance":
        return patient.insurance !== undefined && patient.insurance !== "";
      case "all":
      default:
        return true;
    }
  });
  
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreatePatient = async (data: any) => {
    setIsLoading(true);
    try {
      // Create new patient with "Active" status
      const newPatient: Omit<Patient, '@id' | 'id'> = {
        ...data,
        status: "Active"
      };
      console.log('newPatient', newPatient);

      const createdPatient = await PatientService.createPatient(newPatient);
      
      // Add the new patient to the local state
      setPatients(prevPatients => [createdPatient, ...prevPatients]);
      
      toast({
        title: "Succès",
        description: "Le patient a été ajouté avec succès.",
        variant: "default",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du patient.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPatients = () => {
    try {
      const headers = ["ID", "Nom", "Email", "Phone", "Naissance", "Adresse", "Assurance", "Status"];
      const csvRows = [headers];
      console.log(filteredPatients)

      filteredPatients.forEach(patient => {
        const row = [
          patient.id || '',
          patient.name,
          patient.email,
          patient.phone,
        //  patient.birthdate || '',
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

  /*
  const handleDeletePatient = async (id: string) => {
    setIsLoading(true);
    try {
      await PatientService.deletePatient(id);
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
      toast({
        title: "Succès",
        description: "Le patient a été supprimé avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du patient.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
   */

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

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatients(prevPatients =>
      prevPatients.map(p =>
        p.id === updatedPatient.id ? updatedPatient : p
      )
    );
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      try {
        await PatientService.deletePatient(id);
        setPatients(prevPatients => prevPatients.filter(p => p.id !== id));

        toast({
          title: "Succès",
          description: "Le patient a été supprimé avec succès.",
          variant: "default",
        });
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

  /*
  const handleExportPatients = () => {
    try {
      const headers = ["ID", "Name", "Email", "Phone", "Date of Birth", "Address", "Insurance", "Status"];
      const csvRows = [headers];

      filteredPatients.forEach(patient => {
        const row = [
          patient.id || '',
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
  */

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);

    const filterLabels: {[key: string]: string} = {
      "all": "Tous les patients",
      "active": "Patients actifs",
      "inactive": "Patients inactifs",
      "insurance": "Patients avec une assurance"
    };

    toast({
      title: "Filtre appliqué",
      description: `Voir ${filterLabels[filter]}.`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des patients</h1>
        <p className="text-muted-foreground mt-2">
          Visualiser et gérer les informations sur les patients
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex">
                  Filtre
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                  Tous les patients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                  Patients actifs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                  Patients inactifs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("insurance")}>
                  Avec assurance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExportPatients}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Enter patient details to register them in the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreatePatient)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Patient's full name"
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
                        placeholder="patient@example.com"
                        className="col-span-3"
                        {...form.register("email", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        placeholder="555-123-4567"
                        className="col-span-3"
                        {...form.register("phone", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dob" className="text-right">
                        Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        className="col-span-3"
                        {...form.register("dob", { required: true })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        className="col-span-3"
                        {...form.register("address")}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="insurance" className="text-right">
                        Insurance
                      </Label>
                      <Input
                        id="insurance"
                        placeholder="Insurance provider"
                        className="col-span-3"
                        {...form.register("insurance")}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : "Register Patient"}
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.id}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.insurance}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {/* Add more actions as needed
                          <DropdownMenuItem>
                            <FilePlus className="mr-2 h-4 w-4" />
                            New Prescription
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          */}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeletePatient(patient.id || '')}
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
                    Pas de patients correspondants aux critères de recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Affichage {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
          {currentFilter !== "all" && (
            <>
              {' '}• Filter: {currentFilter === "active" ? "Actif" : currentFilter === "inactive" ? "Inactif" : "Avec assurance"}
            </>
          )}
        </div>
      </Card>

      {/* Patient Details Sheet */}
      <PatientDetails
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={handlePatientUpdate}
        mode={detailsMode}
      />
    </div>
  );
}
