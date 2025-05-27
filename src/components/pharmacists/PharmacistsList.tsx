
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText } from "lucide-react";
import type { Pharmacist } from "@/api/services/PharmacistService";

interface PharmacistsListProps {
  pharmacists: Pharmacist[];
  onEdit: (pharmacist: Pharmacist) => void;
  onDelete: (pharmacist: Pharmacist) => void;
  onView?: (pharmacist: Pharmacist) => void;
}

export function PharmacistsList({ pharmacists, onEdit, onDelete, onView }: PharmacistsListProps) {
  const getStatusBadge = (status: boolean) => {
    return status ?
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>N° Licence</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pharmacists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                Aucun pharmacien trouvé
              </TableCell>
            </TableRow>
          ) : (
            pharmacists.map((pharmacist) => (
              <TableRow key={pharmacist.id}>
                <TableCell className="font-medium">{pharmacist.id}</TableCell>
                <TableCell>{pharmacist.lastName}  {pharmacist.firstName}</TableCell>
                <TableCell>{pharmacist.email}</TableCell>
                <TableCell>{pharmacist.phone}</TableCell>
                <TableCell>{pharmacist.licenseNumber}</TableCell>
                <TableCell>{getStatusBadge(pharmacist.status)}</TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
