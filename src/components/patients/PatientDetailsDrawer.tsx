import { Patient } from "@/api/services/PatientService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Shield, User, Mail, Phone, Calendar, MapPin, FileText, Edit, Save, X } from "lucide-react";
import { useState } from "react";

interface PatientDetailsDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatePrescription: (patient: Patient) => void;
  onUpdate?: (patient: Patient, updates: Partial<Patient>) => Promise<void>;
}

export function PatientDetailsDrawer({ 
  patient, 
  isOpen, 
  onClose, 
  onCreatePrescription,
  onUpdate
}: PatientDetailsDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  
  if (!patient) return null;

  const handleSave = async () => {
    if (onUpdate && Object.keys(editedPatient).length > 0) {
      try {
        await onUpdate(patient, editedPatient);
        setIsEditing(false);
        setEditedPatient({});
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPatient({});
  };

  const getStatusBadge = (status: string) => {
    return status === "Actif" ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-md mx-auto max-h-[80vh]">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {patient.name}
          </DrawerTitle>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="absolute top-3 right-3 h-7 px-2 text-xs"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-y-auto">
          <div className="space-y-3">
            {/* Informations de base */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <User className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Nom</Label>
                  {isEditing ? (
                    <Input
                      value={editedPatient.name ?? patient.name}
                      onChange={(e) => setEditedPatient({...editedPatient, name: e.target.value})}
                      className="h-7 text-xs mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium truncate">{patient.name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedPatient.email ?? patient.email}
                      onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
                      className="h-7 text-xs mt-1"
                    />
                  ) : (
                    <p className="text-sm truncate">{patient.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Téléphone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedPatient.phone ?? patient.phone}
                      onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                      className="h-7 text-xs mt-1"
                    />
                  ) : (
                    <p className="text-sm">{patient.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Date de naissance</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedPatient.dob ?? patient.dob}
                      onChange={(e) => setEditedPatient({...editedPatient, dob: e.target.value})}
                      className="h-7 text-xs mt-1"
                    />
                  ) : (
                    <p className="text-sm">{patient.dob}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Assurance</Label>
                  {isEditing ? (
                    <Input
                      value={editedPatient.insurance ?? patient.insurance ?? ''}
                      onChange={(e) => setEditedPatient({...editedPatient, insurance: e.target.value})}
                      className="h-7 text-xs mt-1"
                      placeholder="Nom de l'assurance"
                    />
                  ) : (
                    <p className="text-sm">{patient.insurance || 'Aucune assurance'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Adresse</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedPatient.address ?? patient.address ?? ''}
                      onChange={(e) => setEditedPatient({...editedPatient, address: e.target.value})}
                      className="h-14 text-xs mt-1 resize-none"
                      placeholder="Adresse complète"
                    />
                  ) : (
                    <p className="text-sm">{patient.address || 'Non renseignée'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <div className="w-3 h-3 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${patient.status === 'Actif' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(patient.status)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Sauvegarder
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => onCreatePrescription(patient)}
                    className="w-full h-8 text-xs"
                    size="sm"
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Créer une Ordonnance
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={onClose}
                  size="sm"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}