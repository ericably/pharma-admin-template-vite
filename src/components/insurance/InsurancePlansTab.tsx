import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import InsuranceService, { InsurancePlan, InsuranceCompany } from "@/api/services/InsuranceService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InsurancePlanForm } from "./InsurancePlanForm";
import { InsurancePlanDetails } from "./InsurancePlanDetails";

interface Props {
  searchQuery: string;
  companies: InsuranceCompany[];
  onRefresh: () => void;
}

export function InsurancePlansTab({ searchQuery, companies, onRefresh }: Props) {
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<InsurancePlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<InsurancePlan | null>(null);
  const { toast } = useToast();

  const { data: plansData, refetch } = useQuery({
    queryKey: ['insurance-plans'],
    queryFn: () => InsuranceService.getAllPlans(),
  });

  const plans = plansData?.items || [];

  const filtered = plans.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = companyFilter === 'all' || p.companyId === companyFilter;
    return matchesSearch && matchesCompany;
  });

  const handleFormSubmit = async (data: Omit<InsurancePlan, '@id' | 'id'>) => {
    try {
      if (editingPlan?.id) {
        await InsuranceService.updatePlan(editingPlan.id, data);
        toast({ title: "Succès", description: "Plan modifié avec succès" });
      } else {
        await InsuranceService.createPlan(data);
        toast({ title: "Succès", description: "Plan créé avec succès" });
      }
      setIsFormOpen(false);
      setEditingPlan(null);
      refetch();
      onRefresh();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deletingPlan?.id) return;
    try {
      await InsuranceService.deletePlan(deletingPlan.id);
      toast({ title: "Succès", description: "Plan supprimé" });
      setDeletingPlan(null);
      refetch();
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{filtered.length} plan(s)</p>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder="Compagnie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les compagnies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => { setEditingPlan(null); setIsFormOpen(true); }}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Plan
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="h-8 px-3 text-xs">Plan</TableHead>
              <TableHead className="h-8 px-3 text-xs">Compagnie</TableHead>
              <TableHead className="h-8 px-3 text-xs">Méd. Remb.</TableHead>
              <TableHead className="h-8 px-3 text-xs">Génériques</TableHead>
              <TableHead className="h-8 px-3 text-xs">Spécialité</TableHead>
              <TableHead className="h-8 px-3 text-xs">Parapharma.</TableHead>
              <TableHead className="h-8 px-3 text-xs">Mat. Méd.</TableHead>
              <TableHead className="h-8 px-3 text-xs">Plafond</TableHead>
              <TableHead className="h-8 px-3 text-xs">Statut</TableHead>
              <TableHead className="h-8 px-3 text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(plan => (
              <TableRow key={plan.id} className="text-xs hover:bg-muted/50">
                <TableCell className="py-1.5 px-3 font-medium">{plan.name}</TableCell>
                <TableCell className="py-1.5 px-3">{plan.companyName}</TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{plan.rates.medicamentsRemboursables}%</Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{plan.rates.medicamentsGeneriques}%</Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{plan.rates.medicamentsSpecialite}%</Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">{plan.rates.parapharmacie}%</Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">{plan.rates.materielMedical}%</Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">{plan.plafondAnnuel > 0 ? `${plan.plafondAnnuel.toLocaleString()}€` : 'Illimité'}</TableCell>
                <TableCell className="py-1.5 px-3">
                  <Badge variant={plan.status === 'Actif' ? 'default' : 'secondary'} className={plan.status === 'Actif' ? 'bg-green-100 text-green-700 border-green-200 text-xs' : 'bg-gray-100 text-gray-600 text-xs'}>
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-1.5 px-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setViewingPlan(plan)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingPlan(plan); setIsFormOpen(true); }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => setDeletingPlan(plan)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">
                  Aucun plan d'assurance trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InsurancePlanForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPlan(null); }}
        onSubmit={handleFormSubmit}
        companies={companies}
        initialData={editingPlan || undefined}
      />

      <InsurancePlanDetails
        isOpen={!!viewingPlan}
        onClose={() => setViewingPlan(null)}
        plan={viewingPlan}
      />

      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le plan "{deletingPlan?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
