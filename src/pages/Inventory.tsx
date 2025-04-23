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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  FileDown, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MedicationService, { Medication } from "@/api/services/MedicationService";

const sampleMedications: Medication[] = [
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
  const [medications, setMedications] = useState<Medication[]>(sampleMedications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<null | Medication>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newMedication, setNewMedication] = useState<Omit<Medication, '@id' | 'id' | 'createdAt' | 'updatedAt'>>({
    name: "",
    category: "",
    description: "",
    dosage: "",
    stock: 0,
    price: 0,
    supplier: "",
    status: ""
  });
  const [editMedication, setEditMedication] = useState<Medication | null>(null);

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = 
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.dosage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? medication.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (editMedication) {
      setEditMedication(prev => ({
        ...prev!,
        [id]: id === "stock" || id === "price" ? parseFloat(value) : value
      }));
    }
  };

  const handleAddMedication = async () => {
    try {
      if (!newMedication.name || !newMedication.category || !newMedication.dosage) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const status = newMedication.stock <= 20 ? "Low Stock" : "In Stock";

      const medicationToAdd = {
        ...newMedication,
        status,
      };

      const response = await MedicationService.createMedication(medicationToAdd);
      
      const nextId = Math.max(...medications.map(m => m.id as number)) + 1;
      const newMedicationWithId = {
        ...medicationToAdd,
        id: response.id || nextId,
      } as Medication;
      
      setMedications([...medications, newMedicationWithId]);
      
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
      
      setNewMedication({
        name: "",
        category: "",
        dosage: "",
        stock: 0,
        price: 0,
        supplier: "",
        description: "",
        status: ""
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

  const handleEditMedication = async () => {
    if (!editMedication || !editMedication.id) return;

    try {
      const status = editMedication.stock <= 20 ? "Low Stock" : "In Stock";
      const medicationToUpdate = {
        ...editMedication,
        status,
      };

      const response = await MedicationService.updateMedication(
        editMedication.id,
        medicationToUpdate
      );

      const updatedMedications = medications.map(med => 
        med.id === editMedication.id ? medicationToUpdate as Medication : med
      );
      
      setMedications(updatedMedications);
      
      toast({
        title: "Success",
        description: "Medication updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating medication:", error);
      toast({
        title: "Error",
        description: "Failed to update medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedication = async () => {
    if (!selectedMedication || !selectedMedication.id) return;

    try {
      await MedicationService.deleteMedication(selectedMedication.id);
      
      const updatedMedications = medications.filter(
        med => med.id !== selectedMedication.id
      );
      setMedications(updatedMedications);
      
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (medication: Medication) => {
    setEditMedication({...medication});
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = () => {
    try {
      const headers = ["ID", "Name", "Category", "Dosage", "Stock", "Price", "Supplier", "Status"];
      const csvContent = [
        headers.join(","),
        ...filteredMedications.map(med => [
          med.id,
          `"${med.name}"`,
          `"${med.category}"`,
          `"${med.dosage}"`,
          med.stock,
          med.price.toFixed(2),
          `"${med.supplier || ''}"`,
          `"${med.status}"`
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Inventory data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting inventory:", error);
      toast({
        title: "Error",
        description: "Failed to export inventory data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filter: string | null) => {
    setStatusFilter(filter);
  };

  const handleStockUpdate = async (medicationId: number, newStock: number) => {
    try {
      await MedicationService.updateMedication(medicationId, { stock: newStock });
      
      const updatedMedications = medications.map(med => 
        med.id === medicationId ? { ...med, stock: newStock } : med
      );
      
      setMedications(updatedMedications);
      
      toast({
        title: "Stock mis à jour",
        description: "Le stock a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du stock",
        variant: "destructive",
      });
    }
  };

  const LowStockAlert = ({ stock }: { stock: number }) => {
    if (stock <= 10) {
      return (
        <div className="text-red-500 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Stock bas
        </div>
      );
    }
    return null;
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
                  {statusFilter ? `Filter: ${statusFilter}` : 'Filter'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("Low Stock")}>
                  Low Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("In Stock")}>
                  In Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("Out of Stock")}>
                  Out of Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExport}>
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
              {filteredMedications.length > 0 ? (
                filteredMedications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.id}</TableCell>
                    <TableCell>{medication.name}</TableCell>
                    <TableCell>{medication.category}</TableCell>
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {medication.stock}
                        <LowStockAlert stock={medication.stock} />
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(medication)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(medication)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(medication)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No medications found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Medication Details</DialogTitle>
            <DialogDescription>
              Detailed information about this medication.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Name:</Label>
                <div className="col-span-2">{selectedMedication.name}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Category:</Label>
                <div className="col-span-2">{selectedMedication.category}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Dosage:</Label>
                <div className="col-span-2">{selectedMedication.dosage}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Stock:</Label>
                <div className="col-span-2">{selectedMedication.stock}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Price:</Label>
                <div className="col-span-2">${selectedMedication.price.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Supplier:</Label>
                <div className="col-span-2">{selectedMedication.supplier || "N/A"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Status:</Label>
                <div className="col-span-2">{getStockStatusBadge(selectedMedication.status)}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                handleEditClick(selectedMedication!);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update the medication's information.
            </DialogDescription>
          </DialogHeader>
          
          {editMedication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Medication name"
                  className="col-span-3"
                  value={editMedication.name}
                  onChange={handleEditInputChange}
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
                  value={editMedication.category}
                  onChange={handleEditInputChange}
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
                  value={editMedication.dosage}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="Stock quantity"
                  className="col-span-3"
                  value={editMedication.stock || ""}
                  onChange={handleEditInputChange}
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
                  value={editMedication.price || ""}
                  onChange={handleEditInputChange}
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
                  value={editMedication.supplier || ""}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditMedication}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMedication?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedication} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
