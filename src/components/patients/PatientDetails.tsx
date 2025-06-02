import React, { useState, useEffect } from "react";
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
  const [patientData, setPatientData] = useState<Omit<Patient, '@id' | 'id'>>({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    insurance: '',
    status: 'Actif'
  });
  const { toast } = useToast();

  // Update local state when patient prop changes
  useEffect(() => {
    if (patient && mode === "view") {
      setPatientData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        address: patient.address || '',
        insurance: patient.insurance || '',
        status: patient.status
      });
    } else if (patient && mode === "edit") {
      setPatientData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        address: patient.address || '',
        insurance: patient.insurance || '',
        status: patient.status
      });
    } else if (!patient && mode === "edit") {
      // Reset form for new patient
      setPatientData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        insurance: '',
        status: 'Actif'
      });
    }
  }, [patient, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: string) => {
    setPatientData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      let result: Patient;
      
      if (patient?.id) {
        // Update existing patient
        result = await PatientService.updatePatient(patient.id, patientData);
        toast({
          title: "Succès",
          description: "Les informations du patient ont été mises à jour.",
          variant: "default",
        });
      } else {
        // Create new patient
        result = await PatientService.createPatient(patientData);
        toast({
          title: "Succès",
          description: "Le patient a été créé avec succès.",
          variant: "default",
        });
      }
      
      onUpdate(result);
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: "Erreur",
        description: patient?.id 
          ? "Échec de la mise à jour des informations du patient."
          : "Échec de la création du patient.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "view") return "Détails du patient";
    return patient ? "Modifier le patient" : "Nouveau patient";
  };

  const getDescription = () => {
    if (mode === "view") return "Consultez les informations du patient";
    return patient ? "Modifiez les informations du patient" : "Ajoutez un nouveau patient";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            {patient?.id && (
              <div className="grid gap-2">
                <Label htmlFor="id">ID du patient</Label>
                <Input
                  id="id"
                  name="id"
                  value={patient.id || ""}
                  disabled
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                value={patientData.fullName}
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
              <Label htmlFor="birthdate">Date de naissance</Label>
              <Input
                id="birthdate"
                name="birthdate"
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
                value={patientData.address}
                onChange={handleInputChange}
                disabled={mode === "view"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="insurance">Assurance</Label>
              <Input
                id="insurance"
                name="insurance"
                value={patientData.insurance}
                onChange={handleInputChange}
                disabled={mode === "view"}
              />
            </div>

            <div className="grid gap-2">
              <Label>Statut</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={patientData.status === "Actif" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Actif")}
                  disabled={mode === "view"}
                >
                  Actif
                </Button>
                <Button
                  type="button"
                  variant={patientData.status === "Inactif" ? "default" : "outline"}
                  onClick={() => handleStatusChange("Inactif")}
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
                {isLoading ? "Enregistrement..." : patient ? "Modifier" : "Créer"}
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
