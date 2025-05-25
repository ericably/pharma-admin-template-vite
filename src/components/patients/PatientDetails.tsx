
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PatientService, { Patient } from "@/api/services/PatientService";

interface PatientDetailsProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
  mode: "view" | "edit";
}

const PatientDetails = ({
  patient,
  isOpen,
  onClose,
  onUpdate,
  mode,
}: PatientDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const { toast } = useToast();

  // Update local state when patient prop changes - fixed with useEffect
  useEffect(() => {
    if (patient) {
      setPatientData({ ...patient });
    }
  }, [patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (patientData) {
      setPatientData({ ...patientData, [name]: value });
    }
  };

  const handleStatusChange = (status: string) => {
    if (patientData) {
      setPatientData({ ...patientData, status });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientData || !patient?.id) return;

    setIsLoading(true);
    try {
      const updatedPatient = await PatientService.updatePatient(
        patient.id,
        patientData
      );
      
      onUpdate(updatedPatient);
      
      toast({
        title: "Succès",
        description: "Les informations du patient ont été mises à jour.",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des informations du patient.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient || !patientData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "view" ? "Détails du patient" : "Modifier le patient"}
          </SheetTitle>
          <SheetDescription>
            {mode === "view"
              ? "Consultez les informations du patient"
              : "Modifiez les informations du patient"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="id">ID du patient</Label>
              <Input
                id="id"
                name="id"
                value={patientData.id || ""}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                value={patientData.name}
                onChange={handleInputChange}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={patientData.email}
                onChange={handleInputChange}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={patientData.phone}
                onChange={handleInputChange}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dob">Date de naissance</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={patientData.birthdate}
                onChange={handleInputChange}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={patientData.address || ""}
                onChange={handleInputChange}
                disabled={mode === "view"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="insurance">Assurance</Label>
              <Input
                id="insurance"
                name="insurance"
                value={patientData.insurance || ""}
                onChange={handleInputChange}
                disabled={mode === "view"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={patientData.status === "Active" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Active")}
                  disabled={mode === "view"}
                >
                  Actif
                </Button>
                <Button
                  type="button"
                  variant={patientData.status === "Inactive" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Inactive")}
                  disabled={mode === "view"}
                >
                  Inactif
                </Button>
              </div>
            </div>
          </div>

          {mode === "edit" && (
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}

          {mode === "view" && (
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={onClose}>
                Fermer
              </Button>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default PatientDetails;
