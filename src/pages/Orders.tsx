
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
  Truck
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

// Sample data
const orders = [
  { 
    id: "PO-2023-001", 
    supplier: "Pharma Wholesale Inc.", 
    orderDate: "2023-05-10",
    deliveryDate: "2023-05-15",
    items: 12,
    totalAmount: 1245.67,
    status: "Delivered" 
  },
  { 
    id: "PO-2023-002", 
    supplier: "MedSource Supply", 
    orderDate: "2023-05-12",
    deliveryDate: "2023-05-17",
    items: 8,
    totalAmount: 876.50,
    status: "Processing" 
  },
  { 
    id: "PO-2023-003", 
    supplier: "HealthMed Suppliers", 
    orderDate: "2023-05-14",
    deliveryDate: "2023-05-19",
    items: 15,
    totalAmount: 2130.25,
    status: "Shipped" 
  },
  { 
    id: "PO-2023-004", 
    supplier: "Pharma Wholesale Inc.", 
    orderDate: "2023-05-15",
    deliveryDate: "2023-05-20",
    items: 5,
    totalAmount: 435.80,
    status: "Processing" 
  },
  { 
    id: "PO-2023-005", 
    supplier: "MedSource Supply", 
    orderDate: "2023-05-16",
    deliveryDate: "2023-05-21",
    items: 10,
    totalAmount: 1100.00,
    status: "Pending" 
  },
  { 
    id: "PO-2023-006", 
    supplier: "HealthMed Suppliers", 
    orderDate: "2023-05-17",
    deliveryDate: "2023-05-22",
    items: 7,
    totalAmount: 789.30,
    status: "Pending" 
  }
];

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case "Processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
      case "Shipped":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Shipped</Badge>;
      case "Delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, track, and manage supplier orders.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
                <DropdownMenuItem>All Orders</DropdownMenuItem>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Processing</DropdownMenuItem>
                <DropdownMenuItem>Shipped</DropdownMenuItem>
                <DropdownMenuItem>Delivered</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog>
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
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Supplier
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pharma-wholesale">Pharma Wholesale Inc.</SelectItem>
                        <SelectItem value="medsource">MedSource Supply</SelectItem>
                        <SelectItem value="healthmed">HealthMed Suppliers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="delivery-date" className="text-right">
                      Expected Delivery
                    </Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4 align-top">
                    <Label htmlFor="notes" className="text-right pt-2">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Order notes or special instructions"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-4 font-semibold">
                      Order Items
                    </Label>
                  </div>
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amoxicillin">Amoxicillin 500mg</SelectItem>
                          <SelectItem value="lisinopril">Lisinopril 10mg</SelectItem>
                          <SelectItem value="atorvastatin">Atorvastatin 20mg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input type="number" placeholder="Quantity" />
                    </div>
                    <div className="col-span-3">
                      <Input type="text" placeholder="Price" />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm" className="px-2">+</Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.deliveryDate}</TableCell>
                  <TableCell>{order.items}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
