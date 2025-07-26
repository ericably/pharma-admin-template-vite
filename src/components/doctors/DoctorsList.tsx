
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
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          {value}
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(doctor)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(doctor)}>
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
              onClick={() => onDelete(doctor)}
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
      data={doctors}
      columns={columns}
      onUpdate={onUpdate}
      keyField="id"
    />
  );
}
