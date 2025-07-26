
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText, UserCircle, Badge as BadgeIcon } from "lucide-react";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import type { Pharmacist } from "@/api/services/PharmacistService";

interface PharmacistsListProps {
  pharmacists: Pharmacist[];
  onEdit: (pharmacist: Pharmacist) => void;
  onDelete: (pharmacist: Pharmacist) => void;
  onView?: (pharmacist: Pharmacist) => void;
  onUpdate: (pharmacist: Pharmacist, updates: Partial<Pharmacist>) => Promise<void>;
}

export function PharmacistsList({ pharmacists, onEdit, onDelete, onView, onUpdate }: PharmacistsListProps) {
  const getStatusBadge = (status: boolean) => {
    return status ? 
      <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm hover:from-emerald-600 hover:to-emerald-700">
        Actif
      </Badge> :
      <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm hover:from-gray-500 hover:to-gray-600">
        Inactif
      </Badge>;
  };

  const columns: EditableColumn<Pharmacist>[] = [
    { key: 'id', label: 'ID', editable: false },
    {
      key: 'name',
      label: 'Nom',
      type: 'text',
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      )
    },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    {
      key: 'licenseNumber',
      label: 'N° Licence',
      render: (value) => (
        <div className="flex items-center gap-2">
          <BadgeIcon className="h-4 w-4 text-muted-foreground" />
          {value}
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
      render: (_, pharmacist) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(pharmacist)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(pharmacist)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FilePlus className="mr-2 h-4 w-4" />
              Nouvelle Ordonnance
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Voir Historique
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(pharmacist)}
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
      data={pharmacists}
      columns={columns}
      onUpdate={onUpdate}
      keyField="id"
    />
  );
}
