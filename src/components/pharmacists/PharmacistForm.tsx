
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
import { User, Mail, Phone, Award } from "lucide-react";
import type { Pharmacist } from "@/api/services/PharmacistService";

interface PharmacistFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pharmacist: Omit<Pharmacist, '@id' | 'id'>) => void;
  initialData?: Pharmacist;
}

export function PharmacistForm({ isOpen, onClose, onSubmit, initialData }: PharmacistFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
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
        licenseNumber: initialData.licenseNumber,
        status: initialData.status
      });
    } else {
      form.reset({
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
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
      <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-gray-800">
                {isEditing ? "Modifier" : "Ajouter"} un Pharmacien
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isEditing ? "Modifiez les informations du pharmacien." : "Ajoutez les informations du nouveau pharmacien."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Nom complet
              </Label>
              <Input
                id="lastName"
                placeholder="Entrez le nom complet"
                className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                {...form.register("lastName", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                className="bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                {...form.register("email", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-600" />
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                placeholder="+33 1 23 45 67 89"
                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                {...form.register("phone", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-gray-700 font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Numéro de licence
              </Label>
              <Input
                id="licenseNumber"
                placeholder="LIC-123456789"
                className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 font-mono"
                {...form.register("licenseNumber", { required: true })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="space-y-1">
                <Label htmlFor="status" className="text-gray-700 font-medium">
                  Statut du pharmacien
                </Label>
                <div className="text-sm text-gray-600">
                  {form.watch("status") ? "Le pharmacien est actif et peut exercer" : "Le pharmacien est inactif"}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="status"
                  checked={form.watch("status")}
                  onCheckedChange={handleStatusChange}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  form.watch("status") 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {form.watch("status") ? "Actif" : "Inactif"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </div>
              ) : (
                isEditing ? "Enregistrer les modifications" : "Ajouter le pharmacien"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
