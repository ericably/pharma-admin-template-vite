
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText, UserCircle, Shield } from "lucide-react";
import { EditableTable, EditableColumn } from "@/components/ui/editable-table";
import type { Patient } from "@/api/services/PatientService";

interface PatientsListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onView?: (patient: Patient) => void;
  onCreatePrescription?: (patient: Patient) => void;
  onUpdate: (patient: Patient, updates: Partial<Patient>) => Promise<void>;
}

export function PatientsList({ patients, onEdit, onDelete, onView, onCreatePrescription, onUpdate }: PatientsListProps) {
  const getStatusBadge = (status: string) => {
    return status === "Actif" ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  const columns: EditableColumn<Patient>[] = [
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
    { 
      key: 'insurance', 
      label: 'Assurance',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
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
      render: (_, patient) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(patient)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir Détails
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(patient)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            {onCreatePrescription && (
              <DropdownMenuItem onClick={() => onCreatePrescription(patient)}>
                <FilePlus className="mr-2 h-4 w-4" />
                Nouvelle Ordonnance
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Voir Historique
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => onDelete(patient)}
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
      data={patients}
      columns={columns}
      onUpdate={onUpdate}
      keyField="id"
    />
  );
}
