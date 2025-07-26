
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
import {boolean} from "zod";

interface PatientsListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onView?: (patient: Patient) => void;
  onCreatePrescription?: (patient: Patient) => void;
  onUpdate: (patient: Patient, updates: Partial<Patient>) => Promise<void>;
}

export function PatientsList({ patients, onEdit, onDelete, onView, onCreatePrescription }: PatientsListProps) {
  const getStatusBadge = (status: boolean) => {
    return !!status === true ?
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Inactif</Badge>;
  };

  const columns: EditableColumn<Patient>[] = [
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
      key: 'insurance',
      label: 'Assurance',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
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
      render: (_, patient) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-4 w-4" />
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
