
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
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  FileDown, 
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CustomerOrderService, { CustomerOrder, CustomerOrderItem } from "@/api/services/CustomerOrderService";

// Sample patients for demo
const patients = [
  { id: "P-1001", name: "Jean Dupont" },
  { id: "P-1002", name: "Marie Martin" },
  { id: "P-1003", name: "Robert Brown" },
  { id: "P-1004", name: "Jennifer Williams" },
];

// Sample medications for demo
const medications = [
  { id: "M-001", name: "Amoxicilline 500mg", price: 0.85 },
  { id: "M-002", name: "Lisinopril 10mg", price: 0.45 },
  { id: "M-003", name: "Atorvastatin 20mg", price: 1.25 },
  { id: "M-004", name: "Metformin 1000mg", price: 0.35 },
  { id: "M-005", name: "Omeprazole 20mg", price: 0.75 },
];

// Sample doctors for demo
const doctors = [
  { id: "D-001", name: "Dr. Howard Lee" },
  { id: "D-002", name: "Dr. Sarah Chen" },
  { id: "D-003", name: "Dr. James Wilson" },
];

export default function CustomerOrdersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<CustomerOrderItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [dosage, setDosage] = useState("");
  
  // Form state with controlled values
  const [formData, setFormData] = useState({
    patientId: "",
    doctor: "",
    notes: "",
    orderDate: new Date().toISOString().split('T')[0],
    status: "En attente" as CustomerOrder['status']
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await CustomerOrderService.getAllCustomerOrders();
      setOrders(response.items);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to order
  const addOrderItem = () => {
    if (!selectedMedication || quantity <= 0 || !dosage) {
      toast({
        title: "Invalid Item",
        description: "Please select a medication, enter quantity and dosage",
        variant: "destructive",
      });
      return;
    }

    const medication = medications.find(med => med.id === selectedMedication);
    if (!medication) return;

    const newItem: CustomerOrderItem = {
      medication: medication.name,
      medicationId: medication.id,
      quantity: quantity,
      unitPrice: medication.price,
      dosage: dosage,
      instructions: ""
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedMedication("");
    setQuantity(1);
    setDosage("");
  };

  // Remove item from order
  const removeOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Calculate order total
  const calculateTotal = (items: CustomerOrderItem[]): number => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Submit order form
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast({
        title: "No Items Added",
        description: "Please add at least one medication to the order",
        variant: "destructive",
      });
      return;
    }

    if (!formData.patientId) {
      toast({
        title: "Patient Required",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) return;

    try {
      const newOrder: Omit<CustomerOrder, "@id" | "id"> = {
        patient: selectedPatient.name,
        patientId: formData.patientId,
        orderDate: formData.orderDate,
        items: orderItems,
        totalAmount: calculateTotal(orderItems),
        status: formData.status,
        doctor: formData.doctor,
        notes: formData.notes
      };

      const createdOrder = await CustomerOrderService.createCustomerOrder(newOrder);
      setOrders([createdOrder, ...orders]);
      
      toast({
        title: "Success",
        description: "Customer order created successfully",
      });
      
      // Reset form
      setOrderItems([]);
      setFormData({
        patientId: "",
        doctor: "",
        notes: "",
        orderDate: new Date().toISOString().split('T')[0],
        status: "En attente"
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating customer order:", error);
      toast({
        title: "Error",
        description: "Failed to create customer order",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: CustomerOrder['status']) => {
    try {
      await CustomerOrderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.medication.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "En attente":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
      case "En préparation":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">En préparation</Badge>;
      case "Prêt pour retrait":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Prêt pour retrait</Badge>;
      case "Livré":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Livré</Badge>;
      case "Annulé":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customer orders..."
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
              <DropdownMenuItem onClick={() => setSearchQuery("")}>All Orders</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("En attente")}>En attente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("En préparation")}>En préparation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Prêt pour retrait")}>Prêt pour retrait</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Livré")}>Livré</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Commande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer une Commande Client</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle commande pour un patient.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Patient</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Doctor</Label>
                  <Select
                    value={formData.doctor}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctor: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.name}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4 align-top">
                  <Label className="text-right pt-2">Notes</Label>
                  <Textarea
                    placeholder="Special instructions or notes"
                    className="col-span-3"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right col-span-4 font-semibold">
                    Medications
                  </Label>
                </div>
                
                {/* Display current order items */}
                {orderItems.length > 0 && (
                  <div className="border rounded-md p-3">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-1">Medication</th>
                          <th className="text-left p-1">Dosage</th>
                          <th className="text-center p-1">Qty</th>
                          <th className="text-right p-1">Price</th>
                          <th className="text-right p-1">Total</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="py-2">{item.medication}</td>
                            <td className="py-2 text-sm text-muted-foreground">{item.dosage}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">€{item.unitPrice.toFixed(2)}</td>
                            <td className="text-right">€{(item.quantity * item.unitPrice).toFixed(2)}</td>
                            <td>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => removeOrderItem(index)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t font-medium">
                          <td colSpan={4} className="py-2 text-right">Total:</td>
                          <td className="text-right">€{calculateTotal(orderItems).toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Add new order item */}
                <div className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-4">
                    <Label className="text-sm">Medication</Label>
                    <Select
                      value={selectedMedication}
                      onValueChange={setSelectedMedication}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent>
                        {medications.map(med => (
                          <SelectItem key={med.id} value={med.id}>{med.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm">Dosage</Label>
                    <Input 
                      placeholder="e.g., 1x daily" 
                      value={dosage} 
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Quantity</Label>
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Price</Label>
                    <Input 
                      type="text" 
                      value={selectedMedication 
                        ? `€${medications.find(m => m.id === selectedMedication)?.price.toFixed(2) || "0.00"}`
                        : ""
                      } 
                      readOnly 
                      placeholder="Price" 
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="px-2"
                      onClick={addOrderItem}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <DialogFooter className="mt-4">
                  <Button type="submit">Create Order</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pharmacy-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No customer orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.patient}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.map((item, index) => (
                          <div key={index} className="truncate">
                            {item.medication} ({item.quantity})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{order.doctor || "-"}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell className="text-right">€{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                          {order.status === "En attente" && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id!, "En préparation")}>
                              <Clock className="mr-2 h-4 w-4 text-blue-600" />
                              Start Preparation
                            </DropdownMenuItem>
                          )}
                          {order.status === "En préparation" && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id!, "Prêt pour retrait")}>
                              <Package className="mr-2 h-4 w-4 text-purple-600" />
                              Mark Ready
                            </DropdownMenuItem>
                          )}
                          {order.status === "Prêt pour retrait" && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id!, "Livré")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id!, "Annulé")}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
