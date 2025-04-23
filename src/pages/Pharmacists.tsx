
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
import PharmacistService, { Pharmacist } from "@/api/services/PharmacistService";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function Pharmacists() {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPharmacist, setNewPharmacist] = useState<Omit<Pharmacist, '@id' | 'id'>>({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    status: "Actif"
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewPharmacist(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddPharmacist = async () => {
    try {
      const response = await PharmacistService.createPharmacist(newPharmacist);
      setPharmacists([response, ...pharmacists]);
      toast({
        title: "Succès",
        description: "Pharmacien ajouté avec succès",
      });
      setIsDialogOpen(false);
      setNewPharmacist({
        name: "",
        email: "",
        phone: "",
        licenseNumber: "",
        status: "Actif"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du pharmacien",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Pharmaciens</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les pharmaciens de votre établissement.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un pharmacien..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Pharmacien
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Pharmacien</DialogTitle>
                <DialogDescription>
                  Ajoutez les informations du nouveau pharmacien.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nom</Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newPharmacist.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newPharmacist.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Téléphone</Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={newPharmacist.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="licenseNumber" className="text-right">N° Licence</Label>
                  <Input
                    id="licenseNumber"
                    className="col-span-3"
                    value={newPharmacist.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPharmacist}>Ajouter</Button>
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
                <TableHead>N° Licence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pharmacists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Aucun pharmacien trouvé
                  </TableCell>
                </TableRow>
              ) : (
                pharmacists.map((pharmacist) => (
                  <TableRow key={pharmacist.id}>
                    <TableCell>{pharmacist.name}</TableCell>
                    <TableCell>{pharmacist.email}</TableCell>
                    <TableCell>{pharmacist.phone}</TableCell>
                    <TableCell>{pharmacist.licenseNumber}</TableCell>
                    <TableCell>
                      <Badge variant={pharmacist.status === "Actif" ? "default" : "secondary"}>
                        {pharmacist.status}
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
