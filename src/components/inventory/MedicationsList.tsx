
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, Package, AlertTriangle, Pill, Euro, Calendar } from "lucide-react";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import type { Medication } from "@/api/services/MedicationService";
import MedicationService from "@/api/services/MedicationService";
import MedicationSearchService from "@/api/services/MedicationSearchService";

interface MedicationsListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
  onView?: (medication: Medication) => void;
  onUpdate: (medication: Medication, updates: Partial<Medication>) => Promise<void>;
}

export function MedicationsList({ medications, onEdit, onDelete, onView, onUpdate }: MedicationsListProps) {
  const getStatusBadge = (status: string) => {
    return status === "Actif" ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Stock Faible</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">En Stock</Badge>;
    }
  };

  const columns: EditableColumn<Medication>[] = [
    { key: 'id', label: 'ID', editable: false },
    { 
      key: 'name', 
      label: 'Nom', 
      type: 'autocomplete',
      editable: false,
      autocomplete: {
        searchFn: (query: string) => MedicationSearchService.searchMedications(query),
        displayField: "name",
        minChars: 2,
        // onSelect handled by EditableTable when onCreate is provided
        onSelect: () => {},
      },
      render: (value, medication) => (
        <div className="flex items-center gap-1">
          {medication.stock < 10 && (
            <AlertTriangle className="h-3 w-3 text-orange-500" />
          )}
          <Pill className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
        </div>
      )
    },
    { key: 'category', label: 'Catégorie', type: 'text', editable: false },
    { key: 'dosage', label: 'Dosage', type: 'text', editable: false },
    { 
      key: 'expirationDate', 
      label: 'Date de péremption', 
      type: 'text',
      validate: (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(String(value)),
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value || '-'}</span>
        </div>
      )
    },
    { 
      key: 'stock', 
      label: 'Stock', 
      type: 'number',
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className="text-xs">{value}</span>
          {getStockBadge(value)}
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'Prix',
      type: 'number',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Euro className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{Number(value).toFixed(2)} €</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Statut', 
      editable: false,
      render: (value) => getStatusBadge(value)
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      editable: false,
      render: (_, medication) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(medication)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(medication)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="mr-2 h-4 w-4" />
              Réapprovisionner
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => onDelete(medication)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <EditableTable
      data={medications}
      columns={columns}
      onUpdate={onUpdate}
      onCreate={async (pending) => {
        const payload = {
          name: String((pending as any).name || ''),
          category: String((pending as any).category || ''),
          dosage: String((pending as any).dosage || ''),
          stock: Number((pending as any).stock || 0),
          supplier: String((pending as any).supplier || ''),
          price: Number((pending as any).price || 0),
          status: String((pending as any).status || 'Actif'),
          description: (pending as any).description || undefined,
          expirationDate: (pending as any).expirationDate || undefined,
        };
        await MedicationService.createMedication(payload);
      }}
      keyField="id"
    />
  );
}
