
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
import { Switch } from "@/components/ui/switch";
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
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      speciality: "",
      licenseNumber: "",
      status: true
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        lastName: initialData.lastName,
        firstName: initialData.firstName,
        email: initialData.email,
        phone: initialData.phone,
        speciality: initialData.speciality,
        licenseNumber: initialData.licenseNumber,
        status: initialData.status
      });
    } else {
      form.reset({
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
        speciality: "",
        licenseNumber: "",
        status: true
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

  const handleStatusChange = (checked: boolean) => {
    form.setValue("status", checked);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">{isEditing ? "Modifier" : "Ajouter"} un Médecin</DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing ? "Modifiez les informations du médecin." : "Ajoutez les informations du nouveau médecin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="lastName" className="text-right text-sm">Nom</Label>
              <Input
                id="lastName"
                className="col-span-3 h-8 text-sm"
                {...form.register("lastName", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="email" className="text-right text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3 h-8 text-sm"
                {...form.register("email", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="phone" className="text-right text-sm">Téléphone</Label>
              <Input
                id="phone"
                className="col-span-3 h-8 text-sm"
                {...form.register("phone", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="speciality" className="text-right text-sm">Spécialité</Label>
              <Input
                id="speciality"
                className="col-span-3 h-8 text-sm"
                {...form.register("speciality", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="licenseNumber" className="text-right text-sm">N° Licence</Label>
              <Input
                id="licenseNumber"
                className="col-span-3 h-8 text-sm"
                {...form.register("licenseNumber", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="status" className="text-right text-sm">Actif</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={form.watch("status")}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="status" className="text-xs">
                  {form.watch("status") ? "Actif" : "Inactif"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? "Enregistrement..." : (isEditing ? "Enregistrer" : "Ajouter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
