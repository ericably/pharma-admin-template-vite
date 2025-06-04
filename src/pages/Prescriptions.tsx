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
  ShoppingCart,
  FileText,
  Clock,
  Package
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    notes: ""
  });
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication: "", medicationId: "", dosage: "", quantity: 1, instructions: "" }
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
    const matchesSearch = prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.items.some(item => item.medication.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      !item.medicationId || !item.dosage || item.quantity <= 0
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
      patient: selectedPatient.name,
      patientId: selectedPatient.id || '',
      items: prescriptionItems,
      doctor: selectedDoctor.name,
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

  const updatePrescriptionStatus = async (prescriptionId: string, newStatus: Prescription['status']) => {
    try {
      await PrescriptionService.updatePrescriptionStatus(prescriptionId, newStatus);
      toast({
        title: "Statut mis à jour",
        description: `L'ordonnance a été marquée comme "${newStatus}".`,
      });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };

  const viewPrescriptionDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewDialogOpen(true);
  };

  const editPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    
    setFormData({
      patient: prescription.patientId,
      doctor: prescription.doctorId, // Use doctorId directly from prescription data
      notes: prescription.notes || ""
    });
    setPrescriptionItems(prescription.items);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!editingPrescription) return;

    try {
      const updatedData = {
        patientId: editingPrescription.patientId,
        doctorId: editingPrescription.doctorId, // Include doctorId in the data
        items: prescriptionItems,
        notes: formData.notes
      };

      console.log('Sending update data:', updatedData);

      await PrescriptionService.updatePrescription(
        editingPrescription.id || '', 
        updatedData
      );
      
      toast({
        title: "Ordonnance modifiée",
        description: "L'ordonnance a été mise à jour avec succès.",
      });
      setIsEditDialogOpen(false);
      setEditingPrescription(null);
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'ordonnance.",
        variant: "destructive",
      });
    }
  };

  const printPrescription = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordonnance ${prescription.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              .medications { margin-top: 20px; }
              .medication { margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Ordonnance</h1>
              <p>ID: ${prescription.id}</p>
            </div>
            <div class="info">
              <p><strong>Patient:</strong> ${prescription.patient}</p>
              <p><strong>Médecin:</strong> ${prescription.doctor}</p>
              <p><strong>Date:</strong> ${prescription.date}</p>
            </div>
            <div class="medications">
              <h3>Médicaments prescrits:</h3>
              ${prescription.items.map(item => `
                <div class="medication">
                  <p><strong>${item.medication}</strong></p>
                  <p>Posologie: ${item.dosage}</p>
                  <p>Quantité: ${item.quantity}</p>
                  ${item.instructions ? `<p>Instructions: ${item.instructions}</p>` : ''}
                </div>
              `).join('')}
            </div>
            ${prescription.notes ? `<div><h3>Notes:</h3><p>${prescription.notes}</p></div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const notifyPatient = (prescription: Prescription) => {
    toast({
      title: "Notification envoyée",
      description: `Le patient ${prescription.patient} a été notifié par email.`,
    });
  };

  const getSelectedPatientName = () => {
    const patient = activePatients.find(p => p.id === formData.patient);
    return patient ? `${patient.name} - ${patient.email}` : "Sélectionner un patient";
  };

  const getSelectedDoctorName = () => {
    const doctor = activeDoctors.find(d => d.id?.toString() === formData.doctor);
    return doctor ? `${doctor.name} - ${doctor.speciality}` : "Sélectionner un médecin";
  };

  const pendingCount = prescriptions.filter(p => p.status === "En attente").length;
  const preparedCount = prescriptions.filter(p => p.status === "Préparé").length;
  const readyCount = prescriptions.filter(p => p.status === "Prêt pour retrait").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestion des Ordonnances</h1>
                  <p className="text-purple-100 text-lg mt-1">Créer, préparer et gérer les ordonnances</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-purple-100 text-sm">Total Ordonnances</div>
              <div className="text-3xl font-bold">{prescriptions.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{prescriptions.length}</div>
            <p className="text-emerald-100">Ordonnances</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">En attente</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{pendingCount}</div>
            <p className="text-orange-100">En attente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Check className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Préparé</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{preparedCount}</div>
            <p className="text-blue-100">Préparées</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Prêtes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{readyCount}</div>
            <p className="text-purple-100">Prêtes retrait</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Gestion des Ordonnances</CardTitle>
              <CardDescription className="text-gray-600">
                Créer, préparer et gérer les ordonnances des patients
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
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
        </CardHeader>
        <CardContent>
          {/* ... keep existing code (search and filters) */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                      <TableCell>{prescription.patient}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prescription.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{item.medication}</span>
                              <br />
                              <span className="text-muted-foreground">
                                {item.dosage} - Qté: {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => viewPrescriptionDetails(prescription)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editPrescription(prescription)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePrescriptionStatus(prescription.id || '', 'Préparé')}>
                              <Check className="mr-2 h-4 w-4" />
                              Marquer comme préparé
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => convertToOrder(prescription.id || '')}>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Convertir en commande
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => printPrescription(prescription)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => notifyPatient(prescription)}>
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
        </CardContent>
      </Card>

      {/* View Prescription Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'ordonnance {selectedPrescription?.id}</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Patient:</Label>
                  <p>{selectedPrescription.patient}</p>
                </div>
                <div>
                  <Label className="font-medium">Médecin:</Label>
                  <p>{selectedPrescription.doctor}</p>
                </div>
                <div>
                  <Label className="font-medium">Date:</Label>
                  <p>{selectedPrescription.date}</p>
                </div>
                <div>
                  <Label className="font-medium">Statut:</Label>
                  <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                </div>
              </div>
              <div>
                <Label className="font-medium">Médicaments:</Label>
                <div className="space-y-2 mt-2">
                  {selectedPrescription.items.map((item, index) => (
                    <div key={index} className="border rounded p-3">
                      <p className="font-medium">{item.medication}</p>
                      <p className="text-sm text-muted-foreground">Posologie: {item.dosage}</p>
                      <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                      {item.instructions && (
                        <p className="text-sm text-muted-foreground">Instructions: {item.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {selectedPrescription.notes && (
                <div>
                  <Label className="font-medium">Notes:</Label>
                  <p className="mt-1">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Prescription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'ordonnance {editingPrescription?.id}</DialogTitle>
            <DialogDescription>
              Modifier les médicaments et notes de l'ordonnance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient (non modifiable)</Label>
                  <Input value={editingPrescription?.patient || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Médecin (non modifiable)</Label>
                  <Input value={editingPrescription?.doctor || ''} disabled />
                </div>
              </div>

              <PrescriptionItemsForm
                items={prescriptionItems}
                medications={availableMedications}
                onItemsChange={setPrescriptionItems}
              />

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  placeholder="Notes supplémentaires"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Sauvegarder les modifications</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
