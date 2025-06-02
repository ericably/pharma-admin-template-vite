
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
import { useForm } from "react-hook-form";
import type { Patient } from "@/api/services/PatientService";

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Omit<Patient, '@id' | 'id'>) => void;
  initialData?: Patient;
}

export function PatientForm({ isOpen, onClose, onSubmit, initialData }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      insurance: "",
      status: "Actif"
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        dob: initialData.dob,
        address: initialData.address || "",
        insurance: initialData.insurance || "",
        status: initialData.status
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        insurance: "",
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

  const handleStatusChange = (status: string) => {
    form.setValue("status", status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un Patient</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du patient." : "Ajoutez les informations du nouveau patient."}
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
              <Label htmlFor="dob" className="text-right">Date de naissance</Label>
              <Input
                id="dob"
                type="date"
                className="col-span-3"
                {...form.register("dob", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Adresse</Label>
              <Input
                id="address"
                className="col-span-3"
                {...form.register("address")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="insurance" className="text-right">Assurance</Label>
              <Input
                id="insurance"
                className="col-span-3"
                {...form.register("insurance")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Statut</Label>
              <div className="col-span-3 flex gap-2">
                <Button
                  type="button"
                  variant={form.watch("status") === "Actif" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Actif")}
                  size="sm"
                >
                  Actif
                </Button>
                <Button
                  type="button"
                  variant={form.watch("status") === "Inactif" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Inactif")}
                  size="sm"
                >
                  Inactif
                </Button>
              </div>
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
