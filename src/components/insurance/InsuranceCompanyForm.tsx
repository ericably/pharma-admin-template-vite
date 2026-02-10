import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { InsuranceCompany } from "@/api/services/InsuranceService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<InsuranceCompany, '@id' | 'id'>) => Promise<void>;
  initialData?: InsuranceCompany;
}

export function InsuranceCompanyForm({ isOpen, onClose, onSubmit, initialData }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<InsuranceCompany, '@id' | 'id'>>({
    defaultValues: {
      name: '',
      code: '',
      phone: '',
      email: '',
      address: '',
      status: 'Actif',
      conventionDate: new Date().toISOString().split('T')[0],
      conditions: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        status: initialData.status,
        conventionDate: initialData.conventionDate,
        conditions: initialData.conditions,
      });
    } else {
      reset({
        name: '',
        code: '',
        phone: '',
        email: '',
        address: '',
        status: 'Actif',
        conventionDate: new Date().toISOString().split('T')[0],
        conditions: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const status = watch('status');

  const handleFormSubmit = async (data: Omit<InsuranceCompany, '@id' | 'id'>) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-600" />
            {initialData ? 'Modifier la compagnie' : 'Nouvelle compagnie d\'assurance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Nom *</Label>
              <Input id="name" className="h-8 text-sm" placeholder="Ex: CPAM" {...register('name', { required: true })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="code" className="text-xs">Code *</Label>
              <Input id="code" className="h-8 text-sm" placeholder="Ex: CPAM-001" {...register('code', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Téléphone</Label>
              <Input id="phone" type="tel" className="h-8 text-sm" placeholder="01 23 45 67 89" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" className="h-8 text-sm" placeholder="contact@assurance.fr" {...register('email')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs">Adresse</Label>
            <Input id="address" className="h-8 text-sm" placeholder="Adresse complète" {...register('address')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="conventionDate" className="text-xs">Date de convention</Label>
              <Input id="conventionDate" type="date" className="h-8 text-sm" {...register('conventionDate')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Statut</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as 'Actif' | 'Inactif')}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="conditions" className="text-xs">Conditions générales</Label>
            <Textarea id="conditions" className="text-sm min-h-[60px]" placeholder="Conditions de la convention..." {...register('conditions')} />
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <Button type="button" variant="outline" onClick={onClose} size="sm">Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6" size="sm">
              {initialData ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
