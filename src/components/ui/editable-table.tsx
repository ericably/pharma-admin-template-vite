import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

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
  onCreate?: (newItem: Partial<T>) => Promise<void>;
  className?: string;
  keyField?: string;
  onSort?: (column: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface EditingCell {
  rowId: string | number;
  columnKey: string;
}

// Portal dropdown to render search results outside of table overflow
function SearchResultsPortal({ anchorRef, dropdownRef, items, displayField, onSelect }: { anchorRef: React.RefObject<HTMLInputElement>; dropdownRef: React.RefObject<HTMLDivElement>; items: any[]; displayField: string; onSelect: (item: any) => void; }) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const content = (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto text-xs"
      style={{ position: 'fixed', top: pos.top + 4, left: pos.left, width: Math.max(pos.width, 300), zIndex: 10000 }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
          onClick={() => onSelect(item)}
        >
          <div className="font-medium">{item[displayField] ?? ''}</div>
          {item.category && (
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">{item.category} {item.dosage ? `- ${item.dosage}` : ''}</div>
          )}
        </div>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}

export function EditableTable<T extends Record<string, any>>({
  data,
  columns,
  onUpdate,
  onCreate,
  className,
  keyField = 'id',
  onSort,
  sortBy,
  sortDirection
}: EditableTableProps<T>) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingRow, setPendingRow] = useState<Partial<T> | null>(null);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

    // If we're editing the pending "new" row, just update local state
    if (editingCell.rowId === 'new' && pendingRow) {
      const column = columns.find(c => c.key === editingCell.columnKey);
      if (!column) return;
      if (column.validate && !column.validate(editValue)) return;

      setPendingRow(prev => ({ ...(prev || {}), [editingCell.columnKey]: editValue } as Partial<T>));
      setEditingCell(null);
      setEditValue('');
      return;
    }

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
        console.log('Résultats de recherche:', results);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
        console.log('ShowDropdown mis à:', results.length > 0);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleSelectItem = async (item: any, column: EditableColumn<T>) => {
    if (!column.autocomplete) return;

    // If creation flow is enabled, build a pending row locally
    if (onCreate) {
      const newRow: Partial<T> = { [keyField]: 'new' } as any;

      // Prefer using displayField for the edited column
      const displayField = column.autocomplete.displayField;
      (newRow as any)[column.key] = displayField ? item[displayField] ?? '' : item[column.key] ?? '';

      // Copy any matching keys from the selected item into the row
      columns.forEach((c) => {
        if (Object.prototype.hasOwnProperty.call(item, c.key)) {
          (newRow as any)[c.key] = item[c.key];
        }
      });

      setPendingRow(newRow);
      setShowDropdown(false);
      setSearchResults([]);
      setEditingCell(null);
      setEditValue('');
      return;
    }

    // Fallback: legacy behavior delegates population to the provided onSelect
    if (!editingCell) return;

    let rowItem = data.find((d) => d[keyField] === editingCell.rowId);
    if (!rowItem && editingCell.rowId === 'new') {
      rowItem = { [keyField]: 'new' } as T;
    }
    if (!rowItem) return;

    // Fermer le dropdown d'abord
    setShowDropdown(false);
    setSearchResults([]);
    setEditingCell(null);
    setEditValue('');

    // Auto-remplir les autres champs
    try {
      await column.autocomplete.onSelect(item, rowItem);
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
    }
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

  const displayData = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = (a as any)[sortKey as string];
      const bv = (b as any)[sortKey as string];
      const dir = sortDir === 'asc' ? 1 : -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
    return copy;
  }, [data, sortKey, sortDir]);
  return (
    <div className={cn("rounded-md border", className)}>
      <div className="relative w-full overflow-auto" style={{ overflowY: 'visible' }}>
        <table className="w-full caption-bottom text-xs">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              {columns.map((column) => {
                const sortable = column.key !== 'actions';
                const isActive = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    className={cn(
                      "h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs [&:has([role=checkbox])]:pr-0",
                      sortable && "cursor-pointer select-none"
                    )}
                    onClick={() => {
                      if (!sortable) return;
                      if (isActive) {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortKey(column.key);
                        setSortDir('asc');
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {sortable && (
                        isActive ? (
                          sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                        )
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {/* Row d'entrée pour ajouter via API - toujours visible en haut */}
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
                          ref={inputRef}
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
                        <SearchResultsPortal
                          anchorRef={inputRef}
                          dropdownRef={dropdownRef}
                          items={searchResults}
                          displayField={column.autocomplete?.displayField || 'name'}
                          onSelect={(it) => handleSelectItem(it, column)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="h-6 flex items-center text-xs text-muted-foreground">-</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Ligne en attente de validation */}
            {pendingRow && (
              <tr key="new" className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column, idx) => {
                  const cellValue = (pendingRow as any)[column.key];
                  const rowId = 'new';
                  const editing = isEditing(rowId, column.key);
                  const isLast = idx === columns.length - 1;

                  return (
                    <td
                      key={column.key}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {editing ? (
                        <div className="relative" ref={dropdownRef}>
                          <div className="flex items-center gap-1">
                            <Input
                              ref={inputRef}
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
                                aria-label="Valider la modification"
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={cancelEdit}
                                disabled={isLoading}
                                aria-label="Annuler la modification"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          {showDropdown && searchResults.length > 0 && column.type === 'autocomplete' && (
                            <SearchResultsPortal
                              anchorRef={inputRef}
                              dropdownRef={dropdownRef}
                              items={searchResults}
                              displayField={column.autocomplete?.displayField || 'name'}
                              onSelect={(it) => handleSelectItem(it, column)}
                            />
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
                            {column.render ? column.render(cellValue, pendingRow as T) : (cellValue ?? '')}
                          </span>
                        </div>
                      )}

                      {isLast && !editing && (
                        <div className="flex justify-end items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-6 w-6 p-0 rounded-full"
                            aria-label="Valider la création"
                            onClick={async () => {
                              if (!onCreate) return;
                              setIsLoading(true);
                              try {
                                await onCreate(pendingRow as T);
                                window.dispatchEvent(new CustomEvent('editableTable:itemCreated'));
                                setPendingRow(null);
                                setEditingCell(null);
                                setEditValue('');
                              } catch (error) {
                                console.error('Erreur lors de la création:', error);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 rounded-full"
                            aria-label="Annuler"
                            onClick={() => setPendingRow(null)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Lignes de données */}
            {displayData.map((item) => (
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
                              ref={inputRef}
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
                            <SearchResultsPortal
                              anchorRef={inputRef}
                              dropdownRef={dropdownRef}
                              items={searchResults}
                              displayField={column.autocomplete?.displayField || 'name'}
                              onSelect={(it) => handleSelectItem(it, column)}
                            />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}