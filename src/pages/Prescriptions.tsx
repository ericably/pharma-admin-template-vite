
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
  Check,
  MailOpen,
  Printer,
  Eye,
  ChevronsUpDown,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PrescriptionService, { Prescription } from "@/api/services/PrescriptionService";
import PatientService, { Patient } from "@/api/services/PatientService";
import MedicationService, { Medication } from "@/api/services/MedicationService";
import DoctorService, { Doctor } from "@/api/services/DoctorService";
import { cn } from "@/lib/utils";

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    medication: "",
    dosage: "",
    quantity: "",
    doctor: "",
    instructions: ""
  });
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
  const [openMedicationCombobox, setOpenMedicationCombobox] = useState(false);
  const [openDoctorCombobox, setOpenDoctorCombobox] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prescriptions from database
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => PrescriptionService.getAllPrescriptions()
  });

  // Fetch patients from database
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.getAllPatients()
  });

  // Fetch medications from database
  const { data: medicationsData } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationService.getAllMedications()
  });

  // Fetch doctors from database
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => DoctorService.getAllDoctors()
  });

  const prescriptions = prescriptionsData?.items || [];
  const patients = patientsData?.items || [];
  const medications = medicationsData?.items || [];
  const doctors = doctorsData?.items || [];

  // Filter only active patients
  const activePatients = patients.filter(patient => patient.status === 'Actif');
  
  // Filter only active medications with stock > 0
  const availableMedications = medications.filter(medication => 
    medication.status === 'Actif' && medication.stock > 0
  );

  // Filter only active doctors
  const activeDoctors = doctors.filter(doctor => doctor.status === true);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "En attente":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
      case "Préparé":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Préparé</Badge>;
      case "Prêt pour retrait":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Prêt pour retrait</Badge>;
      case "Livré":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Livré</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.patient || !formData.medication || !formData.dosage || !formData.quantity || !formData.doctor) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Find selected patient, medication and doctor
    const selectedPatient = activePatients.find(p => p.id === formData.patient);
    const selectedMedication = availableMedications.find(m => m.id?.toString() === formData.medication);
    const selectedDoctor = activeDoctors.find(d => d.id?.toString() === formData.doctor);

    if (!selectedPatient || !selectedMedication || !selectedDoctor) {
      toast({
        title: "Erreur",
        description: "Patient, médicament ou médecin introuvable.",
        variant: "destructive",
      });
      return;
    }

    const prescription = {
      patient: selectedPatient.name,
      patientId: selectedPatient.id || '',
      medication: `${selectedMedication.name} ${selectedMedication.dosage}`,
      medicationId: selectedMedication.id?.toString() || '',
      dosage: formData.dosage,
      quantity: Number(formData.quantity),
      doctor: selectedDoctor.name,
      instructions: formData.instructions,
      date: new Date().toISOString().split('T')[0],
      status: "En attente" as const
    };

    try {
      const response = await PrescriptionService.createPrescription(prescription);
      toast({
        title: "Ordonnance créée",
        description: "L'ordonnance a été créée avec succès.",
      });
      setIsDialogOpen(false);
      setFormData({
        patient: "",
        medication: "",
        dosage: "",
        quantity: "",
        doctor: "",
        instructions: ""
      });
      // Refresh the prescriptions list
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'ordonnance.",
        variant: "destructive",
      });
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="ml-1">Rupture</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 ml-1">Stock Faible ({stock})</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-1">En Stock ({stock})</Badge>;
    }
  };

  const getSelectedPatientName = () => {
    const patient = activePatients.find(p => p.id === formData.patient);
    return patient ? `${patient.name} - ${patient.email}` : "Sélectionner un patient";
  };

  const getSelectedMedicationName = () => {
    const medication = availableMedications.find(m => m.id?.toString() === formData.medication);
    return medication ? `${medication.name} ${medication.dosage}` : "Sélectionner un médicament";
  };

  const getSelectedDoctorName = () => {
    const doctor = activeDoctors.find(d => d.id?.toString() === formData.doctor);
    return doctor ? `${doctor.name} - ${doctor.speciality}` : "Sélectionner un médecin";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Ordonnances</h1>
        <p className="text-muted-foreground mt-2">
          Créer, préparer et gérer les ordonnances des patients.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des ordonnances..."
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
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Toutes les ordonnances
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("En attente")}>
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Préparé")}>
                  Préparé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Prêt pour retrait")}>
                  Prêt pour retrait
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Livré")}>
                  Livré
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Ordonnance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une Nouvelle Ordonnance</DialogTitle>
                  <DialogDescription>
                    Créer une nouvelle ordonnance pour un patient.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patient" className="text-right">
                        Patient
                      </Label>
                      <div className="col-span-3">
                        <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPatientCombobox}
                              className="w-full justify-between"
                            >
                              {getSelectedPatientName()}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un patient..." />
                              <CommandList>
                                <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                                <CommandGroup>
                                  {activePatients.map((patient) => (
                                    <CommandItem
                                      key={patient.id}
                                      value={`${patient.name} ${patient.email}`}
                                      onSelect={() => {
                                        handleInputChange('patient', patient.id || '');
                                        setOpenPatientCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.patient === patient.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {patient.name} - {patient.email}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="medication" className="text-right">
                        Médicament
                      </Label>
                      <div className="col-span-3">
                        <Popover open={openMedicationCombobox} onOpenChange={setOpenMedicationCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openMedicationCombobox}
                              className="w-full justify-between"
                            >
                              {getSelectedMedicationName()}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un médicament..." />
                              <CommandList>
                                <CommandEmpty>Aucun médicament trouvé.</CommandEmpty>
                                <CommandGroup>
                                  {availableMedications.map((medication) => (
                                    <CommandItem
                                      key={medication.id}
                                      value={`${medication.name} ${medication.dosage}`}
                                      onSelect={() => {
                                        handleInputChange('medication', medication.id?.toString() || '');
                                        setOpenMedicationCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.medication === medication.id?.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex items-center justify-between w-full">
                                        <span>{medication.name} {medication.dosage}</span>
                                        {getStockBadge(medication.stock)}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dosage" className="text-right">
                        Posologie
                      </Label>
                      <Input
                        id="dosage"
                        name="dosage"
                        placeholder="ex: 1 comprimé 3x par jour"
                        className="col-span-3"
                        value={formData.dosage}
                        onChange={(e) => handleInputChange('dosage', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantité
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        className="col-span-3"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="doctor" className="text-right">
                        Médecin
                      </Label>
                      <div className="col-span-3">
                        <Popover open={openDoctorCombobox} onOpenChange={setOpenDoctorCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDoctorCombobox}
                              className="w-full justify-between"
                            >
                              {getSelectedDoctorName()}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un médecin..." />
                              <CommandList>
                                <CommandEmpty>Aucun médecin trouvé.</CommandEmpty>
                                <CommandGroup>
                                  {activeDoctors.map((doctor) => (
                                    <CommandItem
                                      key={doctor.id}
                                      value={`${doctor.name} ${doctor.speciality}`}
                                      onSelect={() => {
                                        handleInputChange('doctor', doctor.id?.toString() || '');
                                        setOpenDoctorCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.doctor === doctor.id?.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">{doctor.name}</span>
                                        <span className="text-sm text-muted-foreground">{doctor.speciality}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="instructions" className="text-right">
                        Instructions
                      </Label>
                      <Input
                        id="instructions"
                        name="instructions"
                        placeholder="Instructions supplémentaires"
                        className="col-span-3"
                        value={formData.instructions}
                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Créer l'Ordonnance</Button>
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
                <TableHead>Patient</TableHead>
                <TableHead>Médicament</TableHead>
                <TableHead>Posologie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptionsLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Chargement des ordonnances...
                  </TableCell>
                </TableRow>
              ) : filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Aucune ordonnance trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">{prescription.id}</TableCell>
                    <TableCell>{prescription.patient}</TableCell>
                    <TableCell>{prescription.medication}</TableCell>
                    <TableCell>{prescription.dosage}</TableCell>
                    <TableCell>{prescription.quantity}</TableCell>
                    <TableCell>{prescription.doctor}</TableCell>
                    <TableCell>{prescription.date}</TableCell>
                    <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4" />
                            Marquer comme préparé
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MailOpen className="mr-2 h-4 w-4" />
                            Notifier le patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
