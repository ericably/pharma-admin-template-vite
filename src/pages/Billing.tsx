import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Calculator,
  CreditCard,
  FileText,
  User,
  Calendar,
  DollarSign,
  UserCheck,
  Search,
  Check,
  ChevronsUpDown
} from "lucide-react";
import PatientService, { Patient } from "@/api/services/PatientService";
import MedicationService, { Medication } from "@/api/services/MedicationService";
import DoctorService, { Doctor } from "@/api/services/DoctorService";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  itemId: string;
  selectedMedicationId: string;
  medicationName: string;
  onSelect: (medication: Medication) => void;
  availableMedications: Medication[];
}

const ProductSelector = ({ 
  itemId, 
  selectedMedicationId, 
  medicationName, 
  onSelect, 
  availableMedications 
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredMedications = availableMedications.filter(medication =>
    medication.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    medication.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (medication: Medication) => {
    onSelect(medication);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left h-7 text-xs"
        >
          {medicationName || "Rechercher un produit..."}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Rechercher un médicament..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
            <CommandGroup>
              {filteredMedications.map((medication) => (
                <CommandItem
                  key={medication.id}
                  value={medication.name}
                  onSelect={() => handleSelect(medication)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMedicationId === medication.id?.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{medication.name}</span>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Stock: {medication.stock}</span>
                      <span className="font-medium">{medication.price}€</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface BillingItem {
  id: string;
  medicationId: string;
  medicationName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface BillingData {
  patient: string;
  patientId: string;
  doctor: string;
  doctorId: string;
  items: BillingItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes: string;
  date: string;
}

export default function Billing() {
  const [billingData, setBillingData] = useState<BillingData>({
    patient: "",
    patientId: "",
    doctor: "",
    doctorId: "",
    items: [{
      id: "1",
      medicationId: "",
      medicationName: "",
      unitPrice: 0,
      quantity: 1,
      total: 0
    }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: "cash",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
  const [openDoctorCombobox, setOpenDoctorCombobox] = useState(false);
  const [searchPatient, setSearchPatient] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");

  const { toast } = useToast();

  // Fetch patients
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.getAllPatients()
  });

  // Fetch medications
  const { data: medicationsData } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationService.getAllMedications()
  });

  // Fetch doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => DoctorService.getAllDoctors()
  });

  const patients = patientsData?.items || [];
  const medications = medicationsData?.items || [];
  const doctors = doctorsData?.items || [];
  const activePatients = patients.filter(patient => patient.status === true);
  const activeDoctors = doctors.filter(doctor => doctor.status === true);
  const availableMedications = medications.filter(medication => 
    medication.status === 'Actif' && medication.stock > 0
  );

  // Filter for search
  const filteredPatients = activePatients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const filteredDoctors = activeDoctors.filter(doctor =>
    doctor.lastName.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    doctor.speciality.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = billingData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - billingData.discount;

    setBillingData(prev => ({
      ...prev,
      subtotal,
      tax,
      total: Math.max(0, total)
    }));
  }, [billingData.items, billingData.discount]);

  const addItem = () => {
    const newItem: BillingItem = {
      id: Date.now().toString(),
      medicationId: "",
      medicationName: "",
      unitPrice: 0,
      quantity: 1,
      total: 0
    };

    setBillingData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setBillingData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof BillingItem, value: any) => {
    setBillingData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // If medication changed, update name and price
          if (field === 'medicationId') {
            const medication = availableMedications.find(m => m.id?.toString() === value);
            if (medication) {
              updatedItem.medicationName = medication.name;
              updatedItem.unitPrice = medication.price;
            }
          }
          
          // Recalculate total
          updatedItem.total = updatedItem.unitPrice * updatedItem.quantity;
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleMedicationSelect = (itemId: string, medication: Medication) => {
    updateItem(itemId, 'medicationId', medication.id?.toString() || "");
  };

  const handlePatientSelect = (patient: Patient) => {
    setBillingData(prev => ({
      ...prev,
      patientId: patient.id?.toString() || "",
      patient: patient.lastName
    }));
    setOpenPatientCombobox(false);
    setSearchPatient("");
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setBillingData(prev => ({
      ...prev,
      doctorId: doctor.id?.toString() || "",
      doctor: doctor.lastName
    }));
    setOpenDoctorCombobox(false);
    setSearchDoctor("");
  };

  const handleProcessPayment = () => {
    if (!billingData.patientId) {
      toast({
        title: "Patient requis",
        description: "Veuillez sélectionner un patient.",
        variant: "destructive",
      });
      return;
    }

    if (billingData.items.length === 0) {
      toast({
        title: "Articles requis",
        description: "Veuillez ajouter au moins un article à la facture.",
        variant: "destructive",
      });
      return;
    }

    // Simulate payment processing
    toast({
      title: "Paiement traité",
      description: `Facture de ${billingData.total.toFixed(2)} € payée par ${billingData.paymentMethod === 'cash' ? 'espèces' : 'carte'}.`,
    });

    // Reset form
    setBillingData({
      patient: "",
      patientId: "",
      doctor: "",
      doctorId: "",
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethod: "cash",
      notes: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const selectedPatient = activePatients.find(p => p.id === billingData.patientId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-4 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
                <p className="text-emerald-100 text-sm">Gestion des ventes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-100 text-xs">Facture #{Date.now().toString().slice(-6)}</div>
              <div className="text-xl font-bold">{billingData.total.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Panel - Billing Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Informations Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-sm">Patient</Label>
                  <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPatientCombobox}
                        className="w-full justify-between h-8 text-sm"
                      >
                        {billingData.patient || "Rechercher un patient..."}
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Rechercher un patient..."
                          value={searchPatient}
                          onValueChange={setSearchPatient}
                        />
                        <CommandList>
                          <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                          <CommandGroup>
                            {filteredPatients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={patient.fullName}
                                onSelect={() => handlePatientSelect(patient)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    billingData.patientId === patient.id?.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{patient.fullName}</span>
                                  <span className="text-sm text-muted-foreground">{patient.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm">Date</Label>
                  <Input
                    type="date"
                    value={billingData.date}
                    onChange={(e) => setBillingData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-8"
                  />
                </div>
              </div>
              
              {selectedPatient && (
                <div className="p-2 bg-muted rounded-md">
                  <div className="grid gap-1 md:grid-cols-2 text-xs">
                    <div>
                      <span className="font-medium">Email:</span> {selectedPatient.email}
                    </div>
                    <div>
                      <span className="font-medium">Téléphone:</span> {selectedPatient.phone}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Adresse:</span> {selectedPatient.address}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-4 w-4" />
                Informations Docteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Docteur prescripteur</Label>
                <Popover open={openDoctorCombobox} onOpenChange={setOpenDoctorCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDoctorCombobox}
                      className="w-full justify-between h-8 text-sm"
                    >
                      {billingData.doctor || "Rechercher un docteur..."}
                      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher un docteur..."
                        value={searchDoctor}
                        onValueChange={setSearchDoctor}
                      />
                      <CommandList>
                        <CommandEmpty>Aucun docteur trouvé.</CommandEmpty>
                        <CommandGroup>
                          {filteredDoctors.map((doctor) => (
                            <CommandItem
                              key={doctor.id}
                              value={doctor.lastName}
                              onSelect={() => handleDoctorSelect(doctor)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  billingData.doctorId === doctor.id?.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
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
              
              {billingData.doctorId && (
                <div className="p-2 bg-muted rounded-md">
                  {(() => {
                    const selectedDoctor = activeDoctors.find(d => d.id?.toString() === billingData.doctorId);
                    return selectedDoctor ? (
                      <div className="grid gap-1 md:grid-cols-2 text-xs">
                        <div>
                          <span className="font-medium">Email:</span> {selectedDoctor.email}
                        </div>
                        <div>
                          <span className="font-medium">Téléphone:</span> {selectedDoctor.phone}
                        </div>
                        <div>
                          <span className="font-medium">Spécialité:</span> {selectedDoctor.speciality}
                        </div>
                        <div>
                          <span className="font-medium">N° Licence:</span> {selectedDoctor.licenseNumber}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Articles
                </CardTitle>
                <Button onClick={addItem} size="sm" className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[40%] h-8">Désignation</TableHead>
                      <TableHead className="w-[15%] h-8">Prix unitaire</TableHead>
                      <TableHead className="w-[15%] h-8">Quantité</TableHead>
                      <TableHead className="w-[15%] h-8">Total</TableHead>
                      <TableHead className="w-[15%] h-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.items.map((item) => (
                      <TableRow key={item.id} className="text-sm">
                        <TableCell className="p-2">
                          <ProductSelector
                            itemId={item.id}
                            selectedMedicationId={item.medicationId}
                            medicationName={item.medicationName}
                            onSelect={(medication) => handleMedicationSelect(item.id, medication)}
                            availableMedications={availableMedications}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="font-medium text-xs">
                            {item.total.toFixed(2)} €
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notes supplémentaires..."
                value={billingData.notes}
                onChange={(e) => setBillingData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[60px] text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Summary & Payment */}
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Résumé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{billingData.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (10%):</span>
                  <span>{billingData.tax.toFixed(2)} €</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Remise:</span>
                    <span>{billingData.discount.toFixed(2)} €</span>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Montant de la remise"
                    value={billingData.discount || ""}
                    onChange={(e) => setBillingData(prev => ({ 
                      ...prev, 
                      discount: parseFloat(e.target.value) || 0 
                    }))}
                    className="h-7 text-xs"
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total:</span>
                  <span>{billingData.total.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Mode de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={billingData.paymentMethod} 
                onValueChange={(value) => setBillingData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleProcessPayment}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-8 text-sm"
            >
              <DollarSign className="h-4 w-4" />
              Traiter le paiement
            </Button>
            
            <Button variant="outline" className="w-full h-8 text-sm">
              Imprimer facture
            </Button>
            
            <Button variant="ghost" className="w-full h-8 text-sm">
              Sauvegarder brouillon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}