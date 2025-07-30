
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText, Barcode } from "lucide-react";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import type { Supplier } from "@/api/services/SupplierService";

interface SuppliersListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onView?: (supplier: Supplier) => void;
  onUpdate: (supplier: Supplier, updates: Partial<Supplier>) => Promise<void>;
}

export function SuppliersList({ suppliers, onEdit, onDelete, onView, onUpdate }: SuppliersListProps) {
  const getStatusBadge = (status: boolean) => {
    return status ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  const columns: EditableColumn<Supplier>[] = [
    { key: 'id', label: 'ID', editable: false },
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    { key: 'category', label: 'Catégorie', type: 'text' },
    { 
      key: 'licenseNumber', 
      label: 'N° Licence',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Barcode className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
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
      render: (_, supplier) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(supplier)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(supplier)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FilePlus className="mr-2 h-4 w-4" />
              Nouvelle Commande
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Voir Historique
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => onDelete(supplier)}
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
      data={suppliers}
      columns={columns}
      onUpdate={onUpdate}
      keyField="id"
    />
  );
}
