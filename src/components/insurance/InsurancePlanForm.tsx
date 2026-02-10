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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { InsurancePlan, InsuranceCompany, InsurancePlanRate } from "@/api/services/InsuranceService";

interface FormData {
  name: string;
  companyId: string;
  medicamentsRemboursables: number;
  medicamentsGeneriques: number;
  medicamentsSpecialite: number;
  parapharmacie: number;
  materielMedical: number;
  plafondAnnuel: number;
  franchiseAnnuelle: number;
  coPaiementMinimum: number;
  produitsExclus: string;
  status: 'Actif' | 'Inactif';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<InsurancePlan, '@id' | 'id'>) => Promise<void>;
  companies: InsuranceCompany[];
  initialData?: InsurancePlan;
}

export function InsurancePlanForm({ isOpen, onClose, onSubmit, companies, initialData }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: '',
      companyId: '',
      medicamentsRemboursables: 0,
      medicamentsGeneriques: 0,
      medicamentsSpecialite: 0,
      parapharmacie: 0,
      materielMedical: 0,
      plafondAnnuel: 0,
      franchiseAnnuelle: 0,
      coPaiementMinimum: 0,
      produitsExclus: '',
      status: 'Actif',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        companyId: initialData.companyId,
        medicamentsRemboursables: initialData.rates.medicamentsRemboursables,
        medicamentsGeneriques: initialData.rates.medicamentsGeneriques,
        medicamentsSpecialite: initialData.rates.medicamentsSpecialite,
        parapharmacie: initialData.rates.parapharmacie,
        materielMedical: initialData.rates.materielMedical,
        plafondAnnuel: initialData.plafondAnnuel,
        franchiseAnnuelle: initialData.franchiseAnnuelle,
        coPaiementMinimum: initialData.coPaiementMinimum,
        produitsExclus: initialData.produitsExclus,
        status: initialData.status,
      });
    } else {
      reset({
        name: '',
        companyId: '',
        medicamentsRemboursables: 0,
        medicamentsGeneriques: 0,
        medicamentsSpecialite: 0,
        parapharmacie: 0,
        materielMedical: 0,
        plafondAnnuel: 0,
        franchiseAnnuelle: 0,
        coPaiementMinimum: 0,
        produitsExclus: '',
        status: 'Actif',
      });
    }
  }, [initialData, isOpen, reset]);

  const companyId = watch('companyId');
  const status = watch('status');

  const onFormSubmit = async (data: FormData) => {
    const company = companies.find(c => c.id === data.companyId);
    const planData: Omit<InsurancePlan, '@id' | 'id'> = {
      name: data.name,
      companyId: data.companyId,
      companyName: company?.name || '',
      rates: {
        medicamentsRemboursables: Number(data.medicamentsRemboursables),
        medicamentsGeneriques: Number(data.medicamentsGeneriques),
        medicamentsSpecialite: Number(data.medicamentsSpecialite),
        parapharmacie: Number(data.parapharmacie),
        materielMedical: Number(data.materielMedical),
      },
      plafondAnnuel: Number(data.plafondAnnuel),
      franchiseAnnuelle: Number(data.franchiseAnnuelle),
      coPaiementMinimum: Number(data.coPaiementMinimum),
      produitsExclus: data.produitsExclus,
      status: data.status,
    };
    await onSubmit(planData);
  };

  const rateFields: { key: keyof FormData; label: string; color: string }[] = [
    { key: 'medicamentsRemboursables', label: 'Médicaments remboursables', color: 'text-blue-600' },
    { key: 'medicamentsGeneriques', label: 'Médicaments génériques', color: 'text-green-600' },
    { key: 'medicamentsSpecialite', label: 'Médicaments de spécialité', color: 'text-purple-600' },
    { key: 'parapharmacie', label: 'Parapharmacie', color: 'text-orange-600' },
    { key: 'materielMedical', label: 'Matériel médical', color: 'text-teal-600' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            {initialData ? 'Modifier le plan' : 'Nouveau plan d\'assurance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nom du plan *</Label>
              <Input className="h-8 text-sm" placeholder="Ex: Plan Or" {...register('name', { required: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Compagnie *</Label>
              <Select value={companyId} onValueChange={(v) => setValue('companyId', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.filter(c => c.status === 'Actif').map(c => (
                    <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Taux de couverture */}
          <div className="bg-violet-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-violet-800">Taux de couverture (%)</p>
            <div className="grid grid-cols-2 gap-2">
              {rateFields.map(field => (
                <div key={field.key} className="space-y-0.5">
                  <Label className={`text-[11px] ${field.color}`}>{field.label}</Label>
                  <div className="flex items-center gap-1">
                    <Input type="number" min={0} max={100} className="h-7 text-sm" {...register(field.key, { valueAsNumber: true })} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres financiers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Plafond annuel (€)</Label>
              <Input type="number" min={0} className="h-8 text-sm" placeholder="0 = illimité" {...register('plafondAnnuel', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Franchise (€)</Label>
              <Input type="number" min={0} className="h-8 text-sm" {...register('franchiseAnnuelle', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Co-paiement min (€)</Label>
              <Input type="number" min={0} step={0.01} className="h-8 text-sm" {...register('coPaiementMinimum', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Produits exclus</Label>
              <Input className="h-8 text-sm" placeholder="Séparés par des virgules" {...register('produitsExclus')} />
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

          <div className="flex justify-between items-center pt-3 border-t">
            <Button type="button" variant="outline" onClick={onClose} size="sm">Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6" size="sm">
              {initialData ? 'Modifier' : 'Créer le plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
