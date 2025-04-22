
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface SalesData {
  date: string;
  product: string;
  quantity: number;
  amount: number;
}

export const SalesTable = ({ data }: { data: SalesData[] }) => {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((sale, index) => (
            <TableRow key={index}>
              <TableCell>{sale.date}</TableCell>
              <TableCell>{sale.product}</TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell className="text-right">{sale.amount.toFixed(2)} €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
