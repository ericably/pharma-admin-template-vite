
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
      <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm hover:from-emerald-600 hover:to-emerald-700">
        Actif
      </Badge> :
      <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm hover:from-gray-500 hover:to-gray-600">
        Inactif
      </Badge>;
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
            <TableHead className="font-semibold text-gray-700">ID</TableHead>
            <TableHead className="font-semibold text-gray-700">Nom</TableHead>
            <TableHead className="font-semibold text-gray-700">Email</TableHead>
            <TableHead className="font-semibold text-gray-700">Téléphone</TableHead>
            <TableHead className="font-semibold text-gray-700">N° Licence</TableHead>
            <TableHead className="font-semibold text-gray-700">Statut</TableHead>
            <TableHead className="w-[80px] font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pharmacists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="text-lg font-medium">Aucun pharmacien trouvé</div>
                  <div className="text-sm text-gray-400">Commencez par ajouter votre premier pharmacien</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pharmacists.map((pharmacist, index) => (
              <TableRow
                key={pharmacist.id}
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <TableCell className="font-medium text-blue-600">#{pharmacist.id}</TableCell>
                <TableCell className="font-medium text-gray-800">{pharmacist.lastName}</TableCell>
                <TableCell className="text-gray-600">{pharmacist.email}</TableCell>
                <TableCell className="text-gray-600">{pharmacist.phone}</TableCell>
                <TableCell className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {pharmacist.licenseNumber}
                </TableCell>
                <TableCell>{getStatusBadge(pharmacist.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100 transition-colors duration-200">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white shadow-xl border-0 rounded-xl p-2">
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(pharmacist)}
                          className="hover:bg-blue-50 text-gray-700 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-600" />
                          Voir Détails
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit(pharmacist)}
                        className="hover:bg-emerald-50 text-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="mr-2 h-4 w-4 text-emerald-600" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-purple-50 text-gray-700 rounded-lg transition-colors duration-200">
                        <FilePlus className="mr-2 h-4 w-4 text-purple-600" />
                        Nouvelle Ordonnance
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-amber-50 text-gray-700 rounded-lg transition-colors duration-200">
                        <FileText className="mr-2 h-4 w-4 text-amber-600" />
                        Voir Historique
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="hover:bg-red-50 text-red-600 rounded-lg transition-colors duration-200"
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
