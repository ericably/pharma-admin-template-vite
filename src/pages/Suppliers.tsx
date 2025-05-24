import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import SupplierService, { Supplier } from "@/api/services/SupplierService";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, '@id' | 'id' | 'createdAt' | 'updatedAt'>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Actif"
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSupplier(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddSupplier = async () => {
    try {
      const response = await SupplierService.createSupplier(newSupplier);
      setSuppliers([response, ...suppliers]);
      toast({
        title: "Succès",
        description: "Fournisseur ajouté avec succès",
      });
      setIsDialogOpen(false);
      setNewSupplier({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "Actif"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du fournisseur",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Fournisseurs</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos fournisseurs et leurs informations.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un fournisseur..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Fournisseur</DialogTitle>
                <DialogDescription>
                  Ajoutez les informations du nouveau fournisseur.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nom</Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newSupplier.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newSupplier.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Téléphone</Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={newSupplier.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Adresse</Label>
                  <Input
                    id="address"
                    className="col-span-3"
                    value={newSupplier.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSupplier}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Aucun fournisseur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={supplier.status === "Actif" ? "default" : "secondary"}
                      >
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
