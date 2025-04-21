
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
  Trash2,
  FilePlus,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";

// Sample data
const patients = [
  { 
    id: "P-1001", 
    name: "John Smith", 
    email: "john.smith@example.com", 
    phone: "555-123-4567", 
    dob: "1975-03-15",
    address: "123 Main St, Anytown",
    insurance: "BlueCross",
    status: "Active" 
  },
  { 
    id: "P-1002", 
    name: "Mary Johnson", 
    email: "mary.j@example.com", 
    phone: "555-234-5678", 
    dob: "1982-07-22",
    address: "456 Oak Ave, Someville",
    insurance: "Medicare",
    status: "Active" 
  },
  { 
    id: "P-1003", 
    name: "Robert Brown", 
    email: "rbrown@example.com", 
    phone: "555-345-6789", 
    dob: "1968-11-03",
    address: "789 Pine Rd, Othertown",
    insurance: "Aetna",
    status: "Inactive" 
  },
  { 
    id: "P-1004", 
    name: "Jennifer Williams", 
    email: "jwill@example.com", 
    phone: "555-456-7890", 
    dob: "1990-05-17",
    address: "321 Cedar Ln, Newcity",
    insurance: "UnitedHealth",
    status: "Active" 
  },
  { 
    id: "P-1005", 
    name: "Michael Davis", 
    email: "mdavis@example.com", 
    phone: "555-567-8901", 
    dob: "1973-09-28",
    address: "654 Maple Dr, Smalltown",
    insurance: "Cigna",
    status: "Active" 
  },
  { 
    id: "P-1006", 
    name: "Sarah Miller", 
    email: "smiller@example.com", 
    phone: "555-678-9012", 
    dob: "1988-02-14",
    address: "987 Birch St, Largeville",
    insurance: "BlueCross",
    status: "Active" 
  },
  { 
    id: "P-1007", 
    name: "James Wilson", 
    email: "jwilson@example.com", 
    phone: "555-789-0123", 
    dob: "1965-12-09",
    address: "159 Walnut Ave, Hometown",
    insurance: "Medicare",
    status: "Inactive" 
  },
  { 
    id: "P-1008", 
    name: "Patricia Moore", 
    email: "pmoore@example.com", 
    phone: "555-890-1234", 
    dob: "1980-04-23",
    address: "753 Spruce Ct, Villageton",
    insurance: "Kaiser",
    status: "Active" 
  }
];

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Active":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      case "Inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage patient information, prescriptions, and records.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
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
                <DropdownMenuItem>All Patients</DropdownMenuItem>
                <DropdownMenuItem>Active Patients</DropdownMenuItem>
                <DropdownMenuItem>Inactive Patients</DropdownMenuItem>
                <DropdownMenuItem>By Insurance</DropdownMenuItem>
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
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Enter patient details to register them in the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Patient's full name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@example.com"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="555-123-4567"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dob" className="text-right">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="Full address"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="insurance" className="text-right">
                      Insurance
                    </Label>
                    <Input
                      id="insurance"
                      placeholder="Insurance provider"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Register Patient</Button>
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.insurance}</TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
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
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FilePlus className="mr-2 h-4 w-4" />
                          New Prescription
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View History
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
