
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
import { useForm } from "react-hook-form";
import type { Doctor } from "@/api/services/DoctorService";

interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctor: Omit<Doctor, '@id' | 'id'>) => void;
  initialData?: Doctor;
}

export function DoctorForm({ isOpen, onClose, onSubmit, initialData }: DoctorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      speciality: "",
      licenseNumber: "",
      status: "Actif" as "Actif" | "Inactif"
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        speciality: initialData.speciality,
        licenseNumber: initialData.licenseNumber,
        status: initialData.status
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        speciality: "",
        licenseNumber: "",
        status: "Actif"
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      if (!isEditing) {
        form.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    form.setValue("status", value as "Actif" | "Inactif");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un Médecin</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du médecin." : "Ajoutez les informations du nouveau médecin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input
                id="name"
                className="col-span-3"
                {...form.register("name", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                {...form.register("email", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Téléphone</Label>
              <Input
                id="phone"
                className="col-span-3"
                {...form.register("phone", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="speciality" className="text-right">Spécialité</Label>
              <Input
                id="speciality"
                className="col-span-3"
                {...form.register("speciality", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenseNumber" className="text-right">N° Licence</Label>
              <Input
                id="licenseNumber"
                className="col-span-3"
                {...form.register("licenseNumber", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Statut</Label>
              <Select 
                value={form.watch("status")} 
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : (isEditing ? "Enregistrer" : "Ajouter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
