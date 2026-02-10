import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { InsurancePlan } from "@/api/services/InsuranceService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: InsurancePlan | null;
}

export function InsurancePlanDetails({ isOpen, onClose, plan }: Props) {
  if (!plan) return null;

  const rateRows = [
    { label: 'Médicaments remboursables', value: plan.rates.medicamentsRemboursables, color: 'bg-blue-100 text-blue-800' },
    { label: 'Médicaments génériques', value: plan.rates.medicamentsGeneriques, color: 'bg-green-100 text-green-800' },
    { label: 'Médicaments de spécialité', value: plan.rates.medicamentsSpecialite, color: 'bg-purple-100 text-purple-800' },
    { label: 'Parapharmacie', value: plan.rates.parapharmacie, color: 'bg-orange-100 text-orange-800' },
    { label: 'Matériel médical', value: plan.rates.materielMedical, color: 'bg-teal-100 text-teal-800' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            {plan.name}
            <Badge variant={plan.status === 'Actif' ? 'default' : 'secondary'} className={plan.status === 'Actif' ? 'bg-green-100 text-green-700 border-green-200 text-xs' : 'text-xs'}>
              {plan.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-violet-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-violet-800 mb-1">Compagnie</p>
            <p className="text-sm font-medium">{plan.companyName}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600">Taux de couverture</p>
            {rateRows.map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{row.label}</span>
                <Badge className={`${row.color} text-xs`}>{row.value}%</Badge>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Plafond annuel</p>
              <p className="text-sm font-bold">{plan.plafondAnnuel > 0 ? `${plan.plafondAnnuel.toLocaleString()}€` : 'Illimité'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Franchise</p>
              <p className="text-sm font-bold">{plan.franchiseAnnuelle}€</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Co-paiement min</p>
              <p className="text-sm font-bold">{plan.coPaiementMinimum}€</p>
            </div>
          </div>

          {plan.produitsExclus && (
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-xs font-semibold text-red-700 mb-1">Produits exclus</p>
              <p className="text-xs text-red-600">{plan.produitsExclus}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
