
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Medication } from "@/api/services/MedicationService";
import { PrescriptionItem } from "@/api/services/PrescriptionService";

interface PrescriptionItemsFormProps {
  items: PrescriptionItem[];
  medications: Medication[];
  onItemsChange: (items: PrescriptionItem[]) => void;
}

export default function PrescriptionItemsForm({ items, medications, onItemsChange }: PrescriptionItemsFormProps) {
  const [openMedicationCombobox, setOpenMedicationCombobox] = useState<number | null>(null);

  const addItem = () => {
    const newItem: PrescriptionItem = {
      medication: "",
      medicationId: "",
      dosage: "",
      quantity: 1,
      instructions: ""
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const selectMedication = (index: number, medication: Medication) => {
    updateItem(index, 'medication', `${medication.name} ${medication.dosage}`);
    updateItem(index, 'medicationId', medication.id?.toString() || '');
    setOpenMedicationCombobox(null);
  };

  const getSelectedMedicationName = (item: PrescriptionItem) => {
    return item.medication || "Sélectionner un médicament";
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="ml-1">Rupture</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 ml-1">Stock Faible ({stock})</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-1">En Stock ({stock})</Badge>;
    }
  };

  const availableMedications = medications.filter(medication => 
    medication.status === 'Actif' && medication.stock > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Médicaments</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un médicament
        </Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Médicament {index + 1}</span>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Médicament</Label>
              <Popover 
                open={openMedicationCombobox === index} 
                onOpenChange={(open) => setOpenMedicationCombobox(open ? index : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMedicationCombobox === index}
                    className="w-full justify-between"
                  >
                    {getSelectedMedicationName(item)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un médicament..." />
                    <CommandList>
                      <CommandEmpty>Aucun médicament trouvé.</CommandEmpty>
                      <CommandGroup>
                        {availableMedications.map((medication) => (
                          <CommandItem
                            key={medication.id}
                            value={`${medication.name} ${medication.dosage}`}
                            onSelect={() => selectMedication(index, medication)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                item.medicationId === medication.id?.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>{medication.name} {medication.dosage}</span>
                              {getStockBadge(medication.stock)}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Posologie</Label>
              <Input
                placeholder="ex: 1 comprimé 3x par jour"
                value={item.dosage}
                onChange={(e) => updateItem(index, 'dosage', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Input
                placeholder="Instructions spécifiques"
                value={item.instructions}
                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Aucun médicament ajouté</p>
          <Button type="button" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le premier médicament
          </Button>
        </div>
      )}
    </div>
  );
}
