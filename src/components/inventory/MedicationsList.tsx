
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
import { Edit, Trash2, MoreVertical, Eye, Package, AlertTriangle } from "lucide-react";
import type { Medication } from "@/api/services/MedicationService";

interface MedicationsListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
  onView?: (medication: Medication) => void;
}

export function MedicationsList({ medications, onEdit, onDelete, onView }: MedicationsListProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Aucun médicament trouvé
              </TableCell>
            </TableRow>
          ) : (
            medications.map((medication) => (
              <TableRow key={medication.id}>
                <TableCell className="font-medium">{medication.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {medication.stock < 10 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    {medication.name}
                  </div>
                </TableCell>
                <TableCell>{medication.category}</TableCell>
                <TableCell>{medication.dosage}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{medication.stock}</span>
                    {getStockBadge(medication.stock)}
                  </div>
                </TableCell>
                <TableCell>{medication.price.toFixed(2)} €</TableCell>
                <TableCell>{getStatusBadge(medication.status)}</TableCell>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
