
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
  ShoppingCart
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
import PrescriptionService, { Prescription, PrescriptionItem } from "@/api/services/PrescriptionService";
import PatientService, { Patient } from "@/api/services/PatientService";
import MedicationService, { Medication } from "@/api/services/MedicationService";
import DoctorService, { Doctor } from "@/api/services/DoctorService";
import PrescriptionItemsForm from "@/components/prescriptions/PrescriptionItemsForm";
import { cn } from "@/lib/utils";

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    notes: ""
  });
  // @ts-ignore
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication: "", medicationId: "", posology: "", quantity: 1, instructions: "" }
  ]);
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
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
    const matchesSearch = prescription.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.items.some(item => item.medication.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prescription.doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
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
    
    if (!formData.patient || !formData.doctor || prescriptionItems.length === 0) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un médicament.",
        variant: "destructive",
      });
      return;
    }

    // Validate all prescription items
    const invalidItems = prescriptionItems.filter(item => 
      !item.medicationId || !item.posology || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      toast({
        title: "Médicaments incomplets",
        description: "Veuillez compléter tous les médicaments (médicament, posologie, quantité).",
        variant: "destructive",
      });
      return;
    }

    // Find selected patient and doctor
    const selectedPatient = activePatients.find(p => p.id === formData.patient);
    const selectedDoctor = activeDoctors.find(d => d.id?.toString() === formData.doctor);

    if (!selectedPatient || !selectedDoctor) {
      toast({
        title: "Erreur",
        description: "Patient ou médecin introuvable.",
        variant: "destructive",
      });
      return;
    }

    const prescription = {
      patient: selectedPatient.lastName,
      patientId: selectedPatient.id || '',
      items: prescriptionItems,
      doctor: selectedDoctor.lastName,
      notes: formData.notes,
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
        doctor: "",
        notes: ""
      });
      setPrescriptionItems([
        { medication: "", medicationId: "", dosage: "", quantity: 1, instructions: "" }
      ]);
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

  const convertToOrder = async (prescriptionId: string) => {
    try {
      await PrescriptionService.convertToCustomerOrder(prescriptionId);
      toast({
        title: "Commande créée",
        description: "L'ordonnance a été convertie en commande avec succès.",
      });
      // Refresh the customer orders (if needed)
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la conversion en commande.",
        variant: "destructive",
      });
    }
  };

  const getSelectedPatientName = () => {
    const patient = activePatients.find(p => p.id === formData.patient);
    return patient ? `${patient.lastName} - ${patient.email}` : "Sélectionner un patient";
  };

  const getSelectedDoctorName = () => {
    const doctor = activeDoctors.find(d => d.id?.toString() === formData.doctor);
    return doctor ? `${doctor.lastName} - ${doctor.speciality}` : "Sélectionner un médecin";
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
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter une Nouvelle Ordonnance</DialogTitle>
                  <DialogDescription>
                    Créer une nouvelle ordonnance pour un patient avec plusieurs médicaments.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient">Patient</Label>
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
                                      value={`${patient.fullName} ${patient.email}`}
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
                                      {patient.fullName} - {patient.email}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doctor">Médecin</Label>
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
                                      value={`${doctor.lastName} ${doctor.speciality}`}
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
                                        <span className="font-medium">{doctor.lastName}</span>
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

                    <PrescriptionItemsForm
                      items={prescriptionItems}
                      medications={availableMedications}
                      onItemsChange={setPrescriptionItems}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        name="notes"
                        placeholder="Notes supplémentaires"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
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
                <TableHead>Médicaments</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptionsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Chargement des ordonnances...
                  </TableCell>
                </TableRow>
              ) : filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucune ordonnance trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">{prescription.id}</TableCell>
                    <TableCell>{prescription.patient.lastName} {prescription.patient.firstName}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prescription.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{item.medication.name}</span>
                            <br />
                            <span className="text-muted-foreground">
                              {item.posology} - Qté: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{prescription.doctor.lastName} {prescription.doctor.firstName}</TableCell>
                    <TableCell>{prescription.issuedDate }</TableCell>
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
                          <DropdownMenuItem onClick={() => convertToOrder(prescription.id || '')}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Convertir en commande
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
