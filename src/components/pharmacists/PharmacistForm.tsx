
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pharmacist } from "@/api/services/PharmacistService";

interface PharmacistFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pharmacist: Omit<Pharmacist, '@id' | 'id'>) => void;
  initialData?: Pharmacist;
}

export function PharmacistForm({ isOpen, onClose, onSubmit, initialData }: PharmacistFormProps) {
  const [formData, setFormData] = useState<Omit<Pharmacist, '@id' | 'id'>>({
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    createdAt: "",
    firstName: "",
    pharmacy: "",
    updatedAt: "",
    status: "Actif"
  });

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        createdAt: "",
        firstName: "",
        pharmacy: "",
        updatedAt: "",
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        licenseNumber: initialData.licenseNumber,
        status: initialData.status
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      lastName: "",
      createdAt: "",
      firstName: "",
      pharmacy: "/api/pharmacies/1",
      updatedAt: "",
      email: "",
      phone: "",
      licenseNumber: "",
      status: "Actif"
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as "Actif" | "Inactif"
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un Pharmacien</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du pharmacien." : "Ajoutez les informations du nouveau pharmacien."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Nom</Label>
              <Input
                id="lastName"
                className="col-span-3"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">Prénom</Label>
              <Input
                id="firstName"
                className="col-span-3"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Téléphone</Label>
              <Input
                id="phone"
                className="col-span-3"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenseNumber" className="text-right">N° Licence</Label>
              <Input
                id="licenseNumber"
                className="col-span-3"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
