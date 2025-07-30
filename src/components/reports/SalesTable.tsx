
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface SalesData {
  date: string;
  product: string;
  quantity: number;
  amount: number;
}

export const SalesTable = ({ data }: { data: SalesData[] }) => {
  return (
    <div className="mt-2">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="h-8 px-2 text-xs">Date</TableHead>
            <TableHead className="h-8 px-2 text-xs">Produit</TableHead>
            <TableHead className="h-8 px-2 text-xs">Quantité</TableHead>
            <TableHead className="h-8 px-2 text-right text-xs">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((sale, index) => (
            <TableRow key={index} className="text-xs">
              <TableCell className="py-1 px-2 text-xs">{sale.date}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{sale.product}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{sale.quantity}</TableCell>
              <TableCell className="py-1 px-2 text-right text-xs">{sale.amount.toFixed(2)} €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
