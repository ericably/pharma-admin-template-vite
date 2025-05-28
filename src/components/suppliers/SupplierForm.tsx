
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Barcode } from "lucide-react";
import type { Supplier } from "@/api/services/SupplierService";

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplier: Omit<Supplier, '@id' | 'id'>) => void;
  initialData?: Supplier;
}

export function SupplierForm({ isOpen, onClose, onSubmit, initialData }: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      licenseNumber: "",
      status: true
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        category: initialData.category,
        licenseNumber: initialData.licenseNumber,
        status: initialData.status
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "",
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

  const handleCategoryChange = (value: string) => {
    form.setValue("category", value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un Fournisseur</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du fournisseur." : "Ajoutez les informations du nouveau fournisseur."}
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
              <Label htmlFor="address" className="text-right">Adresse</Label>
              <Textarea
                id="address"
                className="col-span-3"
                {...form.register("address", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Catégorie</Label>
              <Select 
                value={form.watch("category")} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Distributeur">Distributeur</SelectItem>
                  <SelectItem value="Grossiste">Grossiste</SelectItem>
                  <SelectItem value="Fabricant">Fabricant</SelectItem>
                  <SelectItem value="Import/Export">Import/Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenseNumber" className="text-right">
                <div className="flex items-center gap-1">
                  <Barcode className="h-4 w-4" />
                  N° Licence
                </div>
              </Label>
              <Input
                id="licenseNumber"
                className="col-span-3"
                {...form.register("licenseNumber", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Actif</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={form.watch("status")}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="status" className="text-sm">
                  {form.watch("status") ? "Actif" : "Inactif"}
                </Label>
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
