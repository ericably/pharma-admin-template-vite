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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useQuery } from "@tanstack/react-query";
import PrescriptionService from "@/api/services/PrescriptionService";
import PatientService, { Patient } from "@/api/services/PatientService";
import MedicationService, { Medication } from "@/api/services/MedicationService";
import { cn } from "@/lib/utils";

const prescriptions = [
  { 
    id: "RX-0001", 
    patient: "John Smith", 
    medication: "Amoxicillin 500mg",
    dosage: "1 tablet 3x daily",
    quantity: 30,
    doctor: "Dr. Howard Lee",
    date: "2023-05-15",
    status: "Pending" 
  },
  { 
    id: "RX-0002", 
    patient: "Mary Johnson", 
    medication: "Lisinopril 10mg",
    dosage: "1 tablet daily",
    quantity: 30,
    doctor: "Dr. Sarah Chen",
    date: "2023-05-14",
    status: "Filled" 
  },
  { 
    id: "RX-0003", 
    patient: "Robert Brown", 
    medication: "Atorvastatin 20mg",
    dosage: "1 tablet at bedtime",
    quantity: 30,
    doctor: "Dr. James Wilson",
    date: "2023-05-13",
    status: "Filled" 
  },
  { 
    id: "RX-0004", 
    patient: "Jennifer Williams", 
    medication: "Metformin 1000mg",
    dosage: "1 tablet 2x daily",
    quantity: 60,
    doctor: "Dr. Howard Lee",
    date: "2023-05-13",
    status: "Ready for Pickup" 
  },
  { 
    id: "RX-0005", 
    patient: "Michael Davis", 
    medication: "Sertraline 50mg",
    dosage: "1 tablet daily",
    quantity: 30,
    doctor: "Dr. Sarah Chen",
    date: "2023-05-12",
    status: "Ready for Pickup" 
  },
  { 
    id: "RX-0006", 
    patient: "Sarah Miller", 
    medication: "Omeprazole 20mg",
    dosage: "1 capsule daily",
    quantity: 30,
    doctor: "Dr. James Wilson",
    date: "2023-05-12",
    status: "Delivered" 
  },
  { 
    id: "RX-0007", 
    patient: "James Wilson", 
    medication: "Ibuprofen 400mg",
    dosage: "1 tablet every 6 hours as needed",
    quantity: 40,
    doctor: "Dr. Howard Lee",
    date: "2023-05-11",
    status: "Delivered" 
  }
];

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState("");
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
  
  const { toast } = useToast();

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

  const patients = patientsData?.items || [];
  const medications = medicationsData?.items || [];

  // Filter only active patients
  const activePatients = patients.filter(patient => patient.status === 'Actif');
  
  // Filter only active medications with stock > 0
  const availableMedications = medications.filter(medication => 
    medication.status === 'Actif' && medication.stock > 0
  );

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case "Filled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Filled</Badge>;
      case "Ready for Pickup":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Ready for Pickup</Badge>;
      case "Delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
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

    // Find selected patient and medication
    const selectedPatient = activePatients.find(p => p.id === formData.patient);
    const selectedMedication = availableMedications.find(m => m.id?.toString() === formData.medication);

    if (!selectedPatient || !selectedMedication) {
      toast({
        title: "Erreur",
        description: "Patient ou médicament introuvable.",
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
      doctor: formData.doctor,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, fill, and manage patient prescriptions.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prescriptions..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex">
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Prescriptions</DropdownMenuItem>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Filled</DropdownMenuItem>
                <DropdownMenuItem>Ready for Pickup</DropdownMenuItem>
                <DropdownMenuItem>Delivered</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
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
                      <Select 
                        value={formData.doctor} 
                        onValueChange={(value) => handleInputChange('doctor', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner un médecin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. Howard Lee">Dr. Howard Lee</SelectItem>
                          <SelectItem value="Dr. Sarah Chen">Dr. Sarah Chen</SelectItem>
                          <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                        </SelectContent>
                      </Select>
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
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Filled
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MailOpen className="mr-2 h-4 w-4" />
                          Notify Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
