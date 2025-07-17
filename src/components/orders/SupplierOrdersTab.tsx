
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
  Truck,
  Trash2
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
import OrderService, { Order, OrderItem } from "@/api/services/OrderService";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Sample suppliers for demo
const suppliers = [
  { id: "sup1", name: "Pharma Wholesale Inc." },
  { id: "sup2", name: "MedSource Supply" },
  { id: "sup3", name: "HealthMed Suppliers" },
];

// Sample medications for demo
const medications = [
  { id: "med1", name: "Amoxicillin 500mg", price: 5.25 },
  { id: "med2", name: "Lisinopril 10mg", price: 3.75 },
  { id: "med3", name: "Atorvastatin 20mg", price: 8.50 },
  { id: "med4", name: "Metformin 500mg", price: 2.95 },
  { id: "med5", name: "Omeprazole 20mg", price: 6.25 },
];

export default function SupplierOrdersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const { toast } = useToast();
  
  const form = useForm<Omit<Order, "@id" | "id">>({
    defaultValues: {
      supplier: "",
      supplierId: "",
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: "",
      items: [],
      totalAmount: 0,
      status: "En attente",
      notes: ""
    }
  });
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Using sample data for demo
      setOrders([
        { 
          id: "PO-2023-001", 
          supplier: "Pharma Wholesale Inc.", 
          supplierId: "sup1",
          orderDate: "2023-05-10",
          deliveryDate: "2023-05-15",
          items: [{ medication: "Amoxicillin 500mg", medicationId: "med1", quantity: 12, unitPrice: 5.25 }],
          totalAmount: 1245.67,
          status: "Livré" 
        },
        { 
          id: "PO-2023-002", 
          supplier: "MedSource Supply", 
          supplierId: "sup2",
          orderDate: "2023-05-12",
          deliveryDate: "2023-05-17",
          items: [{ medication: "Lisinopril 10mg", medicationId: "med2", quantity: 8, unitPrice: 3.75 }],
          totalAmount: 876.50,
          status: "En cours" 
        },
        { 
          id: "PO-2023-003", 
          supplier: "HealthMed Suppliers", 
          supplierId: "sup3",
          orderDate: "2023-05-14",
          deliveryDate: "2023-05-19",
          items: [{ medication: "Atorvastatin 20mg", medicationId: "med3", quantity: 15, unitPrice: 8.50 }],
          totalAmount: 2130.25,
          status: "Expédié" 
        }
      ]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to order
  const addOrderItem = () => {
    if (!selectedMedication || quantity <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please select a medication and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const medication = medications.find(med => med.id === selectedMedication);
    if (!medication) return;

    const newItem: OrderItem = {
      medication: medication.name,
      medicationId: medication.id,
      quantity: quantity,
      unitPrice: medication.price
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedMedication("");
    setQuantity(1);
  };

  // Remove item from order
  const removeOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Calculate order total
  const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Submit order form
  const onSubmit = async (data: Omit<Order, "@id" | "id">) => {
    if (orderItems.length === 0) {
      toast({
        title: "No Items Added",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === data.supplierId);
    if (!selectedSupplier) return;

    try {
      const newOrder: Omit<Order, "@id" | "id"> = {
        ...data,
        supplier: selectedSupplier.name,
        items: orderItems,
        totalAmount: calculateTotal(orderItems),
      };

      const orderWithId = {
        ...newOrder,
        id: `PO-${new Date().getFullYear()}-${(orders.length + 1).toString().padStart(3, '0')}`,
      };
      
      setOrders([orderWithId, ...orders]);
      
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      
      setOrderItems([]);
      form.reset();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "En attente":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
      case "En cours":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">En cours</Badge>;
      case "Expédié":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Expédié</Badge>;
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
            placeholder="Search orders..."
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
              <DropdownMenuItem onClick={() => setSearchQuery("En cours")}>En cours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Expédié")}>Expédié</DropdownMenuItem>
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
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Place a new order with your supplier.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Supplier</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">
                            Expected Delivery
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="col-span-3"
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center gap-4 align-top">
                          <FormLabel className="text-right pt-2">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Order notes or special instructions"
                              className="col-span-3"
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-4 font-semibold">
                      Order Items
                    </Label>
                  </div>
                  
                  {/* Display current order items */}
                  {orderItems.length > 0 && (
                    <div className="border rounded-md p-3">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-muted-foreground">
                            <th className="text-left p-1">Medication</th>
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
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                              <td className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                              <td>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeOrderItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t font-medium">
                            <td colSpan={3} className="py-2 text-right">Total:</td>
                            <td className="text-right">${calculateTotal(orderItems).toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Add new order item */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5">
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
                      <Input 
                        type="number" 
                        placeholder="Quantity" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        min={1}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="text" 
                        value={selectedMedication 
                          ? `$${medications.find(m => m.id === selectedMedication)?.price.toFixed(2) || "0.00"}`
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
              </Form>
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
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.deliveryDate}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
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
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Mark Received
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
