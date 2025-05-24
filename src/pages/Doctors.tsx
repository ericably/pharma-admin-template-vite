
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
import DoctorService, { Doctor } from "@/api/services/DoctorService";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, '@id' | 'id'>>({
    name: "",
    email: "",
    phone: "",
    speciality: "",
    licenseNumber: "",
    status: "Actif"
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddDoctor = async () => {
    try {
      const response = await DoctorService.createDoctor(newDoctor);
      setDoctors([response, ...doctors]);
      toast({
        title: "Succès",
        description: "Médecin ajouté avec succès",
      });
      setIsDialogOpen(false);
      setNewDoctor({
        name: "",
        email: "",
        phone: "",
        speciality: "",
        licenseNumber: "",
        status: "Actif"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du médecin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Médecins</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les médecins partenaires.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un médecin..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Médecin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Médecin</DialogTitle>
                <DialogDescription>
                  Ajoutez les informations du nouveau médecin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nom</Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newDoctor.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newDoctor.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Téléphone</Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={newDoctor.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="speciality" className="text-right">Spécialité</Label>
                  <Input
                    id="speciality"
                    className="col-span-3"
                    value={newDoctor.speciality}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="licenseNumber" className="text-right">N° Licence</Label>
                  <Input
                    id="licenseNumber"
                    className="col-span-3"
                    value={newDoctor.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddDoctor}>Ajouter</Button>
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
                <TableHead>Spécialité</TableHead>
                <TableHead>N° Licence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Aucun médecin trouvé
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone}</TableCell>
                    <TableCell>{doctor.speciality}</TableCell>
                    <TableCell>{doctor.licenseNumber}</TableCell>
                    <TableCell>
                      <Badge variant={doctor.status === "Actif" ? "default" : "secondary"}>
                        {doctor.status}
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
