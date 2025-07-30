import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

export interface EditableColumn<T = any> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'tel';
  editable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  validate?: (value: any) => boolean;
}

interface EditableTableProps<T = any> {
  data: T[];
  columns: EditableColumn<T>[];
  onUpdate: (item: T, updates: Partial<T>) => Promise<void>;
  className?: string;
  keyField?: string;
}

interface EditingCell {
  rowId: string | number;
  columnKey: string;
}

export function EditableTable<T extends Record<string, any>>({
  data,
  columns,
  onUpdate,
  className,
  keyField = 'id'
}: EditableTableProps<T>) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startEdit = (rowId: string | number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowId, columnKey });
    setEditValue(String(currentValue || ''));
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const item = data.find(d => d[keyField] === editingCell.rowId);
    if (!item) return;

    const column = columns.find(c => c.key === editingCell.columnKey);
    if (!column) return;

    // Validation
    if (column.validate && !column.validate(editValue)) {
      return;
    }

    setIsLoading(true);
    try {
      const updates = { [editingCell.columnKey]: editValue } as Partial<T>;
      await onUpdate(item, updates);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const isEditing = (rowId: string | number, columnKey: string) => {
    return editingCell?.rowId === rowId && editingCell?.columnKey === columnKey;
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-xs">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs [&:has([role=checkbox])]:pr-0"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data.length === 0 ? (
              <tr className="border-b transition-colors hover:bg-muted/50">
                <td 
                  colSpan={columns.length} 
                  className="p-2 align-middle text-center py-4 text-muted-foreground text-xs"
                >
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item[keyField]}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {columns.map((column) => {
                    const cellValue = item[column.key];
                    const rowId = item[keyField];
                    const editing = isEditing(rowId, column.key);

                    return (
                      <td
                        key={column.key}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0"
                      >
                        {editing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type={column.type || 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="h-6 text-xs"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={saveEdit}
                                disabled={isLoading}
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={cancelEdit}
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={cn(
                              "flex items-center gap-1 min-h-[24px] text-xs",
                              column.editable !== false && "cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 -my-0.5"
                            )}
                            onClick={() => {
                              if (column.editable !== false) {
                                startEdit(rowId, column.key, cellValue);
                              }
                            }}
                          >
                            <span className="flex-1">
                              {column.render ? column.render(cellValue, item) : cellValue}
                            </span>
                            {column.editable !== false && (
                              <Edit className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}