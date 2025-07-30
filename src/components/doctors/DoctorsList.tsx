
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText, UserCircle } from "lucide-react";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import type { Doctor } from "@/api/services/DoctorService";

interface DoctorsListProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onView?: (doctor: Doctor) => void;
  onUpdate: (doctor: Doctor, updates: Partial<Doctor>) => Promise<void>;
}

export function DoctorsList({ doctors, onEdit, onDelete, onView, onUpdate }: DoctorsListProps) {
  const getStatusBadge = (status: boolean) => {
    return status ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  const columns: EditableColumn<Doctor>[] = [
    { key: 'id', label: 'ID', editable: false },
    { 
      key: 'name', 
      label: 'Nom', 
      type: 'text',
      render: (value) => (
        <div className="flex items-center gap-1">
          <UserCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    { key: 'speciality', label: 'Spécialité', type: 'text' },
    { key: 'licenseNumber', label: 'N° Licence', type: 'text' },
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
      render: (_, doctor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(doctor)} className="text-xs">
                <Eye className="mr-1 h-3 w-3" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(doctor)} className="text-xs">
              <Edit className="mr-1 h-3 w-3" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <FilePlus className="mr-1 h-3 w-3" />
              Nouvelle Ordonnance
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              Voir Historique
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 text-xs"
              onClick={() => onDelete(doctor)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <EditableTable
      data={doctors}
      columns={columns}
      onUpdate={onUpdate}
      keyField="id"
    />
  );
}
