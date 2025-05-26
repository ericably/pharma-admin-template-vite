
import { useState } from "react";
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
import { Edit, Trash2 } from "lucide-react";
import type { Pharmacist } from "@/api/services/PharmacistService";

interface PharmacistsListProps {
  pharmacists: Pharmacist[];
  onEdit: (pharmacist: Pharmacist) => void;
  onDelete: (pharmacist: Pharmacist) => void;
}

export function PharmacistsList({ pharmacists, onEdit, onDelete }: PharmacistsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>N° Licence</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pharmacists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Aucun pharmacien trouvé
              </TableCell>
            </TableRow>
          ) : (
            pharmacists.map((pharmacist) => (
              <TableRow key={pharmacist.id}>
                <TableCell>{pharmacist.lastName}</TableCell>
                <TableCell>{pharmacist.email}</TableCell>
                <TableCell>{pharmacist.phone}</TableCell>
                <TableCell>{pharmacist.licenseNumber}</TableCell>
                <TableCell>
                  <Badge variant={pharmacist.status === "Actif" ? "default" : "secondary"}>
                    {pharmacist.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(pharmacist)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(pharmacist)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
