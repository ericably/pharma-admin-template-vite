import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

export interface EditableColumn<T = any> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'autocomplete';
  editable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  validate?: (value: any) => boolean;
  autocomplete?: {
    searchFn: (query: string) => Promise<any[]>;
    onSelect: (item: any, rowItem: T) => void;
    displayField: string;
    minChars?: number;
  };
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const startEdit = (rowId: string | number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowId, columnKey });
    setEditValue(String(currentValue || ''));
    setSearchResults([]);
    setShowDropdown(false);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setSearchResults([]);
    setShowDropdown(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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

  const handleSearch = async (query: string, column: EditableColumn<T>) => {
    if (!column.autocomplete?.searchFn) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const minChars = column.autocomplete.minChars || 1;
    if (query.length < minChars) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await column.autocomplete!.searchFn(query);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleSelectItem = (item: any, column: EditableColumn<T>) => {
    if (!editingCell || !column.autocomplete) return;
    
    let rowItem = data.find(d => d[keyField] === editingCell.rowId);
    
    // Si c'est une nouvelle ligne (rowId = 'new'), créer un objet temporaire
    if (!rowItem && editingCell.rowId === 'new') {
      rowItem = { [keyField]: 'new' } as T;
    }
    
    if (!rowItem) return;

    setEditValue(item[column.autocomplete.displayField]);
    setShowDropdown(false);
    setSearchResults([]);
    
    // Auto-remplir les autres champs
    column.autocomplete.onSelect(item, rowItem);
    
    // Réinitialiser l'état d'édition après la sélection
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, column?: EditableColumn<T>) => {
    if (e.key === 'Enter') {
      if (showDropdown && searchResults.length > 0 && column?.type === 'autocomplete') {
        handleSelectItem(searchResults[0], column);
      } else {
        saveEdit();
      }
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'ArrowDown' && showDropdown) {
      e.preventDefault();
      // Focus premier élément de la liste
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0"
                  >
                    {column.type === 'autocomplete' && column.key === 'name' ? (
                      <div className="relative" ref={dropdownRef}>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            value={editingCell?.rowId === 'new' && editingCell?.columnKey === column.key ? editValue : ''}
                            onChange={(e) => {
                              setEditValue(e.target.value);
                              if (column.type === 'autocomplete') {
                                handleSearch(e.target.value, column);
                              }
                            }}
                            onKeyDown={(e) => handleKeyPress(e, column)}
                            className="h-6 text-xs"
                            placeholder="Tapez pour rechercher et ajouter..."
                            onFocus={() => {
                              setEditingCell({ rowId: 'new', columnKey: column.key });
                            }}
                          />
                        </div>
                        {showDropdown && searchResults.length > 0 && editingCell?.rowId === 'new' && editingCell?.columnKey === column.key && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.map((item, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 text-xs hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                                onClick={() => handleSelectItem(item, column)}
                              >
                                <div className="font-medium">{item[column.autocomplete?.displayField || 'name']}</div>
                                {item.category && (
                                  <div className="text-muted-foreground text-xs">{item.category} - {item.dosage}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-6 flex items-center text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                  </td>
                ))}
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
                          <div className="relative" ref={dropdownRef}>
                            <div className="flex items-center gap-1">
                              <Input
                                type={column.type === 'autocomplete' ? 'text' : (column.type || 'text')}
                                value={editValue}
                                onChange={(e) => {
                                  setEditValue(e.target.value);
                                  if (column.type === 'autocomplete') {
                                    handleSearch(e.target.value, column);
                                  }
                                }}
                                onKeyDown={(e) => handleKeyPress(e, column)}
                                className="h-6 text-xs"
                                autoFocus
                                placeholder={column.type === 'autocomplete' ? 'Tapez pour rechercher...' : ''}
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
                            {showDropdown && searchResults.length > 0 && column.type === 'autocomplete' && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map((item, index) => (
                                  <div
                                    key={index}
                                    className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleSelectItem(item, column)}
                                  >
                                    <div className="font-medium">{item[column.autocomplete?.displayField || 'name']}</div>
                                    {item.category && (
                                      <div className="text-gray-500 text-xs">{item.category} - {item.dosage}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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