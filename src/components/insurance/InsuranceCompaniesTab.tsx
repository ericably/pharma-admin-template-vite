import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, Edit } from "lucide-react";
import InsuranceService, { InsuranceCompany } from "@/api/services/InsuranceService";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import { InsuranceCompanyForm } from "./InsuranceCompanyForm";
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

interface Props {
  searchQuery: string;
  onRefresh: () => void;
}

export function InsuranceCompaniesTab({ searchQuery, onRefresh }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<InsuranceCompany | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companiesData, refetch } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: () => InsuranceService.getAllCompanies(),
  });

  const companies = companiesData?.items || [];

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: EditableColumn<InsuranceCompany>[] = [
    { key: 'code', label: 'Code', editable: true },
    { key: 'name', label: 'Nom', editable: true },
    { key: 'phone', label: 'Téléphone', type: 'tel', editable: true },
    { key: 'email', label: 'Email', type: 'email', editable: true },
    { key: 'conventionDate', label: 'Convention', type: 'date', editable: true },
    {
      key: 'status',
      label: 'Statut',
      editable: false,
      render: (value: string) => (
        <Badge variant={value === 'Actif' ? 'default' : 'secondary'} className={value === 'Actif' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      editable: false,
      render: (_: any, item: InsuranceCompany) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingCompany(item); setIsFormOpen(true); }}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => setDeletingCompany(item)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const handleCreate = async (data: Partial<InsuranceCompany>) => {
    try {
      await InsuranceService.createCompany({
        name: data.name || '',
        code: data.code || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        status: 'Actif',
        conventionDate: data.conventionDate || new Date().toISOString().split('T')[0],
        conditions: data.conditions || '',
      });
      toast({ title: "Succès", description: "Compagnie créée avec succès" });
      refetch();
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" });
    }
  };

  const handleUpdate = async (item: InsuranceCompany, updates: Partial<InsuranceCompany>) => {
    if (!item.id) return;
    try {
      await InsuranceService.updateCompany(item.id, updates);
      toast({ title: "Succès", description: "Compagnie mise à jour" });
      refetch();
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deletingCompany?.id) return;
    try {
      await InsuranceService.deleteCompany(deletingCompany.id);
      toast({ title: "Succès", description: "Compagnie supprimée" });
      setDeletingCompany(null);
      refetch();
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (data: Omit<InsuranceCompany, '@id' | 'id'>) => {
    try {
      if (editingCompany?.id) {
        await InsuranceService.updateCompany(editingCompany.id, data);
        toast({ title: "Succès", description: "Compagnie modifiée avec succès" });
      } else {
        await InsuranceService.createCompany(data);
        toast({ title: "Succès", description: "Compagnie créée avec succès" });
      }
      setIsFormOpen(false);
      setEditingCompany(null);
      refetch();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} compagnie(s)</p>
        <Button
          onClick={() => { setEditingCompany(null); setIsFormOpen(true); }}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Compagnie
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <EditableTable
          data={filtered}
          columns={columns}
          keyField="id"
          onUpdate={handleUpdate}
          onCreate={handleCreate}
          emptyRowMessage="Cliquer pour ajouter une compagnie"
        />
      </div>

      <InsuranceCompanyForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCompany(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingCompany || undefined}
      />

      <AlertDialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la compagnie "{deletingCompany?.name}" ? Cette action est irréversible.
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
