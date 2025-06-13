
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/api/services/PatientService";
import MedicationService from "@/api/services/MedicationService";
import PrescriptionService, { PrescriptionItem } from "@/api/services/PrescriptionService";
import PrescriptionItemsForm from "./PrescriptionItemsForm";

interface PrescriptionCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess?: () => void;
}

interface PrescriptionFormData {
  doctorId: string;
  notes: string;
}

export function PrescriptionCreateForm({ isOpen, onClose, patient, onSuccess }: PrescriptionCreateFormProps) {
  const [items, setItems] = useState<PrescriptionItem[]>([{
    medication: "",
    medicationId: "",
    dosage: "",
    quantity: 1,
    instructions: ""
  }]);
  
  const { toast } = useToast();
  
  const form = useForm<PrescriptionFormData>({
    defaultValues: {
      doctorId: "1", // Default doctor ID
      notes: ""
    }
  });

  const { data: medicationsData } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationService.getAllMedications()
  });

  const medications = medicationsData?.items || [];

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      // Validate that at least one medication is selected
      const validItems = items.filter(item => item.medicationId && item.dosage && item.quantity > 0);
      
      if (validItems.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez ajouter au moins un médicament à l'ordonnance.",
          variant: "destructive",
        });
        return;
      }

      const prescriptionData = {
        patient: patient.name,
        patientId: patient.id || "",
        doctorId: data.doctorId,
        doctor: "Dr. Système", // Default doctor name
        date: new Date().toISOString().split('T')[0],
        status: 'En attente' as const,
        notes: data.notes,
        items: validItems
      };

      await PrescriptionService.createPrescription(prescriptionData);
      
      toast({
        title: "Succès",
        description: "L'ordonnance a été créée avec succès.",
        variant: "default",
      });
      
      form.reset();
      setItems([{
        medication: "",
        medicationId: "",
        dosage: "",
        quantity: 1,
        instructions: ""
      }]);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'ordonnance.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setItems([{
      medication: "",
      medicationId: "",
      dosage: "",
      quantity: 1,
      instructions: ""
    }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nouvelle Ordonnance - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informations Patient</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nom:</span> {patient.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {patient.email}
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span> {patient.phone}
                </div>
                <div>
                  <span className="font-medium">Assurance:</span> {patient.insurance || "Non renseignée"}
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médecin prescripteur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ID du médecin" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prescription Items */}
            <PrescriptionItemsForm
              items={items}
              medications={medications}
              onItemsChange={setItems}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes médicales</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notes et instructions particulières..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                Créer l'Ordonnance
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
