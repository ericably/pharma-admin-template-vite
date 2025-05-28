
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
import { Edit, Trash2, MoreVertical, Eye, FilePlus, FileText, Barcode } from "lucide-react";
import type { Supplier } from "@/api/services/SupplierService";

interface SuppliersListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onView?: (supplier: Supplier) => void;
}

export function SuppliersList({ suppliers, onEdit, onDelete, onView }: SuppliersListProps) {
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
            <TableHead>Catégorie</TableHead>
            <TableHead>N° Licence</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Aucun fournisseur trouvé
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.id}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-muted-foreground" />
                    {supplier.licenseNumber}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
