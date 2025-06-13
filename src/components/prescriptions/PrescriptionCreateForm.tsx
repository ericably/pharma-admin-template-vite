
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
import { Plus, Trash2, Check, ChevronsUpDown, ShoppingCart } from "lucide-react";
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
    updateItem(index, 'medicationName', medication.name);
    updateItem(index, 'medicationId', medication.id?.toString() || '');
    updateItem(index, 'price', medication.price);
    setOpenMedicationCombobox(null);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const onSubmit = async () => {
    try {
      const validItems = items.filter(item => item.medicationId && item.quantity > 0);
      
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nouvelle Commande - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {patient.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {patient.email}
              </div>
            </div>
          </div>

          {/* Products Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Produits</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Produit {index + 1}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {item.medicationName || "Sélectionner un produit"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher un produit..." />
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
                                      <span>{medication.name}</span>
                                      <div className="text-xs text-gray-500">{medication.price}€</div>
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
                    <Label>Prix Total</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center font-medium">
                      {(item.price * item.quantity).toFixed(2)}€
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total de la commande:</span>
                <span className="text-green-600">{getTotalPrice().toFixed(2)}€</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={onSubmit} 
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              disabled={items.filter(item => item.medicationId && item.quantity > 0).length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Créer la Commande ({getTotalPrice().toFixed(2)}€)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
