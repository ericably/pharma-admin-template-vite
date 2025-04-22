import { useState } from "react";
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
  Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PrescriptionService } from "@/services/prescription";

// Sample data
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
  const { toast } = useToast();

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const prescription = {
      patient: formData.get("patient"),
      medication: formData.get("medication"),
      dosage: formData.get("dosage"),
      quantity: Number(formData.get("quantity")),
      doctor: formData.get("doctor"),
      instructions: formData.get("instructions"),
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'ordonnance.",
        variant: "destructive",
      });
    }
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
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john-smith">John Smith</SelectItem>
                          <SelectItem value="mary-johnson">Mary Johnson</SelectItem>
                          <SelectItem value="robert-brown">Robert Brown</SelectItem>
                          <SelectItem value="jennifer-williams">Jennifer Williams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="medication" className="text-right">
                        Medication
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amoxicillin-500mg">Amoxicillin 500mg</SelectItem>
                          <SelectItem value="lisinopril-10mg">Lisinopril 10mg</SelectItem>
                          <SelectItem value="atorvastatin-20mg">Atorvastatin 20mg</SelectItem>
                          <SelectItem value="metformin-1000mg">Metformin 1000mg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dosage" className="text-right">
                        Dosage
                      </Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 1 tablet 3x daily"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="doctor" className="text-right">
                        Doctor
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr-howard-lee">Dr. Howard Lee</SelectItem>
                          <SelectItem value="dr-sarah-chen">Dr. Sarah Chen</SelectItem>
                          <SelectItem value="dr-james-wilson">Dr. James Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="instructions" className="text-right">
                        Instructions
                      </Label>
                      <Input
                        id="instructions"
                        placeholder="Additional instructions"
                        className="col-span-3"
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
