
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
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  FileDown, 
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MedicationService, { Medication } from "@/api/services/MedicationService";

// Sample data
const sampleMedications = [
  { 
    id: 1, 
    name: "Amoxicillin", 
    category: "Antibiotic", 
    dosage: "500mg", 
    stock: 15,
    supplier: "Pharma Wholesale Inc.",
    price: 12.99,
    status: "Low Stock" 
  },
  { 
    id: 2, 
    name: "Lisinopril", 
    category: "Antihypertensive", 
    dosage: "10mg", 
    stock: 28,
    supplier: "MedSource Supply",
    price: 8.50,
    status: "Low Stock" 
  },
  { 
    id: 3, 
    name: "Atorvastatin", 
    category: "Statin", 
    dosage: "20mg", 
    stock: 32,
    supplier: "HealthMed Suppliers",
    price: 15.75,
    status: "Low Stock" 
  },
  { 
    id: 4, 
    name: "Metformin", 
    category: "Antidiabetic", 
    dosage: "1000mg", 
    stock: 65,
    supplier: "Pharma Wholesale Inc.",
    price: 9.25,
    status: "In Stock" 
  },
  { 
    id: 5, 
    name: "Omeprazole", 
    category: "Proton Pump Inhibitor", 
    dosage: "20mg", 
    stock: 78,
    supplier: "MedSource Supply",
    price: 7.99,
    status: "In Stock" 
  },
  { 
    id: 6, 
    name: "Sertraline", 
    category: "SSRI", 
    dosage: "50mg", 
    stock: 52,
    supplier: "HealthMed Suppliers",
    price: 11.50,
    status: "In Stock" 
  },
  { 
    id: 7, 
    name: "Ibuprofen", 
    category: "NSAID", 
    dosage: "400mg", 
    stock: 95,
    supplier: "Pharma Wholesale Inc.",
    price: 5.25,
    status: "In Stock" 
  },
  { 
    id: 8, 
    name: "Cetirizine", 
    category: "Antihistamine", 
    dosage: "10mg", 
    stock: 42,
    supplier: "MedSource Supply",
    price: 6.75,
    status: "In Stock" 
  }
];

export default function Inventory() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState(sampleMedications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    category: "",
    dosage: "",
    stock: 0,
    price: 0,
    supplier: "",
  });

  const filteredMedications = medications.filter(medication => 
    medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStockStatusBadge = (status: string) => {
    switch(status) {
      case "Low Stock":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Low Stock</Badge>;
      case "In Stock":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">In Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [id]: id === "stock" || id === "price" ? parseFloat(value) : value
    }));
  };

  const handleAddMedication = async () => {
    try {
      // Validate required fields
      if (!newMedication.name || !newMedication.category || !newMedication.dosage) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Determine status based on stock
      const status = newMedication.stock <= 20 ? "Low Stock" : "In Stock";

      // Create medication object
      const medicationToAdd = {
        ...newMedication,
        status,
      };

      // Call the service to create medication
      const response = await MedicationService.createMedication(medicationToAdd);
      
      // Update the local state with the new medication
      const nextId = Math.max(...medications.map(m => m.id as number)) + 1;
      const newMedicationWithId = {
        ...medicationToAdd,
        id: response.id || nextId,
      };
      
      setMedications([...medications, newMedicationWithId]);
      
      // Show success message
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
      
      // Reset form and close dialog
      setNewMedication({
        name: "",
        category: "",
        dosage: "",
        stock: 0,
        price: 0,
        supplier: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your medication inventory, track stock levels, and more.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medications..."
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
                <DropdownMenuItem>All Items</DropdownMenuItem>
                <DropdownMenuItem>Low Stock</DropdownMenuItem>
                <DropdownMenuItem>In Stock</DropdownMenuItem>
                <DropdownMenuItem>Out of Stock</DropdownMenuItem>
                <DropdownMenuItem>By Category</DropdownMenuItem>
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
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new medication to inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Medication name"
                      className="col-span-3"
                      value={newMedication.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input
                      id="category"
                      placeholder="Medication category"
                      className="col-span-3"
                      value={newMedication.category}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dosage" className="text-right">
                      Dosage
                    </Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 500mg"
                      className="col-span-3"
                      value={newMedication.dosage}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">
                      Stock
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="Initial stock"
                      className="col-span-3"
                      value={newMedication.stock || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="Unit price"
                      className="col-span-3"
                      value={newMedication.price || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Supplier
                    </Label>
                    <Input
                      id="supplier"
                      placeholder="Supplier name"
                      className="col-span-3"
                      value={newMedication.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleAddMedication}>Save Medication</Button>
                </DialogFooter>
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
                <TableHead>Category</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">{medication.id}</TableCell>
                  <TableCell>{medication.name}</TableCell>
                  <TableCell>{medication.category}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell className="text-right">{medication.stock}</TableCell>
                  <TableCell className="text-right">${medication.price.toFixed(2)}</TableCell>
                  <TableCell>{getStockStatusBadge(medication.status)}</TableCell>
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Set Alert
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
