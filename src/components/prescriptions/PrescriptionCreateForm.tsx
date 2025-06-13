import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/api/services/PatientService";
import MedicationService from "@/api/services/MedicationService";
import PrescriptionService from "@/api/services/PrescriptionService";
import { Plus, Trash2, Check, ChevronsUpDown, ShoppingCart, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrescriptionCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess?: () => void;
}

interface OrderItem {
  medicationId: string;
  medicationName: string;
  price: number;
  quantity: number;
}

export function PrescriptionCreateForm({ isOpen, onClose, patient, onSuccess }: PrescriptionCreateFormProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [openMedicationCombobox, setOpenMedicationCombobox] = useState<number | null>(null);
  
  const { toast } = useToast();

  const { data: medicationsData } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationService.getAllMedications()
  });

  const medications = medicationsData?.items || [];

  // Initialiser avec un produit vide quand le formulaire s'ouvre
  useEffect(() => {
    if (isOpen && items.length === 0) {
      const initialItem: OrderItem = {
        medicationId: "",
        medicationName: "",
        price: 0,
        quantity: 1
      };
      setItems([initialItem]);
    }
  }, [isOpen, items.length]);

  const addItem = () => {
    const newItem: OrderItem = {
      medicationId: "",
      medicationName: "",
      price: 0,
      quantity: 1
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const selectMedication = (index: number, medication: any) => {
    console.log('Sélection du médicament:', medication);
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      medicationName: medication.name,
      medicationId: medication.id?.toString() || '',
      price: medication.price
    };
    setItems(updatedItems);
    setOpenMedicationCombobox(null);
    console.log('Items après sélection:', updatedItems);
  };

  const incrementQuantity = (index: number) => {
    const currentQuantity = items[index].quantity;
    updateItem(index, 'quantity', currentQuantity + 1);
  };

  const decrementQuantity = (index: number) => {
    const currentQuantity = items[index].quantity;
    if (currentQuantity > 1) {
      updateItem(index, 'quantity', currentQuantity - 1);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getValidItems = () => {
    return items.filter(item => item.medicationId && item.medicationName && item.quantity > 0);
  };

  const onSubmit = async () => {
    try {
      const validItems = getValidItems();
      
      console.log('Items valides pour soumission:', validItems);
      
      if (validItems.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner au moins un produit valide.",
          variant: "destructive",
        });
        return;
      }

      const prescriptionData = {
        patient: patient.name,
        patientId: patient.id || "",
        doctorId: "1",
        doctor: "Vente directe",
        date: new Date().toISOString().split('T')[0],
        status: 'Prêt pour retrait' as const,
        notes: `Commande directe - Total: ${getTotalPrice().toFixed(2)}€`,
        items: validItems.map(item => ({
          medication: item.medicationName,
          medicationId: item.medicationId,
          dosage: "Selon besoin",
          quantity: item.quantity,
          instructions: ""
        }))
      };

      await PrescriptionService.createPrescription(prescriptionData);
      
      toast({
        title: "Succès",
        description: `Commande créée avec succès. Total: ${getTotalPrice().toFixed(2)}€`,
        variant: "default",
      });
      
      setItems([]);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la commande.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setItems([]);
    onClose();
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="text-xs">Rupture</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">Faible</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">Stock</Badge>;
    }
  };

  const availableMedications = medications.filter(medication => 
    medication.status === 'Actif' && medication.stock > 0
  );

  console.log('Items actuels:', items);
  console.log('Médicaments disponibles:', availableMedications);
  console.log('Items valides:', getValidItems());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Commande Rapide - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info compacte */}
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-800">{patient.name}</span>
                <span className="text-blue-600 text-sm">{patient.email}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{getTotalPrice().toFixed(2)}€</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Produits - Interface très compacte */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Sélection produit - Plus compact */}
                  <div className="flex-1 min-w-0">
                    <Popover 
                      open={openMedicationCombobox === index} 
                      onOpenChange={(open) => setOpenMedicationCombobox(open ? index : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full h-10 justify-between text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">
                              {item.medicationName || "Sélectionner..."}
                            </span>
                            {item.price > 0 && (
                              <span className="text-sm text-green-600 font-medium">{item.price}€</span>
                            )}
                          </div>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command>
                          <CommandInput placeholder="Rechercher..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                            <CommandGroup>
                              {availableMedications.map((medication) => (
                                <CommandItem
                                  key={medication.id}
                                  value={medication.name}
                                  onSelect={() => selectMedication(index, medication)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      item.medicationId === medication.id?.toString() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <span className="font-medium">{medication.name}</span>
                                      <div className="text-sm text-gray-500">{medication.price}€</div>
                                    </div>
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

                  {/* Quantité compacte */}
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementQuantity(index)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 text-center w-8 text-sm font-medium">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementQuantity(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Total ligne */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-lg font-bold text-green-600">
                      {(item.price * item.quantity).toFixed(2)}€
                    </div>
                  </div>

                  {/* Supprimer */}
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Bouton ajouter produit - Plus compact */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={addItem}
              className="w-full h-10 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={onSubmit} 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
              disabled={getValidItems().length === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Valider • {getTotalPrice().toFixed(2)}€
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
